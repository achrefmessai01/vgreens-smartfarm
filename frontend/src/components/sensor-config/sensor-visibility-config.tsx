'use client';

import * as React from 'react';
import {
  useSetTenantDisabledSensorFieldsMutation,
  useTenantQuery,
} from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/toast-provider';
import { SensorVisibilityDropdown } from '@/components/farm-overview/sensor-visibility-dropdown';

interface SensorVisibilityConfigProps {
  tenantId: string;
}

/**
 * Admin-side wrapper around `SensorVisibilityDropdown` that targets a specific
 * tenant by id (used in the Tenant detail page). The farm-overview page uses
 * the dropdown directly, sourcing disabled fields from the active tenant via
 * `useFarmOverviewPage`.
 */
export function SensorVisibilityConfig({
  tenantId,
}: SensorVisibilityConfigProps) {
  const { t } = useI18n();
  const { toast } = useToast();

  const { data, loading } = useTenantQuery({
    variables: { id: tenantId },
    skip: !tenantId,
    fetchPolicy: 'cache-and-network',
  });

  const disabledFields = React.useMemo(
    () => new Set(data?.tenant?.settings?.disabledSensorFields ?? []),
    [data?.tenant?.settings?.disabledSensorFields],
  );

  const [setDisabledMutation] = useSetTenantDisabledSensorFieldsMutation();
  const [saving, setSaving] = React.useState(false);

  const handleToggle = React.useCallback(
    async (fields: string[], enabled: boolean) => {
      const next = new Set(data?.tenant?.settings?.disabledSensorFields ?? []);
      for (const field of fields) {
        if (enabled) {
          next.delete(field);
        } else {
          next.add(field);
        }
      }
      setSaving(true);
      try {
        await setDisabledMutation({
          variables: { fields: Array.from(next), tenantId },
          update: (cache, result) => {
            const updated = result.data?.setTenantDisabledSensorFields;
            if (!updated) return;
            cache.modify({
              id: cache.identify({ __typename: 'Tenant', id: updated.id }),
              fields: {
                settings: () => updated.settings,
              },
            });
          },
        });
      } catch (err) {
        toast({
          title: t.pages.farmOverview.positionSaveFailedTitle,
          description: err instanceof Error ? err.message : String(err),
          variant: 'destructive',
        });
      } finally {
        setSaving(false);
      }
    },
    [
      data?.tenant?.settings?.disabledSensorFields,
      setDisabledMutation,
      t,
      tenantId,
      toast,
    ],
  );

  return (
    <div className="bg-card flex items-center justify-between rounded-lg border p-4">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold">
          {t.pages.farmOverview.enableSensors}
        </h3>
        <p className="text-muted-foreground text-xs">
          {t.pages.admin.tenants.sensorConfig.enableSensorsHint}
        </p>
      </div>
      <SensorVisibilityDropdown
        disabledFields={disabledFields}
        onToggle={handleToggle}
        saving={saving || loading}
        triggerLabel={t.pages.farmOverview.enableSensors}
        showAllLabel={t.pages.farmOverview.showAllSensors}
        hideAllLabel={t.pages.farmOverview.hideAllSensors}
        visibleSuffixLabel={t.pages.farmOverview.sensorsVisible}
      />
    </div>
  );
}
