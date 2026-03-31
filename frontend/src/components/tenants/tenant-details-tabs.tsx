'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useI18n } from '@/i18n';
import { TenantFeaturesTab } from './tenant-features-tab';

export function TenantDetailsTabs() {
  const { t } = useI18n();
  const tabs = t.pages.admin.tenants.tabs;
  const params = useParams();
  const tenantId = params.tenantId as string;
  const [activeTab, setActiveTab] = React.useState('features');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="features">{tabs.features}</TabsTrigger>
        <TabsTrigger value="alerts">{tabs.alertConfiguration}</TabsTrigger>
        <TabsTrigger value="farm-overview">
          {tabs.farmOverviewConfiguration}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="features" className="mt-4">
        <TenantFeaturesTab tenantId={tenantId} active={activeTab === 'features'} />
      </TabsContent>

      <TabsContent value="alerts" className="mt-4">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold">{tabs.alertConfiguration}</h2>
        </div>
      </TabsContent>

      <TabsContent value="farm-overview" className="mt-4">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold">
            {tabs.farmOverviewConfiguration}
          </h2>
        </div>
      </TabsContent>
    </Tabs>
  );
}
