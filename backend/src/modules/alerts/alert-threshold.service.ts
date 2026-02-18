import { Cron } from '@nestjs/schedule';
import { AlertSeverity } from '@common/enums';
import { AlertsService } from './alerts.service';
import { Injectable, Logger } from '@nestjs/common';
import { InfluxDBService } from '@modules/influxdb/influxdb.service';
import { TenantsService } from '@modules/tenants/tenants.service';

function toStr(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return undefined;
}

const THRESHOLD_RULES: Array<{
  field: string;
  minValue: number;
  maxValue: number;
  severity: AlertSeverity;
  greenhouse?: string;
  measurement?: string;
}> = [
  {
    field: 'temperature',
    minValue: 20,
    maxValue: 25,
    severity: AlertSeverity.CRITICAL,
  },
];

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
        await this.checkTenant(tenant.id, tenant.influxBucketName);
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
    await this.checkTenant(tenantId, bucketName);
  }

  private async checkTenant(
    tenantId: string,
    bucketName: string,
  ): Promise<void> {
    for (const rule of THRESHOLD_RULES) {
      try {
        const rows = await this.influxDBService.getBucketData(bucketName, {
          start: '-5m',
          limit: 500,
          field: rule.field,
          greenhouse: rule.greenhouse ?? undefined,
        });
        for (const influxRow of rows) {
          const value = influxRow['_value'];
          const time = influxRow['_time'];
          const device = influxRow['device'];
          if (
            typeof value !== 'number' ||
            typeof device !== 'string' ||
            !device
          ) {
            continue;
          }
          if (value < rule.minValue || value > rule.maxValue) {
            const sensorName = String(device);
            const valueStr = String(value);
            const existing =
              await this.alertsService.findOpenAlertForSensorWithValue(
                tenantId,
                sensorName,
                valueStr,
              );
            if (existing) continue;
            const ts =
              time instanceof Date
                ? time
                : typeof time === 'string'
                  ? new Date(time)
                  : new Date();
            await this.alertsService.createAlert(
              {
                sensorName,
                value: valueStr,
                severity: rule.severity,
                description: `${rule.field} out of range (min ${rule.minValue}, max ${rule.maxValue})`,
                timestamp: ts.toISOString(),
                field: toStr(influxRow['_field']) ?? rule.field,
                measurement: toStr(influxRow['_measurement']),
                device: toStr(influxRow['device']) ?? sensorName,
                greenhouse: toStr(influxRow['greenhouse']),
                city: toStr(influxRow['city']),
                column: toStr(influxRow['column']),
                row: toStr(influxRow['row']),
                profile: toStr(influxRow['profile']),
              },
              tenantId,
            );
          }
        }
      } catch (err) {
        this.logger.warn(
          `Tenant ${tenantId} rule ${rule.field}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }
}
