import { BadRequestException } from '@nestjs/common';
import { UserSettings, HarvestViewSettingsInput } from '../dto/user-settings';

/**
 * Shallow-merge a patch into the existing userSettings blob. Top-level keys
 * present in `patch` replace their counterpart; every other existing key is
 * preserved untouched. This is what keeps a `harvestView` write from clobbering
 * sibling feature settings that may live alongside it later.
 */
export function mergeUserSettings(
  existing: UserSettings | Record<string, unknown> | null | undefined,
  patch: Partial<UserSettings>,
): UserSettings {
  return { ...(existing ?? {}), ...patch } as UserSettings;
}

/**
 * Cross-field validation that class-validator can't express on its own: when
 * both date bounds are present, `from` must not be after `to`. Field enum
 * membership and YYYY-MM-DD format are already enforced by the InputType's
 * decorators at the GraphQL layer. Throws BadRequestException on violation.
 */
export function assertValidHarvestViewSettings(
  input: HarvestViewSettingsInput,
): void {
  const { from, to } = input.dateRange ?? {};
  if (from && to && from > to) {
    throw new BadRequestException(
      `Invalid date range: from (${from}) must be on or before to (${to})`,
    );
  }
}
