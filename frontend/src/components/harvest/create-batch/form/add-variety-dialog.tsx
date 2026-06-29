'use client';

import * as React from 'react';
import { Dialog, DialogTitle, DialogHeader, DialogFooter, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n';
import { FieldMessage } from '@/components/harvest/field-message';
import { useCreateVarietyMutation, type CreateVarietyMutation } from '@/generated/graphql';

interface AddVarietyDialogProps {
  open: boolean;
  cropId: string;
  onOpenChange: (open: boolean) => void;
  onCreated: (variety: CreateVarietyMutation['createVariety']) => void;
}

// Minimal dialog for adding a new variety from the Batch Form. Tied to the
// form's currently-selected crop; backend enforces (cropId, name) uniqueness
// and admin-only access. New i18n keys are read with optional chaining +
// English fallbacks while translations roll out across locales.
export function AddVarietyDialog({
  open,
  cropId,
  onOpenChange,
  onCreated,
}: AddVarietyDialogProps) {
  const { t } = useI18n();
  const h = t.pages.harvest as Record<string, string | undefined> &
    typeof t.pages.harvest;

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [createVariety, { loading }] = useCreateVarietyMutation();

  React.useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(h?.varietyNameRequired ?? 'Variety name is required');
      return;
    }
    setError(null);
    const failedMessage = h?.varietyCreateFailed ?? 'Failed to add variety';
    try {
      const { data, errors } = await createVariety({
        variables: {
          input: {
            cropId,
            name: trimmed,
            description: description.trim() || undefined,
          },
        },
      });
      // The client runs mutations with errorPolicy 'all', so GraphQL errors
      // (e.g. the backend's "variety already exists" conflict) resolve here on
      // the result rather than rejecting — surface them inline instead of
      // letting the duplicate fail silently.
      if (errors && errors.length > 0) {
        setError(errors[0]?.message || failedMessage);
        return;
      }
      if (data?.createVariety) {
        onCreated(data.createVariety);
        onOpenChange(false);
        return;
      }
      // No data and no errors is unexpected; fail soft rather than silently.
      setError(failedMessage);
    } catch (err) {
      // Network failures (or any policy that rejects) land here.
      setError(err instanceof Error ? err.message : failedMessage);
    }
  };

  const saveLabel = h?.saveVariety ?? 'Save';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-left">
            {h?.addVariety ?? 'Add Variety'}
          </DialogTitle>
          <DialogDescription className="text-left">
            {h?.addVarietyDescription ??
              'Create a new variety for the selected crop.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="varietyName" className="text-sm font-medium">
              {h?.varietyName ?? 'Name'}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="varietyName"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={h?.varietyNamePlaceholder ?? 'e.g. Sweetheart'}
              disabled={loading}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="varietyDescription" className="text-sm font-medium">
              {h?.varietyDescription ?? 'Description'}
            </Label>
            <Textarea
              id="varietyDescription"
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
            <Button type="submit" disabled={loading} className="sm:flex-1">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner />
                  {saveLabel}
                </span>
              ) : (
                saveLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
