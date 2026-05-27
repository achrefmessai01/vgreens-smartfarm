'use client';

import { PageHeader } from '@/components/layout';
import { useI18n } from '@/i18n';

export default function SettingsPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.admin.settings.title}
        subtitle={t.pages.admin.settings.subtitle}
      />
      <div className="bg-card rounded-lg border p-6">
        <p className="text-muted-foreground">
          {t.pages.admin.settings.placeholder}
        </p>
      </div>
    </div>
  );
}
