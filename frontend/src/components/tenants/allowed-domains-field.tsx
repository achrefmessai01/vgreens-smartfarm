'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n';

const DOMAIN_PATTERN = /^[a-z0-9.-]+\.[a-z]{2,}$/i;

interface AllowedDomainsFieldProps {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

/**
 * Chip input for `Tenant.allowedDomains`. Users type a domain and press Enter
 * (or comma / space) to commit it; empty list means "any domain accepted".
 * Each chip can be removed with the × button. Validation is intentionally
 * lenient — it just rejects empty strings and obviously bad shapes, since the
 * backend re-sanitizes before persisting.
 *
 * We deliberately use a plain `<Label>` + flex column instead of the shadcn
 * `Field` / `FieldContent` pair: this component renders a multi-element body
 * (chips, input, hint) which interacted poorly with `Field`'s child selectors
 * and caused the label to be visually hidden in the Edit Tenant sheet.
 */
export function AllowedDomainsField({
  value,
  onChange,
  disabled,
}: AllowedDomainsFieldProps) {
  const { t } = useI18n();
  const tenantsT = t.pages.admin.tenants;
  const [draft, setDraft] = React.useState('');
  const [error, setError] = React.useState<string | undefined>(undefined);

  const commit = (raw: string) => {
    const normalized = raw.trim().toLowerCase().replace(/^@/, '');
    if (!normalized) return;
    if (!DOMAIN_PATTERN.test(normalized)) {
      setError(tenantsT.allowedDomainsInvalid);
      return;
    }
    if (value.includes(normalized)) {
      setDraft('');
      setError(undefined);
      return;
    }
    onChange([...value, normalized]);
    setDraft('');
    setError(undefined);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',' || event.key === ' ') {
      event.preventDefault();
      commit(draft);
      return;
    }
    if (event.key === 'Backspace' && draft.length === 0 && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (draft.trim().length > 0) commit(draft);
  };

  const remove = (domain: string) => {
    onChange(value.filter((d) => d !== domain));
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor="allowedDomains">{tenantsT.allowedDomains}</Label>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((domain) => (
            <Badge key={domain} variant="secondary" className="gap-1">
              {domain}
              <button
                type="button"
                aria-label={tenantsT.allowedDomainsRemove}
                onClick={() => remove(domain)}
                disabled={disabled}
                className="hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Input
        id="allowedDomains"
        type="text"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          if (error) setError(undefined);
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={tenantsT.allowedDomainsPlaceholder}
        aria-invalid={!!error}
        disabled={disabled}
      />
      <p className="text-muted-foreground text-xs">
        {tenantsT.allowedDomainsHint}
      </p>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}
