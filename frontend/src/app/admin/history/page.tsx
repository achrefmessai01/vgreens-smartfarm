'use client';

import { useI18n } from '@/i18n';
import { PageHeader } from '@/components/layout';
import { DeletedRecordsDashboard } from '@/components/admin/deleted-records-dashboard';

export default function AdminHistoryPage() {
  const { t } = useI18n();
  const h = t.pages.admin.history;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 lg:h-full lg:min-h-0 xl:gap-6">
      <PageHeader
        title={h.title}
        subtitle={h.subtitle}
        className="mb-4 lg:mb-5 xl:mb-6"
      />
      <DeletedRecordsDashboard />
    </div>
  );
}
