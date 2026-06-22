import { UserSettings } from '../dto/user-settings';

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
