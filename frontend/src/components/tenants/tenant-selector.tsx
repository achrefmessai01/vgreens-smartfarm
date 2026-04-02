import { Building2 } from 'lucide-react';
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
  if (tenants.length === 0) return null;

  return (
    <div className="flex shrink-0 flex-col gap-1">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <Building2 className="h-3 w-3" />
        {label}
      </div>
      <StyledSelect
        value={selectedTenantId}
        onValueChange={onTenantChange}
        options={tenants.map((tenant) => ({
          label: tenant.name,
          value: tenant.id,
        }))}
        triggerClassName="h-9 w-[200px] font-medium"
        placeholder={placeholder}
      />
    </div>
  );
}
