import type { AlertStatus, AlertSeverity } from '@/generated/graphql';

export interface AlertsFilterInput {
  search?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  status?: AlertStatus | null;
  statusIn?: AlertStatus[] | null;
  severity?: AlertSeverity | null;
  severityIn?: AlertSeverity[] | null;
  acknowledgedById?: string | null;
  acknowledgedByIdIn?: string[] | null;
  resolvedById?: string | null;
  resolvedByIdIn?: string[] | null;
}

export function toAlertsFilterVariables(
  filter: AlertsFilterInput | undefined | null,
): { filter?: AlertsFilterInput } {
  if (!filter) return {};
  const f: AlertsFilterInput = {};
  if (filter.search?.trim()) f.search = filter.search.trim();
  if (filter.dateFrom) f.dateFrom = filter.dateFrom;
  if (filter.dateTo) f.dateTo = filter.dateTo;
  if (filter.statusIn?.length) f.statusIn = filter.statusIn;
  else if (filter.status) f.status = filter.status;
  if (filter.severityIn?.length) f.severityIn = filter.severityIn;
  else if (filter.severity) f.severity = filter.severity;
  if (filter.acknowledgedByIdIn?.length) f.acknowledgedByIdIn = filter.acknowledgedByIdIn;
  else if (filter.acknowledgedById) f.acknowledgedById = filter.acknowledgedById;
  if (filter.resolvedByIdIn?.length) f.resolvedByIdIn = filter.resolvedByIdIn;
  else if (filter.resolvedById) f.resolvedById = filter.resolvedById;
  if (Object.keys(f).length === 0) return {};
  return { filter: f };
}
