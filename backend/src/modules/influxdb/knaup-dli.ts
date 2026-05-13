/**
 * Tenant-specific DLI calculation for knaup.
 *
 * The DLI for each knaup greenhouse is computed from a fixed set of lux
 * sensors (not the InfluxDB `greenhouse` tag, which is unreliable for this
 * bucket). The greenhouse names below match the `name` values in
 * `tenant.greenhouses` (the supabase jsonb), which is what the API client
 * sends as the `greenhouse` parameter.
 *
 * Pipeline (applied in Flux, see `InfluxDBService.getTodayParCumulativeDliKnaup`):
 *   1. Filter `_field == "lux"` AND `device in <group>`.
 *   2. Aggregate each device to 5-minute means.
 *   3. Average the 4 device means per 5-minute slot.
 *   4. Convert lux → PAR (µmol m⁻² s⁻¹) via lux / 55.
 *   5. Integrate via Riemann sum (× 300 s per slot), then µmol → mol (÷ 1e6).
 *   6. cumulativeSum from midnight gives the live DLI curve in mol m⁻².
 */

// TODO: replace with the target tenant's influxBucketName lookup.
const TARGET_BUCKET_NAME = 'knaup_ed458942-f834-4f06-aa21-8d46b5ed8829';

export const KNAUP_DLI = {
  bucketName: TARGET_BUCKET_NAME,
  luxFieldName: 'lux',
  luxToPar: 55,
  intervalSeconds: 300,
  greenhouseSensors: {
    'Greenhouse 1': ['lux_01', 'lux_02', 'lux_04', 'lux_05'],
    'Greenhouse 2': ['lux_06', 'lux_07', 'lux_09', 'lux_10'],
  } as Record<string, readonly string[]>,
} as const;

export function isKnaupBucket(bucketName: string): boolean {
  return bucketName === KNAUP_DLI.bucketName;
}

export function getKnaupLuxDevices(
  greenhouse: string,
): readonly string[] | null {
  return KNAUP_DLI.greenhouseSensors[greenhouse] ?? null;
}
