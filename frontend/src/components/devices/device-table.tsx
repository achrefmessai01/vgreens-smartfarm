'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TableCell } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import {
  DataTable,
  type Column,
  type FilterConfigOption,
} from '@/components/ui/data-table/data-table';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import type { DeviceStatus } from '@/generated/graphql';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import {
  GLASS_CARD,
  STATE_BADGE_CLASS,
  STATE_ORDER,
  stateSortRank,
} from './device-status-constants';
import { DeviceDetailsDialog } from './device-details-dialog';

type DeviceRow = DeviceStatus & { id: string };

type SortKey =
  | 'device'
  | 'state'
  | 'class'
  | 'messageTypes'
  | 'lastRealData'
  | 'realPoints';
type SortDir = 'asc' | 'desc';

interface DeviceTableProps {
  devices: DeviceStatus[];
  isLoading?: boolean;
}

export function DeviceTable({ devices, isLoading }: DeviceTableProps) {
  const { t } = useI18n();
  const ds = t.pages.deviceStatus;
  const tbl = ds.table;
  const { isMobile } = useResponsiveBreakpoint('lg');

  const [stateFilter, setStateFilter] = React.useState('');
  const [selected, setSelected] = React.useState<DeviceStatus | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [sortKey, setSortKey] = React.useState<SortKey>('state');
  const [sortDir, setSortDir] = React.useState<SortDir>('asc');

  const openDetails = (d: DeviceStatus) => {
    setSelected(d);
    setDialogOpen(true);
  };

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const stateLabel = React.useCallback(
    (state: string) =>
      ({
        working: ds.states.working,
        stale: ds.states.stale,
        'heartbeat-only': ds.states.heartbeatOnly,
        'never-seen': ds.states.neverSeen,
      })[state] ?? state,
    [ds.states],
  );

  const formatRelative = React.useCallback(
    (iso?: string | null) => {
      if (!iso) return tbl.never;
      const ms = new Date(iso).getTime();
      if (Number.isNaN(ms)) return tbl.never;
      const diffMin = Math.max(0, (Date.now() - ms) / 60_000);
      if (diffMin < 1) return ds.relative.justNow;
      if (diffMin < 60)
        return ds.relative.minutesAgo.replace(
          '{n}',
          String(Math.round(diffMin)),
        );
      const diffH = diffMin / 60;
      if (diffH < 48)
        return ds.relative.hoursAgo.replace('{n}', String(Math.round(diffH)));
      return ds.relative.daysAgo.replace('{n}', String(Math.round(diffH / 24)));
    },
    [ds.relative, tbl.never],
  );

  // Absolute local date + time, e.g. "Jun 22, 14:03".
  const formatAbsolute = React.useCallback((iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }, []);

  // Stacked absolute date-time over the relative "x ago" hint.
  const timeCell = (iso?: string | null) => {
    const absolute = formatAbsolute(iso);
    if (!absolute) {
      return <span className="text-muted-foreground">{tbl.never}</span>;
    }
    return (
      <div className="flex flex-col leading-tight">
        <span className="text-foreground whitespace-nowrap">{absolute}</span>
        <span className="text-muted-foreground text-xs">
          {formatRelative(iso)}
        </span>
      </div>
    );
  };

  const compare = React.useCallback(
    (a: DeviceStatus, b: DeviceStatus): number => {
      switch (sortKey) {
        case 'device':
          return a.device.localeCompare(b.device);
        case 'state':
          return stateSortRank(a.state) - stateSortRank(b.state);
        case 'class':
          return a.deviceClass.localeCompare(b.deviceClass);
        case 'messageTypes':
          return a.realMessageTypes
            .join(',')
            .localeCompare(b.realMessageTypes.join(','));
        case 'lastRealData':
          return (
            (a.lastRealData ? new Date(a.lastRealData).getTime() : 0) -
            (b.lastRealData ? new Date(b.lastRealData).getTime() : 0)
          );
        case 'realPoints':
          return a.realDataPoints - b.realDataPoints;
        default:
          return 0;
      }
    },
    [sortKey],
  );

  const rows: DeviceRow[] = React.useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return devices
      .filter((d) => (stateFilter ? d.state === stateFilter : true))
      .map((d) => ({ ...d, id: d.device }))
      .sort((a, b) => {
        const r = dir * compare(a, b);
        // Stable tie-breaker so equal rows keep a deterministic order.
        return r !== 0 ? r : a.device.localeCompare(b.device);
      });
  }, [devices, stateFilter, sortDir, compare]);

  const filterConfigs: FilterConfigOption[] = [
    {
      label: tbl.filterState,
      value: stateFilter,
      onFilterChange: setStateFilter,
      options: [
        { label: tbl.all, value: '' },
        ...STATE_ORDER.map((s) => ({ label: stateLabel(s), value: s })),
      ],
    },
  ];

  const sortHeader = (sortField: SortKey, label: string): React.ReactNode => {
    const active = sortKey === sortField;
    const Icon = !active
      ? ArrowUpDown
      : sortDir === 'asc'
        ? ArrowUp
        : ArrowDown;
    return (
      <button
        type="button"
        onClick={() => toggleSort(sortField)}
        className={cn(
          'hover:text-foreground inline-flex items-center gap-1 transition-colors',
          active ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {label}
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      </button>
    );
  };

  // Compact column set — the rest of each device's data lives in the modal.
  const columns: Column<DeviceRow>[] = [
    { key: 'device', header: sortHeader('device', tbl.columns.device) },
    { key: 'state', header: sortHeader('state', tbl.columns.state) },
    { key: 'class', header: sortHeader('class', tbl.columns.class) },
    {
      key: 'messageTypes',
      header: sortHeader('messageTypes', tbl.columns.messageTypes),
    },
    {
      key: 'lastRealData',
      header: sortHeader('lastRealData', tbl.columns.lastRealData),
    },
    {
      key: 'realPoints',
      header: sortHeader('realPoints', tbl.columns.realPoints),
      headerClassName: 'text-right',
    },
    { key: 'details', header: '', headerClassName: 'w-10' },
  ];

  const stateBadge = (state: string) => (
    <Badge
      variant="outline"
      className={cn('font-medium', STATE_BADGE_CLASS[state])}
    >
      {stateLabel(state)}
    </Badge>
  );

  const renderRow = (d: DeviceRow) => (
    <>
      <TableCell className="font-medium">{d.device}</TableCell>
      <TableCell>{stateBadge(d.state)}</TableCell>
      <TableCell className="text-muted-foreground">
        {d.deviceClass === 'edge' ? tbl.classEdge : tbl.classRegular}
      </TableCell>
      <TableCell className="text-muted-foreground max-w-[200px] truncate">
        {d.realMessageTypes.length ? d.realMessageTypes.join(', ') : tbl.none}
      </TableCell>
      <TableCell>{timeCell(d.lastRealData)}</TableCell>
      <TableCell className="text-right tabular-nums">
        {d.realDataPoints.toLocaleString()}
      </TableCell>
      <TableCell className="text-muted-foreground">
        <ChevronRight className="h-4 w-4" aria-hidden />
      </TableCell>
    </>
  );

  const renderCard = (d: DeviceRow) => (
    <Card className={cn(GLASS_CARD, 'm-2')}>
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">{d.device}</span>
          {stateBadge(d.state)}
        </div>
        <div className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <span>{tbl.columns.class}</span>
          <span className="text-foreground">
            {d.deviceClass === 'edge' ? tbl.classEdge : tbl.classRegular}
          </span>
          <span>{tbl.columns.messageTypes}</span>
          <span className="text-foreground truncate">
            {d.realMessageTypes.length
              ? d.realMessageTypes.join(', ')
              : tbl.none}
          </span>
          <span>{tbl.columns.lastRealData}</span>
          <span className="text-foreground">
            {formatAbsolute(d.lastRealData) ?? tbl.never}
          </span>
          <span>{tbl.columns.realPoints}</span>
          <span className="text-foreground">
            {d.realDataPoints.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className={isMobile ? 'min-w-0' : 'h-[640px] min-w-0'}>
        <DataTable
          data={rows}
          columns={columns}
          renderRow={renderRow}
          renderCard={renderCard}
          onRowClick={openDetails}
          isLoading={isLoading}
          searchConfig={{
            placeholder: tbl.searchPlaceholder,
            onSearch: (q, item) =>
              item.device.toLowerCase().includes(q.toLowerCase()) ||
              (item.greenhouse ?? '').toLowerCase().includes(q.toLowerCase()),
          }}
          filterConfigs={filterConfigs}
          emptyState={{ title: tbl.empty, description: tbl.emptyHint }}
          paginationVariant="compact"
          defaultPageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          responsiveBreakpoint="lg"
          cardClassName={GLASS_CARD}
        />
      </div>
      <DeviceDetailsDialog
        device={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
