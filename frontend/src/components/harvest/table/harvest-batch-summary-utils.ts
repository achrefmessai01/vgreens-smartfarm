import type * as React from 'react';

/**
 * Props shared by every clickable summary surface — defined once so the
 * keyboard/aria contract stays consistent across desktop table row and
 * mobile card layouts.
 */
export function interactiveProps(
  onExpand: () => void,
  onKeyDown: (e: React.KeyboardEvent) => void,
  ariaLabel: string,
) {
  return {
    onClick: onExpand,
    onKeyDown,
    role: 'button' as const,
    tabIndex: 0,
    'aria-expanded': false,
    'aria-label': ariaLabel,
  };
}
