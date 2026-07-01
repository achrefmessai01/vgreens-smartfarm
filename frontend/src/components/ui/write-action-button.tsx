'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { useWriteGuard } from '@/lib/hooks/use-write-guard';

type ButtonProps = React.ComponentProps<typeof Button>;

type WriteActionButtonProps = ButtonProps & {
  /**
   * Tooltip placement when the button is disabled by the view-only guard.
   * Defaults to `top`.
   */
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
};

/**
 * Drop-in replacement for `<Button>` that respects the view-only guard from
 * `useWriteGuard`. When the current user is read-only, the underlying button
 * is disabled and wrapped in a `<Tooltip>` that explains why.
 *
 * The button still renders normally for users with write access — this is
 * meant to be a zero-visual-diff swap for Save / Create / Edit / Delete
 * action buttons that should be blocked for VGREENS_MEMBER.
 */
export function WriteActionButton({
  disabled,
  tooltipSide = 'top',
  ...props
}: WriteActionButtonProps) {
  const { readOnly, tooltip } = useWriteGuard();
  const effectiveDisabled = disabled || readOnly;

  const button = <Button disabled={effectiveDisabled} {...props} />;

  if (readOnly && tooltip) {
    return (
      <Tooltip content={tooltip} side={tooltipSide}>
        {button}
      </Tooltip>
    );
  }

  return button;
}
