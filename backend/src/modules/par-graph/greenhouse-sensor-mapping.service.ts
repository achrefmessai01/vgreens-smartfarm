import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SensorConfigService } from '@modules/sensor-config/sensor-config.service';
import { TenantsService } from '@modules/tenants/tenants.service';
import { GreenhouseService } from '@modules/greenhouse/greenhouse.service';

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
    private readonly greenhouseService: GreenhouseService,
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

    // Greenhouses are the single source of truth in the dedicated table.
    const declaredGreenhouses =
      await this.greenhouseService.findAllScoped(tenantId);
    if (declaredGreenhouses.length === 0) {
      return { kind: 'fallback', bucketName, timezone };
    }
    const declaredIds = new Set(declaredGreenhouses.map((g) => g.id));

    const sensorConfigs =
      await this.sensorConfigService.findAllByTenant(tenantId);

    // Match sensors to greenhouses by greenhouseId (the FK) rather than by
    // name, so a name typo/mismatch can never silently drop a sensor.
    const byGreenhouseId = new Map<string, string[]>();
    for (const config of sensorConfigs) {
      const greenhouseId = config.greenhouseId;
      if (!greenhouseId) continue;
      if (!declaredIds.has(greenhouseId)) {
        this.logger.debug(
          `Tenant ${tenantId}: sensor_config "${config.device}" references greenhouse ${greenhouseId} which is not in the tenant's greenhouses — ignored`,
        );
        continue;
      }

      const list = byGreenhouseId.get(greenhouseId);
      if (list) {
        if (!list.includes(config.device)) list.push(config.device);
      } else {
        byGreenhouseId.set(greenhouseId, [config.device]);
      }
    }

    if (byGreenhouseId.size === 0) {
      return { kind: 'fallback', bucketName, timezone };
    }

    // Preserve the order in which greenhouses are declared so the response is
    // stable for the frontend tabs/labels.
    const greenhouses: GreenhouseDevices[] = declaredGreenhouses
      .map((g) => ({ name: g.name, devices: byGreenhouseId.get(g.id) ?? [] }))
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
