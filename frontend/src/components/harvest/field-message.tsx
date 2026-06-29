'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type FieldMessageVariant = 'error' | 'warning';
export type FieldMessageSize = 'xs' | 'sm';

// 'error' is a blocking validation problem (destructive red); 'warning' is a
// soft, non-blocking hint (amber).
const VARIANT_CLASS: Record<FieldMessageVariant, string> = {
  error: 'text-destructive',
  warning: 'text-amber-600',
};

export interface FieldMessageProps extends React.ComponentProps<'p'> {
  variant?: FieldMessageVariant;
  // Matches the surrounding form's density: 'sm' for the create-batch form,
  // 'xs' for the compact harvest sidebar. Defaults to 'sm'.
  size?: FieldMessageSize;
}

// Inline message rendered beneath a harvest/batch form input. Centralizes the
// error/warning styling and the alert/status role that used to be copied as
// ad-hoc <p> tags across every field. Renders nothing when it has no message,
// so callers can pass a possibly-undefined error string directly without their
// own `&&` guard.
export function FieldMessage({
  variant = 'error',
  size = 'sm',
  className,
  children,
  ...props
}: FieldMessageProps) {
  if (!children) return null;

  return (
    <p
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        size === 'xs' ? 'text-xs' : 'text-sm',
        VARIANT_CLASS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
