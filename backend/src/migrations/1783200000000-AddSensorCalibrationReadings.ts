import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the two-point soil-moisture calibration reference readings to
 * `sensor_configs`:
 *  - `avgDryReading`       : the sensor's averaged raw reading in DRY soil
 *                            (maps to 0% moisture).
 *  - `avgSaturatedReading` : the sensor's averaged raw reading in SATURATED
 *                            soil (maps to 100% moisture).
 *
 * Both are `double precision` (matching every other physical measurement in the
 * schema) and nullable with no default: a sensor reads NULL until it is
 * calibrated, and the computed `correctedValue` resolver falls back to the raw
 * reading while either bound is NULL. Purely additive — existing rows are
 * untouched and no backfill is required.
 *
 * Note: the calibrated/corrected moisture value is NOT stored. It is recomputed
 * per query from the live raw reading + these two bounds (see SensorConfig's
 * `correctedValue` resolver field).
 */
export class AddSensorCalibrationReadings1783200000000 implements MigrationInterface {
  name = 'AddSensorCalibrationReadings1783200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sensor_configs" ADD COLUMN "avgDryReading" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "sensor_configs" ADD COLUMN "avgSaturatedReading" double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sensor_configs" DROP COLUMN "avgSaturatedReading"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sensor_configs" DROP COLUMN "avgDryReading"`,
    );
  }
}
