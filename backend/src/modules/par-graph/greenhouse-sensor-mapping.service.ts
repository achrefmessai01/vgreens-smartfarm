import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SensorConfigService } from '@modules/sensor-config/sensor-config.service';
import { TenantsService } from '@modules/tenants/tenants.service';

/**
 * One greenhouse and the device IDs that belong to it, as derived from
 * the Postgres `sensor_configs` table. Names are taken verbatim from
 * `tenants.greenhouses[].name` (the authoritative list).
 */
export interface GreenhouseDevices {
  name: string;
  devices: string[];
}

/**
 * Result of resolving a tenant's sensor→greenhouse mapping.
 *
 * `configured` is returned only when at least one greenhouse defined on
 * the tenant has at least one matching device row in `sensor_configs`.
 * Otherwise we explicitly return `fallback` to signal the caller that no
 * per-greenhouse breakdown is available and the PAR view should be
 * computed over every lux sensor in the bucket.
 */
export type TenantSensorMapping =
  | {
      kind: 'configured';
      bucketName: string;
      timezone?: string;
      greenhouses: GreenhouseDevices[];
      /** Union of all devices across greenhouses, deduplicated, order-preserving. */
      allMappedDevices: string[];
    }
  | {
      kind: 'fallback';
      bucketName: string;
      timezone?: string;
    };

@Injectable()
export class GreenhouseSensorMappingService {
  private readonly logger = new Logger(GreenhouseSensorMappingService.name);

  constructor(
    private readonly tenantsService: TenantsService,
    private readonly sensorConfigService: SensorConfigService,
  ) {}

  /**
   * Builds the mapping for a tenant by joining `sensor_configs` rows with
   * the tenant's declared greenhouses. Rows whose `greenhouse` value
   * doesn't match any of `tenant.greenhouses[].name` are dropped (logged
   * at debug) — this enforces the invariant called out in the spec:
   *
   *   "The value in the greenhouse field should always match with one of
   *    the greenhouses defined in the jsonb blob in the related tenant."
   */
  async getMapping(tenantId: string): Promise<TenantSensorMapping> {
    const tenant = await this.tenantsService.findOne(tenantId);
    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }
    if (!tenant.influxBucketName) {
      throw new NotFoundException(
        `Tenant ${tenantId} has no influxBucketName configured`,
      );
    }

    const bucketName = tenant.influxBucketName;
    const timezone = tenant.timezone ?? undefined;

    const declaredGreenhouseNames = new Set(
      (tenant.greenhouses ?? []).map((g) => g.name),
    );
    if (declaredGreenhouseNames.size === 0) {
      return { kind: 'fallback', bucketName, timezone };
    }

    const sensorConfigs =
      await this.sensorConfigService.findAllByTenant(tenantId);

    const byGreenhouse = new Map<string, string[]>();
    for (const config of sensorConfigs) {
      const greenhouseName = config.greenhouse?.trim();
      if (!greenhouseName) continue;
      if (!declaredGreenhouseNames.has(greenhouseName)) {
        this.logger.debug(
          `Tenant ${tenantId}: sensor_config "${config.device}" maps to greenhouse "${greenhouseName}" which is not declared on the tenant — ignored`,
        );
        continue;
      }

      const list = byGreenhouse.get(greenhouseName);
      if (list) {
        if (!list.includes(config.device)) list.push(config.device);
      } else {
        byGreenhouse.set(greenhouseName, [config.device]);
      }
    }

    if (byGreenhouse.size === 0) {
      return { kind: 'fallback', bucketName, timezone };
    }

    // Preserve the order in which the tenant declared greenhouses so the
    // response is stable for the frontend (tabs/labels read directly off
    // `tenant.greenhouses`).
    const greenhouses: GreenhouseDevices[] = (tenant.greenhouses ?? [])
      .map((g) => ({ name: g.name, devices: byGreenhouse.get(g.name) ?? [] }))
      .filter((g) => g.devices.length > 0);

    const seen = new Set<string>();
    const allMappedDevices: string[] = [];
    for (const gh of greenhouses) {
      for (const device of gh.devices) {
        if (seen.has(device)) continue;
        seen.add(device);
        allMappedDevices.push(device);
      }
    }

    return {
      kind: 'configured',
      bucketName,
      timezone,
      greenhouses,
      allMappedDevices,
    };
  }
}
