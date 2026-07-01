'use client';

import { useCurrentUser } from './use-current-user';
import { useI18n } from '@/i18n';

/**
 * View-only guard for write UI. Returns:
 *  - `readOnly`: `true` when the current user must be blocked from mutations
 *    (currently VGREENS_MEMBER, which is a read-only sibling of VGREENS_ADMIN)
 *  - `tooltip`: the i18n string to show as the disabled-state tooltip, or
 *    `null` when the user has write access
 *
 * Prefer the `<WriteActionButton>` wrapper for most call-sites, which reads
 * this hook internally and renders a `<Tooltip>` around the disabled button
 * automatically. Reach for the hook directly only when you need to guard a
 * non-button surface (a form's onSubmit, a Radix `disabled` prop, etc.).
 */
export function useWriteGuard(): {
  readOnly: boolean;
  tooltip: string | null;
} {
  const { isViewOnly } = useCurrentUser();
  const { t } = useI18n();
  return {
    readOnly: isViewOnly,
    tooltip: isViewOnly ? t.common.viewOnlyTooltip : null,
  };
}
