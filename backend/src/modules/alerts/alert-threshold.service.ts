import {
  THRESHOLD_RULES,
  type DeltaThresholdRule,
  type SingleThresholdRule,
  type CompositeThresholdRule,
} from './alert-threshold.rules';
import { Cron } from '@nestjs/schedule';
import { AlertsService } from './alerts.service';
import { Injectable, Logger } from '@nestjs/common';
import type { Alert } from './entities/alert.entity';
import { isInTimeGate } from './alert-threshold-time';
import { TenantsService } from '@modules/tenants/tenants.service';
import { InfluxDBService } from '@modules/influxdb/influxdb.service';

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

/** Check that condition holds for all points in the last persistenceMinutes (best effort: we have discrete points) */
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
        await this.checkTenant(tenant.id, bucket, tenant.timezone);
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
    await this.checkTenant(tenantId, bucketName, tenant?.timezone);
  }

  private async checkTenant(
    tenantId: string,
    bucketName: string,
    tenantTimezone?: string | null,
  ): Promise<void> {
    for (const rule of THRESHOLD_RULES) {
      try {
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
    for (const [device, points] of byDevice) {
      if (
        triggerHolds(
          points,
          rule.triggerOp,
          rule.triggerValue,
          rule.persistenceMinutes,
        )
      ) {
        const latest = points[points.length - 1];
        const existing: Alert | null =
          await this.alertsService.findOpenAlertForSensorAndRuleKey(
            tenantId,
            device,
            rule.ruleKey,
          );
        if (existing) {
          if (
            clearHolds(points, rule.clearOp, rule.clearValue, rule.clearMinutes)
          ) {
            await this.alertsService.resolveAlertBySystem(
              existing.id,
              tenantId,
            );
          }
          continue;
        }
        await this.alertsService.createAlert(
          {
            sensorName: device,
            value: String(latest.value),
            severity: rule.severity,
            description: `${rule.parameter} ${rule.triggerOp === 'gt' ? '>' : '<'} ${rule.triggerValue}. ${rule.rationale}`,
            timestamp: latest.time.toISOString(),
            field: rule.field,
            ruleKey: rule.ruleKey,
          },
          tenantId,
        );
      } else {
        const existing: Alert | null =
          await this.alertsService.findOpenAlertForSensorAndRuleKey(
            tenantId,
            device,
            rule.ruleKey,
          );
        if (
          existing &&
          clearHolds(points, rule.clearOp, rule.clearValue, rule.clearMinutes)
        ) {
          await this.alertsService.resolveAlertBySystem(existing.id, tenantId);
        }
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
    for (const device of devices) {
      const pointsA = byDeviceA.get(device) ?? [];
      const pointsB = byDeviceB.get(device) ?? [];
      const triggerA = triggerHolds(
        pointsA,
        rule.opA,
        rule.valueA,
        rule.persistenceMinutes,
      );
      const triggerB = triggerHolds(
        pointsB,
        rule.opB,
        rule.valueB,
        rule.persistenceMinutes,
      );
      if (triggerA && triggerB && pointsA.length > 0) {
        const latestA = pointsA[pointsA.length - 1];
        const existing: Alert | null =
          await this.alertsService.findOpenAlertForSensorAndRuleKey(
            tenantId,
            device,
            rule.ruleKey,
          );
        if (existing) {
          const clearA = clearHolds(
            pointsA,
            rule.clearOpA,
            rule.clearValueA,
            rule.clearMinutes,
          );
          const clearB = clearHolds(
            pointsB,
            rule.clearOpB,
            rule.clearValueB,
            rule.clearMinutes,
          );
          if (clearA || clearB) {
            await this.alertsService.resolveAlertBySystem(
              existing.id,
              tenantId,
            );
          }
          continue;
        }
        await this.alertsService.createAlert(
          {
            sensorName: device,
            value: `${rule.fieldA}=${latestA.value}`,
            severity: rule.severity,
            description: `${rule.parameter}: ${rule.fieldA} ${rule.opA} ${rule.valueA} & ${rule.fieldB} ${rule.opB} ${rule.valueB}. ${rule.rationale}`,
            timestamp: latestA.time.toISOString(),
            field: rule.fieldA,
            ruleKey: rule.ruleKey,
          },
          tenantId,
        );
      } else {
        const existing: Alert | null =
          await this.alertsService.findOpenAlertForSensorAndRuleKey(
            tenantId,
            device,
            rule.ruleKey,
          );
        if (existing) {
          const clearA = clearHolds(
            pointsA,
            rule.clearOpA,
            rule.clearValueA,
            rule.clearMinutes,
          );
          const clearB = clearHolds(
            pointsB,
            rule.clearOpB,
            rule.clearValueB,
            rule.clearMinutes,
          );
          if (clearA || clearB) {
            await this.alertsService.resolveAlertBySystem(
              existing.id,
              tenantId,
            );
          }
        }
      }
    }
  }

  private async evaluateDelta(
    tenantId: string,
    bucketName: string,
    rule: DeltaThresholdRule,
  ): Promise<void> {
    const windowMin = rule.windowMinutes + Math.max(rule.clearMinutes, 10);
    const rows = await this.influxDBService.getBucketData(bucketName, {
      start: `-${windowMin}m`,
      limit: 500,
      field: rule.field,
    });
    const byDevice = groupByDevice(rows);
    for (const [device, points] of byDevice) {
      if (points.length < 2) continue;
      const cutoff = new Date(Date.now() - rule.windowMinutes * 60 * 1000);
      const inWindow = points.filter((p) => p.time >= cutoff);
      if (inWindow.length < 2) continue;
      const first = inWindow[0].value;
      const last = inWindow[inWindow.length - 1].value;
      const delta = last - first;
      const triggered =
        rule.direction === 'drop'
          ? delta < -rule.threshold
          : delta > rule.threshold;
      if (triggered) {
        const existing: Alert | null =
          await this.alertsService.findOpenAlertForSensorAndRuleKey(
            tenantId,
            device,
            rule.ruleKey,
          );
        if (existing) {
          const clearCutoff = new Date(
            Date.now() - rule.clearMinutes * 60 * 1000,
          );
          const recent = points.filter((p) => p.time >= clearCutoff);
          const deltaVal =
            recent.length >= 2
              ? recent[recent.length - 1].value - recent[0].value
              : 0;
          const stable =
            recent.length >= 2 && Math.abs(deltaVal) <= rule.threshold * 0.5;
          if (stable) {
            await this.alertsService.resolveAlertBySystem(
              existing.id,
              tenantId,
            );
          }
          continue;
        }
        const latest = inWindow[inWindow.length - 1];
        await this.alertsService.createAlert(
          {
            sensorName: device,
            value: String(latest.value),
            severity: rule.severity,
            description: `${rule.parameter}: ${rule.direction} ${Math.abs(delta).toFixed(3)} in ${rule.windowMinutes}m. ${rule.rationale}`,
            timestamp: latest.time.toISOString(),
            field: rule.field,
            ruleKey: rule.ruleKey,
          },
          tenantId,
        );
      } else {
        const existing: Alert | null =
          await this.alertsService.findOpenAlertForSensorAndRuleKey(
            tenantId,
            device,
            rule.ruleKey,
          );
        if (existing) {
          const clearCutoff = new Date(
            Date.now() - rule.clearMinutes * 60 * 1000,
          );
          const recent = points.filter((p) => p.time >= clearCutoff);
          const deltaVal =
            recent.length >= 2
              ? recent[recent.length - 1].value - recent[0].value
              : 0;
          const stable =
            recent.length >= 2 && Math.abs(deltaVal) <= rule.threshold * 0.5;
          if (stable) {
            await this.alertsService.resolveAlertBySystem(
              existing.id,
              tenantId,
            );
          }
        }
      }
    }
  }
}
