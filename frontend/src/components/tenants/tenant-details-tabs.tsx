'use client';

import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '@/i18n';
import { TenantFeaturesTab } from './tenant-features-tab';
import {
  SensorConfigTable,
  SensorVisibilityConfig,
} from '@/components/sensor-config';
import { FarmLayoutConfig } from '@/components/farm-config';

// Tab values must match the `?tab=` URL param values used for deep links (e.g.
// the "config settings" shortcut on the farm-overview page opens this page with
// `?tab=farm-overview`).
const VALID_TABS = new Set(['features', 'alerts', 'farm-overview']);

export function TenantDetailsTabs() {
  const { t } = useI18n();
  const tabs = t.pages.admin.tenants.tabs;
  const params = useParams();
  const searchParams = useSearchParams();
  const tenantId = params.tenantId as string;
  const tabFromUrl = searchParams.get('tab');
  const initialTab =
    tabFromUrl && VALID_TABS.has(tabFromUrl) ? tabFromUrl : 'features';
  const [activeTab, setActiveTab] = React.useState(initialTab);

  // Keep the active tab in sync with the URL when it changes (e.g. the user
  // opens another deep link in the same tab). We deliberately don't push the
  // tab back into the URL on click — the URL param is a one-way deep-link
  // entry point, not a canonical mirror of local state.
  React.useEffect(() => {
    if (tabFromUrl && VALID_TABS.has(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full min-w-0"
    >
      <TabsList className="w-full min-w-0 items-stretch gap-1 group-data-[orientation=horizontal]/tabs:h-auto group-data-[orientation=horizontal]/tabs:flex-col sm:items-center sm:gap-0 sm:group-data-[orientation=horizontal]/tabs:h-9 sm:group-data-[orientation=horizontal]/tabs:flex-row">
        <TabsTrigger
          value="features"
          className="h-auto w-full min-w-0 px-3 py-2 text-center leading-tight break-words whitespace-normal sm:h-[calc(100%-1px)] sm:w-auto sm:whitespace-nowrap"
        >
          {tabs.features}
        </TabsTrigger>
        <TabsTrigger
          value="alerts"
          className="h-auto w-full min-w-0 px-3 py-2 text-center leading-tight break-words whitespace-normal sm:h-[calc(100%-1px)] sm:w-auto sm:whitespace-nowrap"
        >
          {tabs.alertConfiguration}
        </TabsTrigger>
        <TabsTrigger
          value="farm-overview"
          className="h-auto w-full min-w-0 px-3 py-2 text-center leading-tight break-words whitespace-normal sm:h-[calc(100%-1px)] sm:w-auto sm:whitespace-nowrap"
        >
          {tabs.farmOverviewConfiguration}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="features" className="mt-4 w-full min-w-0">
        <TenantFeaturesTab
          tenantId={tenantId}
          active={activeTab === 'features'}
        />
      </TabsContent>

      <TabsContent value="alerts" className="mt-4 w-full min-w-0">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold">{tabs.alertConfiguration}</h2>
        </div>
      </TabsContent>

      <TabsContent value="farm-overview" className="mt-4 w-full min-w-0">
        {activeTab === 'farm-overview' && (
          <div className="flex min-w-0 flex-col gap-6">
            <SensorVisibilityConfig tenantId={tenantId} />
            <FarmLayoutConfig tenantId={tenantId} />
            <SensorConfigTable tenantId={tenantId} />
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
