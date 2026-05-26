'use client';

import { PageHeader } from '@/components/layout';
import { TenantDetailsTabs } from '@/components/tenants';
import { useI18n } from '@/i18n';

export default function TenantDetailsPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.admin.tenants.detailsTitle}
        subtitle={t.pages.admin.tenants.detailsSubtitle}
      />
      <TenantDetailsTabs />
    </div>
  );
}
