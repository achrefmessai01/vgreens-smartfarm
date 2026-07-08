'use client';

import { useGetSystemErrorStatsQuery } from '@/generated/graphql';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import * as React from 'react';

/**
 * Live count of unresolved system errors — used by the sidebar to render a
 * numeric badge next to the "System Errors" nav item. The backend returns the
 * stats blob as a JSON string, so we parse it once and pick out the
 * `unresolved` field.
 *
 * Only vGreens internal roles ever see the System Errors page (or the badge),
 * so we skip the query for everyone else to avoid the polling network chatter
 * on tenant sessions.
 */
export function useUnresolvedSystemErrorsCount(): number | null {
  const { isVGreensInternal } = useCurrentUser();
  const { data } = useGetSystemErrorStatsQuery({
    // Match the dashboard's polling cadence so the badge doesn't lag behind
    // the page a user might have open in another tab.
    pollInterval: 60_000,
    errorPolicy: 'all',
    skip: !isVGreensInternal,
  });

  return React.useMemo(() => {
    if (!data?.getSystemErrorStats) return null;
    try {
      const parsed = JSON.parse(data.getSystemErrorStats) as {
        unresolved?: number;
      };
      return typeof parsed.unresolved === 'number' ? parsed.unresolved : null;
    } catch {
      return null;
    }
  }, [data]);
}
