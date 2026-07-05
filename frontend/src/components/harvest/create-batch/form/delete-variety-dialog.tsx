'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { ConfirmationDialog } from '@/components/users';
import { useDeleteVarietyMutation } from '@/generated/graphql';

interface DeleteVarietyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  varietyId: string | null;
  varietyName: string;
  onDeleted: (id: string) => void;
  onError: (message: string) => void;
}

// Confirmation dialog for soft-deleting a variety. The backend soft-deletes
// via `softDelete()` so any batch that already references this variety keeps
// working — the row just stops appearing in the dropdown. That's why the copy
// avoids the word "permanent"; be honest about what actually happens.
export function DeleteVarietyDialog({
  open,
  onOpenChange,
  varietyId,
  varietyName,
  onDeleted,
  onError,
}: DeleteVarietyDialogProps) {
  const { t } = useI18n();
  const h = t.pages.harvest as Record<string, string | undefined> &
    typeof t.pages.harvest;
  const [deleteVariety, { loading }] = useDeleteVarietyMutation();

  const handleConfirm = async () => {
    if (!varietyId) return;
    const failedMessage = h?.varietyDeleteFailed ?? 'Failed to delete variety';
    try {
      const { data, errors } = await deleteVariety({
        variables: {
          id: varietyId,
        },
      });
      if (errors && errors.length > 0) {
        onError(errors[0]?.message || failedMessage);
        return;
      }
      if (data?.deleteVariety) {
        onDeleted(varietyId);
        onOpenChange(false);
        return;
      }
      onError(failedMessage);
    } catch (err) {
      onError(err instanceof Error ? err.message : failedMessage);
    }
  };

  const description = (
    h?.deleteVarietyDescription ??
    'Remove "{name}" from the dropdown. Existing batches that reference this variety keep working.'
  ).replace('{name}', varietyName);

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={h?.deleteVarietyTitle ?? 'Delete variety'}
      description={description}
      confirmLabel={h?.deleteVarietyConfirm ?? 'Delete'}
      cancelLabel={t.common.cancel}
      variant="destructive"
      onConfirm={handleConfirm}
      isLoading={loading}
    />
  );
}
