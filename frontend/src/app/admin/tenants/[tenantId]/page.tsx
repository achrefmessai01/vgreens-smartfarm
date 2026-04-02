import { PageHeader } from '@/components/layout';
import { TenantDetailsTabs } from '@/components/tenants';

export default function TenantDetailsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenant Details"
        subtitle="View and manage tenant details"
      />
      <TenantDetailsTabs />
    </div>
  );
}
