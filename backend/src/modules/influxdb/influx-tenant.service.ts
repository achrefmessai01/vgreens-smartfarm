import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { Tenant } from '@modules/tenants/entities/tenant.entity';

@Injectable()
export class InfluxTenantService {
  private readonly logger = new Logger(InfluxTenantService.name);

  constructor(private readonly configService: ConfigService) { }


  buildBucketName(tenant: Pick<Tenant, 'id'>): string {
    return `tenant_${tenant.id}`;
  }


  async ensureBucketForTenant(
    tenant: Pick<Tenant, 'id'>,
    bucketName: string,
  ): Promise<void> {
    const host = this.configService.get<string>('INFLUXDB_URL');
    const token = this.configService.get<string>('INFLUXDB_TOKEN');
    const org = this.configService.get<string>('INFLUXDB_ORG');

    if (!host || !token || !org) {
      this.logger.warn(
        'Skipping Influx bucket creation – INFLUXDB_URL, INFLUXDB_TOKEN or INFLUXDB_ORG is missing',
      );
      return;
    }

    try {
      const url = `${host.replace(/\/$/, '')}/api/v2/buckets`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          org,
          name: bucketName,
          retentionRules: [
            {
              type: 'expire',
              everySeconds: 60 * 60 * 24 * 30, // 30 days
            },
          ],
        }),
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => '');
        if (response.status === 409) {
          this.logger.log(
            `Influx bucket "${bucketName}" already exists for tenant ${tenant.id}`,
          );
          return;
        }

        this.logger.warn(
          `Failed to create Influx bucket "${bucketName}" for tenant ${tenant.id}: ` +
          `${response.status} ${response.statusText} ${bodyText}`,
        );
        return;
      }

      this.logger.log(
        `Created Influx bucket "${bucketName}" for tenant ${tenant.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error while creating Influx bucket "${bucketName}" for tenant ${tenant.id}`,
        error as Error,
      );
    }
  }
}

