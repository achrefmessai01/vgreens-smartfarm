import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Pipeline smoke test — proves the migration runner reaches the target DB
 * and executes a migration end-to-end.
 *
 * Safe to run on staging and production: creates one throwaway table
 * (`migration_pipeline_smoke_test`), writes a single row recording the run,
 * and `down()` cleanly drops it. The table name is namespaced so it cannot
 * collide with any domain entity.
 *
 * After the pipeline run is verified:
 *   1. Run `npm run migration:revert:prod` on each environment where it was
 *      applied (or just drop the table manually).
 *   2. Delete this file from `src/migrations/`.
 *   3. Commit the deletion so the smoke test doesn't show up forever in
 *      `migration:show`.
 */
export class PipelineSmokeTest1782388800000 implements MigrationInterface {
  name = 'PipelineSmokeTest1782388800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS migration_pipeline_smoke_test (
        id          SERIAL PRIMARY KEY,
        ran_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        environment TEXT,
        note        TEXT NOT NULL
      )
    `);
    await queryRunner.query(
      `INSERT INTO migration_pipeline_smoke_test (environment, note)
       VALUES ($1, $2)`,
      [
        process.env.NODE_ENV ?? 'unknown',
        'Pipeline migration runner reached the DB and applied a migration successfully.',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS migration_pipeline_smoke_test`,
    );
  }
}
