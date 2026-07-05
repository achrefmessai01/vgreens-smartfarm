'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n';
import { FieldMessage } from '@/components/harvest/field-message';
import {
  useUpdateVarietyMutation,
  type UpdateVarietyMutation,
} from '@/generated/graphql';

// Shape of the variety row the caller passes in — mirrors the fields the
// dropdown already has cached, so we don't have to refetch just to open the
// dialog with a name/description prefilled.
export interface EditableVariety {
  id: string;
  name: string;
  description?: string | null;
}

interface EditVarietyDialogProps {
  open: boolean;
  variety: EditableVariety | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: (variety: UpdateVarietyMutation['updateVariety']) => void;
}

// Dialog for renaming a variety or editing its description. Crop stays fixed
// at creation-time (varieties belong to a crop; changing that would break
// referential integrity of any batch that already picked this variety). The
// backend enforces (cropId, name) uniqueness — surface the conflict inline
// instead of letting the user think the save silently succeeded.
export function EditVarietyDialog({
  open,
  variety,
  onOpenChange,
  onUpdated,
}: EditVarietyDialogProps) {
  const { t } = useI18n();
  const h = t.pages.harvest as Record<string, string | undefined> &
    typeof t.pages.harvest;

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [updateVariety, { loading }] = useUpdateVarietyMutation();

  // Reset local state whenever the dialog opens on a different variety —
  // otherwise a stale name from the previously edited row bleeds through.
  React.useEffect(() => {
    if (open && variety) {
      setName(variety.name);
      setDescription(variety.description ?? '');
      setError(null);
    }
    if (!open) {
      setError(null);
    }
  }, [open, variety]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variety) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(h?.varietyNameRequired ?? 'Variety name is required');
      return;
    }
    setError(null);
    const failedMessage = h?.varietyUpdateFailed ?? 'Failed to update variety';
    try {
      const { data, errors } = await updateVariety({
        variables: {
          id: variety.id,
          input: {
            name: trimmedName,
            description: description.trim() || null,
          },
        },
      });
      if (errors && errors.length > 0) {
        setError(errors[0]?.message || failedMessage);
        return;
      }
      if (data?.updateVariety) {
        onUpdated(data.updateVariety);
        onOpenChange(false);
        return;
      }
      setError(failedMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : failedMessage);
    }
  };

  const saveLabel = h?.saveVariety ?? 'Save';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-left">
            {h?.editVariety ?? 'Edit Variety'}
          </DialogTitle>
          <DialogDescription className="text-left">
            {h?.editVarietyDescription ??
              'Rename this variety or update its description.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="editVarietyName" className="text-sm font-medium">
              {h?.varietyName ?? 'Name'}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="editVarietyName"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={h?.varietyNamePlaceholder ?? 'e.g. Sweetheart'}
              disabled={loading}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="editVarietyDescription"
              className="text-sm font-medium"
            >
              {h?.varietyDescription ?? 'Description'}
            </Label>
            <Textarea
              id="editVarietyDescription"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={h?.varietyDescriptionPlaceholder ?? 'Optional notes'}
              disabled={loading}
            />
          </div>
          <FieldMessage variant="warning">{error}</FieldMessage>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="sm:flex-1"
            >
              {t.common.cancel}
            </Button>
            <WriteActionButton
              type="submit"
              disabled={loading}
              className="sm:flex-1"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner />
                  {saveLabel}
                </span>
              ) : (
                saveLabel
              )}
            </WriteActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
