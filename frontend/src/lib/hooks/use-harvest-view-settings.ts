'use client';

import * as React from 'react';
import {
  useMeQuery,
  useUpdateMyHarvestViewSettingsMutation,
} from '@/generated/graphql';
import {
  parseHarvestView,
  toSettingsInput,
  type HarvestViewState,
} from '@/components/harvest/harvest-view-settings';

/**
 * Loads the signed-in user's persisted harvest-entry view preferences and
 * exposes a `persist` writer. Mirrors `useFarmOverviewTimeRange`: read from
 * `me`, write via the mutation with an optimistic cache update so the
 * preference follows the user across devices without a refetch.
 *
 * The page owns the live (possibly mid-edit / invalid) view state; this hook
 * only provides the hydrated starting value and a persist callback for valid
 * changes.
 */
export function useHarvestViewSettings() {
  const { data, loading } = useMeQuery({ fetchPolicy: 'cache-first' });
  const userId = data?.me?.id ?? null;

  const persistedValue = React.useMemo<HarvestViewState>(
    () => parseHarvestView(data?.me?.userSettings?.harvestView),
    [data?.me?.userSettings?.harvestView],
  );

  const [mutate] = useUpdateMyHarvestViewSettingsMutation();

  const persist = React.useCallback(
    (state: HarvestViewState) => {
      if (!userId) return;
      const input = toSettingsInput(state);
      void mutate({
        variables: { input },
        optimisticResponse: {
          __typename: 'Mutation',
          updateMyHarvestViewSettings: {
            __typename: 'User',
            id: userId,
            userSettings: {
              __typename: 'UserSettings',
              harvestView: {
                __typename: 'HarvestViewSettings',
                sort: {
                  __typename: 'HarvestViewSort',
                  field: input.sort.field,
                  direction: input.sort.direction,
                },
                range: input.range,
              },
            },
          },
        },
        update: (cache, result) => {
          const updated = result.data?.updateMyHarvestViewSettings;
          if (!updated) return;
          cache.modify({
            id: cache.identify({ __typename: 'User', id: updated.id }),
            fields: {
              userSettings: () => updated.userSettings,
            },
          });
        },
      }).catch((err) => {
        console.warn('[harvest-view] updateMyHarvestViewSettings failed', err);
      });
    },
    [mutate, userId],
  );

  return { persistedValue, persist, loading };
}
