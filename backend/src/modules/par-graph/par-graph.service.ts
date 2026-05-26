import { Injectable, Logger } from '@nestjs/common';
import { InfluxDBService } from '@modules/influxdb/influxdb.service';
import { GreenhouseSensorMappingService } from './greenhouse-sensor-mapping.service';
import { GreenhouseParDli, TenantParDli } from './dto';

@Injectable()
export class ParGraphService {
  private readonly logger = new Logger(ParGraphService.name);

  constructor(
    private readonly mappingService: GreenhouseSensorMappingService,
    private readonly influxDBService: InfluxDBService,
  ) {}

  /**
   * Builds the PAR/DLI payload for a tenant by composing:
   *   - the sensor→greenhouse mapping resolved from Postgres
   *     (`sensor_configs`), and
   *   - the device-scoped Flux PAR/DLI calculation from `InfluxDBService`.
   *
   * Branches:
   *   - **configured** tenants: one PAR/DLI per declared greenhouse, plus
   *     a combined view computed over the *union of mapped devices only*.
   *     Devices that aren't mapped to a greenhouse (e.g. sky-reference
   *     `Lux_03` / `Lux_08` on Knaup) are deliberately excluded from the
   *     combined view to keep the curve representative of the canopy.
   *   - **fallback** tenants: a single combined view across every lux
   *     sensor in the bucket, and an empty `greenhouses` array.
   *
   * The deprecated InfluxDB `greenhouse` tag is never used as a filter:
   * the only source of truth for grouping is the Postgres mapping.
   */
  async getTenantParDli(
    tenantId: string,
    timezone?: string,
  ): Promise<TenantParDli> {
    const mapping = await this.mappingService.getMapping(tenantId);
    const effectiveTimezone = timezone ?? mapping.timezone;

    if (mapping.kind === 'fallback') {
      this.logger.debug(
        `getTenantParDli(${tenantId}): fallback path — no sensor→greenhouse mapping configured`,
      );
      const combined = await this.influxDBService.getParDliForDevices(
        mapping.bucketName,
        { timezone: effectiveTimezone },
      );
      return { combined, greenhouses: [] };
    }

    const perGreenhousePromises = mapping.greenhouses.map(
      async (gh): Promise<GreenhouseParDli> => ({
        name: gh.name,
        data: await this.influxDBService.getParDliForDevices(
          mapping.bucketName,
          { devices: gh.devices, timezone: effectiveTimezone },
        ),
      }),
    );

    const combinedPromise = this.influxDBService.getParDliForDevices(
      mapping.bucketName,
      {
        devices: mapping.allMappedDevices,
        timezone: effectiveTimezone,
      },
    );

    const [greenhouses, combined] = await Promise.all([
      Promise.all(perGreenhousePromises),
      combinedPromise,
    ]);

    this.logger.debug(
      `getTenantParDli(${tenantId}): configured path — ${greenhouses.length} greenhouses, ${mapping.allMappedDevices.length} mapped devices`,
    );

    return { combined, greenhouses };
  }
}
