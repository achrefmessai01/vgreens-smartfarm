'use client';

import * as React from 'react';

const STORAGE_KEY = 'sidebarCollapsed';

interface UseSidebarCollapseOptions {
  /**
   * Optional external collapse value. When provided the hook becomes
   * controlled — internal state is ignored and the setter delegates back to
   * the caller.
   */
  externalIsCollapsed?: boolean;
  /**
   * Notified whenever the collapse state changes when running in controlled
   * mode.
   */
  externalOnToggleCollapse?: (collapsed: boolean) => void;
}

/**
 * Sidebar collapse state + toggle helper. Manages the localStorage
 * hydration/persistence so both the desktop sidebar and any external
 * consumer (e.g. `AppLayoutInner`) can share the same setting.
 */
export function useSidebarCollapse({
  externalIsCollapsed,
  externalOnToggleCollapse,
}: UseSidebarCollapseOptions) {
  const [internalIsCollapsed, setInternalIsCollapsed] = React.useState(false);
  const isCollapsed =
    externalIsCollapsed !== undefined
      ? externalIsCollapsed
      : internalIsCollapsed;

  React.useEffect(() => {
    if (externalIsCollapsed === undefined) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) setInternalIsCollapsed(JSON.parse(saved));
    }
  }, [externalIsCollapsed]);

  const toggleCollapse = React.useCallback(() => {
    const newState = !isCollapsed;
    if (externalOnToggleCollapse) externalOnToggleCollapse(newState);
    else setInternalIsCollapsed(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, [externalOnToggleCollapse, isCollapsed]);

  return { isCollapsed, toggleCollapse };
}
