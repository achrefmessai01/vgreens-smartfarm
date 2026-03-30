import { StyledSelect } from '@/components/ui/styled-select';
import type { Tenant } from '@/generated/graphql';

interface TenantSelectorProps {
  tenants: Tenant[];
  selectedTenantId: string;
  onTenantChange: (tenantId: string) => void;
  label: string;
  placeholder: string;
}

export function TenantSelector({
  tenants,
  selectedTenantId,
  onTenantChange,
  label,
  placeholder,
}: TenantSelectorProps) {
  if (tenants.length === 0) {
    return null;
  }

  return (
    <div className="bg-muted/30 dark:bg-muted/20 border-border/40 dark:border-border/10 flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
      <span className="text-foreground dark:text-foreground text-sm font-medium whitespace-nowrap">
        {label}:
      </span>
      <div className="flex-1 sm:flex-initial">
        <StyledSelect
          value={selectedTenantId}
          onValueChange={onTenantChange}
          options={tenants.map((tenant) => ({
            label: tenant.name,
            value: tenant.id,
          }))}
          width="100%"
          triggerClassName="w-full sm:w-[280px]"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
