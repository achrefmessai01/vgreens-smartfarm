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
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { DecimalInput } from '@/components/ui/decimal-input';
import { useI18n } from '@/i18n';
import { FieldMessage } from '@/components/harvest/field-message';
import {
  useCreateCrateMutation,
  type CreateCrateMutation,
} from '@/generated/graphql';
import { useTenantIdVariable } from '@/lib/contexts/selected-tenant-context';

interface AddCrateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (crate: CreateCrateMutation['createCrate']) => void;
}

/**
 * Dialog for adding a crate inline from the harvest sidebar's crate dropdown.
 * The backend stamps tenantId/createdById and returns an existing same-weight
 * crate idempotently. New i18n keys use English fallbacks while translations
 * roll out across locales.
 */
export function AddCrateDialog({
  open,
  onOpenChange,
  onCreated,
}: AddCrateDialogProps) {
  const { t } = useI18n();
  const h = t.pages.harvest as Record<string, string | undefined> &
    typeof t.pages.harvest;

  const [weight, setWeight] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [createCrate, { loading }] = useCreateCrateMutation();
  // Add the crate to the tenant in context (needed so an admin creates it in the
  // tenant they're working in, not their own absent one).
  const tenantId = useTenantIdVariable();

  React.useEffect(() => {
    if (!open) {
      setWeight(0);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(weight) || weight <= 0) {
      setError(h?.crateWeightRequired ?? 'Crate weight must be greater than 0');
      return;
    }
    setError(null);
    const failedMessage = h?.crateCreateFailed ?? 'Failed to add crate';
    try {
      const { data, errors } = await createCrate({
        variables: { input: { weight }, tenantId },
      });
      // The client runs mutations with errorPolicy 'all', so GraphQL errors
      // resolve here on the result rather than rejecting — surface them inline.
      if (errors && errors.length > 0) {
        setError(errors[0]?.message || failedMessage);
        return;
      }
      if (data?.createCrate) {
        onCreated(data.createCrate);
        onOpenChange(false);
        return;
      }
      setError(failedMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : failedMessage);
    }
  };

  const saveLabel = h?.saveCrate ?? 'Save';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-left">
            {h?.addCrate ?? 'Add Crate'}
          </DialogTitle>
          <DialogDescription className="text-left">
            {h?.addCrateDescription ??
              'Create a new crate size for this tenant.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="crateWeightInput" className="text-sm font-medium">
              {h?.crateWeight ?? 'Crate Weight (kg)'}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <DecimalInput
              id="crateWeightInput"
              autoFocus
              value={weight}
              onChange={(v) => setWeight(v)}
              placeholder={h?.enterCrateWeight ?? 'Weight of one full crate'}
              disabled={loading}
              className="h-10"
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
