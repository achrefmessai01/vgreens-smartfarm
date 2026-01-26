import { PageHeader } from '@/components/layout'

export default function TenantDetailsPage({
  params,
}: {
  params: { tenantId: string }
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Tenant Details: ${params.tenantId}`}
        subtitle="View and manage tenant details"
      />
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Tenant details interface coming soon...
        </p>
      </div>
    </div>
  )
}
