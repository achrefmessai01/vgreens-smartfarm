import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * VSL-279 — EXPAND phase of consolidating scattered settings columns into one
 * jsonb container per table. No column is dropped here; the app dual-writes
 * old + new locations after this deploy, and a later CONTRACT migration drops
 * the deprecated columns once every reader/writer is cut over.
 *
 * tenants:
 *  - NEW `settings` jsonb NOT NULL DEFAULT '{}', backfilled from the three
 *    flat columns as
 *      { disabledSensorFields, hiddenHarvestDashboardItems, harvestDashboardOrder }.
 *  - `allowedDomains` (access control), `timezone` and `influxBucketName`
 *    (infrastructure) deliberately stay first-class columns.
 *  - Backfill NORMALIZES the pre-rename dashboard id 'yieldPerMeter' →
 *    'yieldPerRunningMeter' inside hiddenHarvestDashboardItems (VSL-279
 *    renamed the metric; at least one tenant still carries the old id, which
 *    no longer matches any dashboard item). The flat column keeps the legacy
 *    value verbatim — only the new canonical location is normalized. The
 *    hidden list is a set (order-irrelevant), so jsonb_agg(DISTINCT …) also
 *    de-dupes should a tenant carry both spellings.
 *
 * users (existing `userSettings` jsonb, nullable):
 *  - Merge the `preferredLanguage` and `farmOverviewTimeRange` scalars in as
 *    sibling keys of the existing `harvestView` key.
 *  - Null-handling rule: a NULL scalar contributes NO key (never `key: null`);
 *    a row where both scalars are NULL is left untouched (userSettings stays
 *    NULL = "use client defaults").
 *
 * Down (verified lossless for data written before AND during the expand
 * phase, because the app dual-writes both locations):
 *  - Copy the blob values back over the flat columns (blob wins — it is the
 *    canonical location after this migration), strip the merged keys from
 *    userSettings (restoring NULL where the object becomes empty), and drop
 *    tenants.settings. Note the 'yieldPerMeter' normalization is intentionally
 *    NOT reversed — the legacy id was already dead data.
 */
export class ConsolidateSettingsIntoJsonb1783600000000 implements MigrationInterface {
  name = 'ConsolidateSettingsIntoJsonb1783600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tenants"
        ADD COLUMN "settings" jsonb NOT NULL DEFAULT '{}'
    `);

    // Compose the blob from the flat columns. They are NOT NULL DEFAULT '[]',
    // but COALESCE guards each key anyway so a hand-touched row can't produce
    // a null-valued key. The hidden-items scalar subquery returns NULL for an
    // empty array (jsonb_agg over zero rows), hence its own COALESCE.
    await queryRunner.query(`
      UPDATE "tenants"
      SET "settings" = jsonb_build_object(
        'disabledSensorFields', COALESCE("disabledSensorFields", '[]'::jsonb),
        'hiddenHarvestDashboardItems', COALESCE(
          (
            SELECT jsonb_agg(DISTINCT CASE
              WHEN item = 'yieldPerMeter' THEN 'yieldPerRunningMeter'
              ELSE item
            END)
            FROM jsonb_array_elements_text(
              COALESCE("hiddenHarvestDashboardItems", '[]'::jsonb)
            ) AS t(item)
          ),
          '[]'::jsonb
        ),
        'harvestDashboardOrder', COALESCE("harvestDashboardOrder", '[]'::jsonb)
      )
    `);

    // Fold the two user scalars into userSettings. Rows with both scalars
    // NULL are excluded by the WHERE, so a NULL blob stays NULL there.
    await queryRunner.query(`
      UPDATE "users"
      SET "userSettings" = COALESCE("userSettings", '{}'::jsonb)
        || CASE WHEN "preferredLanguage" IS NOT NULL
             THEN jsonb_build_object('preferredLanguage', "preferredLanguage")
             ELSE '{}'::jsonb END
        || CASE WHEN "farmOverviewTimeRange" IS NOT NULL
             THEN jsonb_build_object('farmOverviewTimeRange', "farmOverviewTimeRange")
             ELSE '{}'::jsonb END
      WHERE "preferredLanguage" IS NOT NULL
         OR "farmOverviewTimeRange" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore the flat tenant columns from the blob (blob is canonical after
    // up; a key can only be missing if the row never went through up/dual-
    // write, in which case the flat column already holds the truth).
    await queryRunner.query(`
      UPDATE "tenants"
      SET
        "disabledSensorFields" = COALESCE(
          "settings"->'disabledSensorFields', "disabledSensorFields"
        ),
        "hiddenHarvestDashboardItems" = COALESCE(
          "settings"->'hiddenHarvestDashboardItems', "hiddenHarvestDashboardItems"
        ),
        "harvestDashboardOrder" = COALESCE(
          "settings"->'harvestDashboardOrder', "harvestDashboardOrder"
        )
    `);
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "settings"`);

    // Copy the merged user keys back to their columns, then strip them from
    // the blob. NULLIF restores NULL for users whose blob only ever held the
    // two merged keys (i.e. it was NULL before up created it).
    await queryRunner.query(`
      UPDATE "users"
      SET
        "preferredLanguage" = COALESCE(
          "userSettings"->>'preferredLanguage', "preferredLanguage"
        ),
        "farmOverviewTimeRange" = COALESCE(
          "userSettings"->>'farmOverviewTimeRange', "farmOverviewTimeRange"
        ),
        "userSettings" = NULLIF(
          "userSettings" - 'preferredLanguage' - 'farmOverviewTimeRange',
          '{}'::jsonb
        )
      WHERE "userSettings" IS NOT NULL
    `);
  }
}
