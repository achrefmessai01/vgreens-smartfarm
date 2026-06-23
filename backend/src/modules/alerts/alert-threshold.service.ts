import {
  THRESHOLD_RULES,
  type DeltaThresholdRule,
  type SingleThresholdRule,
  type CompositeThresholdRule,
} from './alert-threshold.rules';
import { Cron } from '@nestjs/schedule';
import { AlertsService } from './alerts.service';
import { Injectable, Logger } from '@nestjs/common';
import { isInTimeGate } from './alert-threshold-time';
import { TenantsService } from '@modules/tenants/tenants.service';
import { InfluxDBService } from '@modules/influxdb/influxdb.service';

const FIELD_DISPLAY_NAMES: Record<string, string> = {
  temperature: 'Air Temperature',
  humidity: 'Humidity',
  vpd: 'VPD',
  soil_moisture: 'Soil Moisture',
  soil_ec: 'Soil EC',
  soil_temp: 'Root Temperature',
  par: 'DLI / PAR',
  co2: 'CO2',
};

function fieldDisplayName(field: string): string {
  return FIELD_DISPLAY_NAMES[field] ?? field;
}

function parseTime(v: unknown): Date {
  if (v instanceof Date) return v;
  if (typeof v === 'string') return new Date(v);
  return new Date();
}

type InfluxRow = Record<string, unknown>;

function groupByDevice(
  rows: InfluxRow[],
): Map<string, { value: number; time: Date }[]> {
  const byDevice = new Map<string, { value: number; time: Date }[]>();
  for (const r of rows) {
    const device = r['device'];
    const value = r['_value'];
    const time = parseTime(r['_time']);
    if (typeof device !== 'string' || !device || typeof value !== 'number')
      continue;
    let list = byDevice.get(device);
    if (!list) {
      list = [];
      byDevice.set(device, list);
    }
    list.push({ value, time });
  }
  byDevice.forEach((list) =>
    list.sort((a, b) => a.time.getTime() - b.time.getTime()),
  );
  return byDevice;
}

function satisfiesOp(
  value: number,
  op: 'gt' | 'lt',
  threshold: number,
): boolean {
  return op === 'gt' ? value > threshold : value < threshold;
}

function triggerHolds(
  points: { value: number; time: Date }[],
  op: 'gt' | 'lt',
  threshold: number,
  persistenceMinutes: number,
): boolean {
  if (points.length === 0) return false;
  const cutoff = new Date(Date.now() - persistenceMinutes * 60 * 1000);
  const inWindow = points.filter((p) => p.time >= cutoff);
  return (
    inWindow.length > 0 &&
    inWindow.every((p) => satisfiesOp(p.value, op, threshold))
  );
}

function clearHolds(
  points: { value: number; time: Date }[],
  op: 'gt' | 'lt',
  threshold: number,
  clearMinutes: number,
): boolean {
  if (points.length === 0) return false;
  const cutoff = new Date(Date.now() - clearMinutes * 60 * 1000);
  const inWindow = points.filter((p) => p.time >= cutoff);
  return (
    inWindow.length > 0 &&
    inWindow.every((p) => satisfiesOp(p.value, op, threshold))
  );
}

@Injectable()
export class AlertThresholdService {
  private readonly logger = new Logger(AlertThresholdService.name);

  constructor(
    private readonly alertsService: AlertsService,
    private readonly influxDBService: InfluxDBService,
    private readonly tenantsService: TenantsService,
  ) {}

  @Cron('*/5 * * * *')
  async runThresholdCheck(): Promise<void> {
    this.logger.debug('Running threshold check');
    try {
      const tenants = await this.tenantsService.findAll();
      const withBucket = tenants.filter(
        (t) => t.isActive && t.influxBucketName,
      );
      for (const tenant of withBucket) {
        const bucket = tenant.influxBucketName;
        if (!bucket) continue;
        await this.checkTenant(
          tenant.id,
          bucket,
          tenant.timezone,
          tenant.disabledSensorFields ?? [],
        );
      }
    } catch (error) {
      this.logger.error(
        `Threshold check failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async runThresholdCheckForBucket(
    tenantId: string,
    bucketName: string,
  ): Promise<void> {
    const tenant = await this.tenantsService.findOne(tenantId);
    await this.checkTenant(
      tenantId,
      bucketName,
      tenant?.timezone,
      tenant?.disabledSensorFields ?? [],
    );
  }

  private isRuleDisabled(
    rule: SingleThresholdRule | CompositeThresholdRule | DeltaThresholdRule,
    disabled: Set<string>,
  ): boolean {
    if (rule.type === 'composite') {
      // Composite rules need both fields; disabling either one disables the rule.
      return disabled.has(rule.fieldA) || disabled.has(rule.fieldB);
    }
    return disabled.has(rule.field);
  }

  private async checkTenant(
    tenantId: string,
    bucketName: string,
    tenantTimezone?: string | null,
    disabledSensorFields: string[] = [],
  ): Promise<void> {
    const disabled = new Set(disabledSensorFields);
    for (const rule of THRESHOLD_RULES) {
      try {
        if (this.isRuleDisabled(rule, disabled)) continue;
        if (!isInTimeGate(rule.timeGate, tenantTimezone)) continue;
        if (rule.type === 'single') {
          await this.evaluateSingle(tenantId, bucketName, rule);
        } else if (rule.type === 'composite') {
          await this.evaluateComposite(tenantId, bucketName, rule);
        } else {
          await this.evaluateDelta(tenantId, bucketName, rule);
        }
      } catch (err) {
        this.logger.warn(
          `Tenant ${tenantId} rule ${rule.ruleKey}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }

  private async evaluateSingle(
    tenantId: string,
    bucketName: string,
    rule: SingleThresholdRule,
  ): Promise<void> {
    const windowMin = Math.max(rule.persistenceMinutes, rule.clearMinutes) + 5;
    const rows = await this.influxDBService.getBucketData(bucketName, {
      start: `-${windowMin}m`,
      limit: 1000,
      field: rule.field,
    });
    const byDevice = groupByDevice(rows);

    const violating: {
      device: string;
      latest: { value: number; time: Date };
    }[] = [];
    for (const [device, points] of byDevice) {
      if (
        triggerHolds(
          points,
          rule.triggerOp,
          rule.triggerValue,
          rule.persistenceMinutes,
        )
      ) {
        violating.push({ device, latest: points[points.length - 1] });
      }
    }

    const existing = await this.alertsService.findOpenAlertForField(
      tenantId,
      rule.field,
    );

    if (violating.length > 0) {
      if (!existing) {
        const worst = violating.reduce((a, b) =>
          rule.triggerOp === 'gt'
            ? a.latest.value >= b.latest.value
              ? a
              : b
            : a.latest.value <= b.latest.value
              ? a
              : b,
        );
        const deviceList = violating.map((v) => v.device).join(', ');
        await this.alertsService.createAlert(
          {
            sensorName: fieldDisplayName(rule.field),
            value: String(worst.latest.value),
            severity: rule.severity,
            description: `${violating.length} sensor(s) affected: ${deviceList}. ${rule.parameter} ${rule.triggerOp === 'gt' ? '>' : '<'} ${rule.triggerValue}. ${rule.rationale}`,
            timestamp: worst.latest.time.toISOString(),
            field: rule.field,
            ruleKey: rule.ruleKey,
          },
          tenantId,
        );
      }
    } else if (existing) {
      const allClear =
        byDevice.size === 0 ||
        [...byDevice.values()].every((points) =>
          clearHolds(points, rule.clearOp, rule.clearValue, rule.clearMinutes),
        );
      if (allClear) {
        await this.alertsService.resolveAlertBySystem(existing.id, tenantId);
      }
    }
  }

  private async evaluateComposite(
    tenantId: string,
    bucketName: string,
    rule: CompositeThresholdRule,
  ): Promise<void> {
    const windowMin = Math.max(rule.persistenceMinutes, rule.clearMinutes) + 5;
    const [rowsA, rowsB] = await Promise.all([
      this.influxDBService.getBucketData(bucketName, {
        start: `-${windowMin}m`,
        limit: 500,
        field: rule.fieldA,
      }),
      this.influxDBService.getBucketData(bucketName, {
        start: `-${windowMin}m`,
        limit: 500,
        field: rule.fieldB,
      }),
    ]);
    const byDeviceA = groupByDevice(rowsA);
    const byDeviceB = groupByDevice(rowsB);
    const devices = new Set([...byDeviceA.keys(), ...byDeviceB.keys()]);

    const violating: {
      device: string;
      latestA: { value: number; time: Date };
    }[] = [];
    for (const device of devices) {
      const pointsA = byDeviceA.get(device) ?? [];
      const pointsB = byDeviceB.get(device) ?? [];
      if (
        triggerHolds(pointsA, rule.opA, rule.valueA, rule.persistenceMinutes) &&
        triggerHolds(pointsB, rule.opB, rule.valueB, rule.persistenceMinutes) &&
        pointsA.length > 0
      ) {
        violating.push({ device, latestA: pointsA[pointsA.length - 1] });
      }
    }

    const existing = await this.alertsService.findOpenAlertForField(
      tenantId,
      rule.fieldA,
    );

    if (violating.length > 0) {
      if (!existing) {
        const deviceList = violating.map((v) => v.device).join(', ');
        const first = violating[0];
        await this.alertsService.createAlert(
          {
            sensorName: fieldDisplayName(rule.fieldA),
            value: `${rule.fieldA}=${first.latestA.value}`,
            severity: rule.severity,
            description: `${violating.length} sensor(s) affected: ${deviceList}. ${rule.parameter}: ${rule.fieldA} ${rule.opA} ${rule.valueA} & ${rule.fieldB} ${rule.opB} ${rule.valueB}. ${rule.rationale}`,
            timestamp: first.latestA.time.toISOString(),
            field: rule.fieldA,
            ruleKey: rule.ruleKey,
          },
          tenantId,
        );
      }
    } else if (existing) {
      const allClear =
        devices.size === 0 ||
        [...devices].every((device) => {
          const pointsA = byDeviceA.get(device) ?? [];
          const pointsB = byDeviceB.get(device) ?? [];
          return (
            clearHolds(
              pointsA,
              rule.clearOpA,
              rule.clearValueA,
              rule.clearMinutes,
            ) ||
            clearHolds(
              pointsB,
              rule.clearOpB,
              rule.clearValueB,
              rule.clearMinutes,
            )
          );
        });
      if (allClear) {
        await this.alertsService.resolveAlertBySystem(existing.id, tenantId);
      }
    }
  }

  private async evaluateDelta(
    tenantId: string,
    bucketName: string,
    rule: DeltaThresholdRule,
  ): Promise<void> {
    const windowMin = rule.windowMinutes + Math.max(rule.clearMinutes, 10);
    const [rows, guardRows] = await Promise.all([
      this.influxDBService.getBucketData(bucketName, {
        start: `-${windowMin}m`,
        limit: 500,
        field: rule.field,
      }),
      rule.guardField
        ? this.influxDBService.getBucketData(bucketName, {
            start: `-${windowMin}m`,
            limit: 500,
            field: rule.guardField,
          })
        : Promise.resolve([]),
    ]);
    const byDevice = groupByDevice(rows);
    const byDeviceGuard = rule.guardField
      ? groupByDevice(guardRows)
      : new Map<string, { value: number; time: Date }[]>();

    const violating: {
      device: string;
      delta: number;
      latest: { value: number; time: Date };
    }[] = [];

    for (const [device, points] of byDevice) {
      if (points.length < 2) continue;
      const cutoff = new Date(Date.now() - rule.windowMinutes * 60 * 1000);
      const inWindow = points.filter((p) => p.time >= cutoff);
      if (inWindow.length < 2) continue;
      const delta = inWindow[inWindow.length - 1].value - inWindow[0].value;
      const triggered =
        rule.direction === 'drop'
          ? delta < -rule.threshold
          : delta > rule.threshold;
      if (!triggered) continue;

      // Check guard condition if defined (e.g. VPD > 2.3 for vwc_rapid_drydown)
      if (
        rule.guardField &&
        rule.guardOp !== undefined &&
        rule.guardValue !== undefined
      ) {
        const guardPoints = byDeviceGuard.get(device) ?? [];
        const guardInWindow = guardPoints.filter((p) => p.time >= cutoff);
        const guardPasses =
          guardInWindow.length > 0 &&
          guardInWindow.every((p) =>
            satisfiesOp(p.value, rule.guardOp!, rule.guardValue!),
          );
        if (!guardPasses) continue;
      }

      violating.push({
        device,
        delta,
        latest: inWindow[inWindow.length - 1],
      });
    }

    const existing = await this.alertsService.findOpenAlertForField(
      tenantId,
      rule.field,
    );

    if (violating.length > 0) {
      if (!existing) {
        const worst = violating.reduce((a, b) =>
          rule.direction === 'drop'
            ? a.delta <= b.delta
              ? a
              : b
            : a.delta >= b.delta
              ? a
              : b,
        );
        const deviceList = violating.map((v) => v.device).join(', ');
        await this.alertsService.createAlert(
          {
            sensorName: fieldDisplayName(rule.field),
            value: String(worst.latest.value),
            severity: rule.severity,
            description: `${violating.length} sensor(s) affected: ${deviceList}. ${rule.parameter}: ${rule.direction} of ${Math.abs(worst.delta).toFixed(3)} in ${rule.windowMinutes}m. ${rule.rationale}`,
            timestamp: worst.latest.time.toISOString(),
            field: rule.field,
            ruleKey: rule.ruleKey,
          },
          tenantId,
        );
      }
    } else if (existing) {
      const allStable =
        byDevice.size === 0 ||
        [...byDevice.values()].every((points) => {
          const clearCutoff = new Date(
            Date.now() - rule.clearMinutes * 60 * 1000,
          );
          const recent = points.filter((p) => p.time >= clearCutoff);
          const deltaVal =
            recent.length >= 2
              ? recent[recent.length - 1].value - recent[0].value
              : 0;
          return (
            recent.length >= 2 && Math.abs(deltaVal) <= rule.threshold * 0.5
          );
        });
      if (allStable) {
        await this.alertsService.resolveAlertBySystem(existing.id, tenantId);
      }
    }
  }
}
