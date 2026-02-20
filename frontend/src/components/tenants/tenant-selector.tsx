import { StyledSelect } from '@/components/ui/styled-select'
import type { Tenant } from '@/generated/graphql'

interface TenantSelectorProps {
  tenants: Tenant[]
  selectedTenantId: string
  onTenantChange: (tenantId: string) => void
  label: string
  placeholder: string
}

export function TenantSelector({
  tenants,
  selectedTenantId,
  onTenantChange,
  label,
  placeholder,
}: TenantSelectorProps) {
  if (tenants.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-muted/30 dark:bg-muted/20 border border-border/40 dark:border-border/10">
      <span className="text-sm font-medium text-foreground dark:text-foreground whitespace-nowrap">
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
  )
}
