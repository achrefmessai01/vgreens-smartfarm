"use client";

import {
  EmptyState,
  FarmDataDisplay,
  GreenhouseSelector,
  HistoryDrawer,
  LoadingState,
  ParameterSelector,
} from "@/components/farm-overview";
import { FeatureGuard } from "@/components/features/feature-guard";
import { PageHeader } from "@/components/layout/page-header";
import { TenantSelector } from "@/components/tenants";
import { Card } from "@/components/ui/card";
import { UserRole, useTenantsQuery, type Tenant } from "@/generated/graphql";
import { useI18n } from "@/i18n";
import { formatFieldToLabel } from "@/lib/farm-data";
import type { ParameterType } from "@/lib/farm-types";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { useLiveFarmData } from "@/lib/hooks/use-live-farm-data";
import { useTenantBucketName } from "@/lib/hooks/use-tenant-bucket";
import { useSearchParams } from "next/navigation";
import * as React from "react";

const GREENHOUSE_LABEL_KEYS = ["greenHouse1", "greenHouse2"] as const;

export default function FarmOverviewPage() {
  const { t } = useI18n();
  const { role } = useCurrentUser();
  const isVGreensAdmin = role === UserRole.VgreensAdmin;
  const searchParams = useSearchParams();
  const initialTenantIdFromUrl = searchParams.get("tenantId") ?? "";

  const { data: tenantsData } = useTenantsQuery({
    skip: !isVGreensAdmin,
    fetchPolicy: "cache-first",
  });
  const tenants = React.useMemo(
    () => (tenantsData?.tenants || []) as Tenant[],
    [tenantsData?.tenants],
  );

  const [selectedTenantId, setSelectedTenantId] = React.useState<string>(
    initialTenantIdFromUrl,
  );

  React.useEffect(() => {
    if (!isVGreensAdmin || tenants.length === 0) return;

    if (
      initialTenantIdFromUrl &&
      tenants.some((t) => t.id === initialTenantIdFromUrl)
    ) {
      setSelectedTenantId(initialTenantIdFromUrl);
      return;
    }

    if (!selectedTenantId || !tenants.some((t) => t.id === selectedTenantId)) {
      setSelectedTenantId(tenants[0].id);
    }
  }, [isVGreensAdmin, tenants, selectedTenantId, initialTenantIdFromUrl]);

  const { bucketName: selectedTenantBucketName } = useTenantBucketName(
    isVGreensAdmin ? selectedTenantId : undefined,
  );

  const tenantBucketNameOverride = isVGreensAdmin
    ? (selectedTenantBucketName ?? null)
    : undefined;

  const { bays, bucketFields, loading } = useLiveFarmData({
    tenantBucketName: tenantBucketNameOverride,
  });
  const [selectedParameter, setSelectedParameter] =
    React.useState<ParameterType>("temperature");

  // Create greenhouse options for the selector
  const greenhouseOptions = React.useMemo(
    () =>
      GREENHOUSE_LABEL_KEYS.map((key) => ({
        key,
        label: t.pages.farmOverview[key],
      })),
    [t.pages.farmOverview],
  );

  const parameterOptions = React.useMemo(() => {
    if (bucketFields.length === 0) {
      return [
        { label: t.pages.farmOverview.temperature, value: "temperature" },
        { label: t.pages.farmOverview.humidity, value: "humidity" },
        { label: t.pages.farmOverview.co2, value: "co2" },
        { label: t.pages.farmOverview.soilEC, value: "soil_ec" },
        { label: t.pages.farmOverview.soilMoisture, value: "soil_moisture" },
        { label: t.pages.farmOverview.vpd, value: "vpd" },
        { label: t.pages.farmOverview.par, value: "par" },
      ];
    }

    const hasPar = bucketFields.includes("par");
    const hasParEstimated = bucketFields.includes("par_estimated");

    const baseFields = bucketFields.filter(
      (field) =>
        field !== "lux" && field !== "par" && field !== "par_estimated",
    );

    const options = baseFields.map((field) => ({
      label: formatFieldToLabel(field),
      value: field,
    }));

    const parField: ParameterType | null = hasParEstimated
      ? "par_estimated"
      : hasPar
        ? "par"
        : null;

    if (parField) {
      options.push({
        label: formatFieldToLabel("par"),
        value: parField,
      });
    }

    return options;
  }, [
    bucketFields,
    t.pages.farmOverview.temperature,
    t.pages.farmOverview.humidity,
    t.pages.farmOverview.co2,
    t.pages.farmOverview.soilEC,
    t.pages.farmOverview.soilMoisture,
    t.pages.farmOverview.vpd,
    t.pages.farmOverview.par,
  ]);

  const effectiveParameter =
    selectedParameter && bucketFields.includes(selectedParameter)
      ? selectedParameter
      : (bucketFields[0] ?? "temperature");

  React.useEffect(() => {
    if (bucketFields.length > 0 && !bucketFields.includes(selectedParameter)) {
      setSelectedParameter(bucketFields[0]);
    }
  }, [bucketFields, selectedParameter]);
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(
    null,
  );
  const [historyDrawerOpen, setHistoryDrawerOpen] = React.useState(false);
  const [viewMode] = React.useState<"grid" | "map">("map");
  const [activeGreenhouseTab, setActiveGreenhouseTab] = React.useState(0);

  React.useEffect(() => {
    if (selectedSlotId) {
      setHistoryDrawerOpen(true);
    }
  }, [selectedSlotId]);

  const getParameterLabel = (param: ParameterType): string =>
    formatFieldToLabel(param);

  return (
    <FeatureGuard featureKey="farm_overview">
      <div className="space-y-6 bg-background">
        <PageHeader
          title={t.pages.farmOverview.title}
          subtitle={t.pages.farmOverview.subtitle}
        />

        {/* Admin Tenant Selector - Only visible for VGreens Admins */}
        {isVGreensAdmin && (
          <TenantSelector
            tenants={tenants}
            selectedTenantId={selectedTenantId}
            onTenantChange={setSelectedTenantId}
            label={t.pages.admin.users.selectTenant || "Select tenant"}
            placeholder={t.pages.admin.users.selectTenant}
          />
        )}

        {/* Content Card - Primary container for all farm data */}
        <Card className="h-full gap-0 py-0 overflow-hidden dark:shadow-lg">
          {/* Navigation Section - Contains both Greenhouse and Parameter selectors */}
          <div className="shrink-0 border-b border-border/50 dark:border-border/20 bg-muted/20 dark:bg-muted/10">
            {/* Greenhouse Navigation Tabs - Switch between different greenhouses */}
            <div className="border-b border-border/50 dark:border-border/20">
              <GreenhouseSelector
                value={activeGreenhouseTab}
                onValueChange={setActiveGreenhouseTab}
                options={greenhouseOptions}
              />
            </div>

            {/* Parameter Selection Tabs - Choose which metric to display */}
            <div>
              <ParameterSelector
                value={effectiveParameter}
                onValueChange={setSelectedParameter}
                options={parameterOptions}
              />
            </div>
          </div>

          {/* Main Display Area - Scrollable content showing sensor data visualization */}
          <div className="flex-1 min-h-0 overflow-auto bg-background dark:bg-background/50">
            {loading ? (
              <LoadingState message={t.pages.farmOverview.loading} />
            ) : activeGreenhouseTab === 1 ? (
              <EmptyState
                message={
                  (t.pages.farmOverview as { emptyForNow?: string })
                    .emptyForNow ?? "Empty for now"
                }
                icon={<EmptyState.GreenhouseIcon />}
              />
            ) : (
              <FarmDataDisplay
                bays={bays}
                viewMode={viewMode}
                parameter={effectiveParameter}
                selectedSlotId={selectedSlotId}
                onSelectSlot={setSelectedSlotId}
                bayLabel={t.pages.farmOverview.greenHouse1}
                parameterLabel={getParameterLabel(effectiveParameter)}
                noSensorLabel={t.pages.farmOverview.noSensor}
                noDataMessage={t.pages.farmOverview.noData}
              />
            )}
          </div>
        </Card>

        {/* History Drawer Component - Side panel showing historical sensor data for selected slot */}
        <HistoryDrawer
          open={historyDrawerOpen}
          onOpenChange={setHistoryDrawerOpen}
          parameter={effectiveParameter}
          slotId={selectedSlotId}
          parameterLabel={getParameterLabel(effectiveParameter)}
          timeRangeLabel={t.pages.farmOverview.timeRange}
          oneDayLabel={t.pages.farmOverview.oneDay}
          oneWeekLabel={t.pages.farmOverview.oneWeek}
          oneMonthLabel={t.pages.farmOverview.oneMonth}
          historyLabel={t.pages.farmOverview.history}
        />
      </div>
    </FeatureGuard>
  );
}
