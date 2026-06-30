'use client';

import * as React from 'react';
import type { User } from '@/generated/graphql';
import {
  ConfirmationDialog,
  type ConfirmationDialogProps,
} from './confirmation-dialog';
import { useI18n } from '@/i18n';

interface UserConfirmationDialogProps
  extends Omit<ConfirmationDialogProps, 'children'> {
  /** The user the action targets — used to render the summary card. */
  user: User | null;
}

/**
 * Thin wrapper around `ConfirmationDialog` that renders a consistent
 * user-summary card (name + email) as the dialog body. Used by both the
 * delete and update confirmation flows on the users pages so the look
 * stays the same and the page-level files stay small.
 */
export function UserConfirmationDialog({
  user,
  ...dialogProps
}: UserConfirmationDialogProps) {
  const { t } = useI18n();
  return (
    <ConfirmationDialog {...dialogProps}>
      {user && (
        <div className="bg-muted dark:bg-primary-foreground/10 dark:border-primary-foreground/20 rounded-lg p-4 dark:border">
          <p className="dark:text-card-foreground font-medium">
            {[user.firstName, user.lastName].filter(Boolean).join(' ') ||
              user.email ||
              t.pages.users.unknownUser}
          </p>
          {user.email && (
            <p className="text-muted-foreground mt-1 text-sm">{user.email}</p>
          )}
        </div>
      )}
    </ConfirmationDialog>
  );
}
