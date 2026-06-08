import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import {
  ChartTooltipContainer,
  type ChartTooltipProps,
} from '../chart-helpers';

interface CumulativeYieldPoint {
  date: string;
  cumulativeClassA: number;
  cumulativeClassB: number;
  cumulativeClassC: number;
  cumulativeWaste: number;
}

interface CumulativeYieldSeries {
  batchId: string;
  batchName: string;
  color: string;
  data: CumulativeYieldPoint[];
}

type CumulativeYieldChartProps = {
  className?: string;
  title?: string;
} & (
  | { data: CumulativeYieldPoint[]; series?: never }
  | { series: CumulativeYieldSeries[]; data?: never }
);

const COLOR_CLASS_A = '#10b981';
const COLOR_WASTE = '#ef4444';

export function CumulativeYieldChart(props: CumulativeYieldChartProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  const cardTitle =
    props.title ?? h?.cumulativeYieldProgress ?? 'Cumulative Yield Progress';
  const yAxisLabel = h?.totalYieldKg ?? 'Total Yield (kg)';
  const emptyLabel = h?.noHarvestsInPeriod ?? 'No yield data';

  const isMulti = 'series' in props && props.series !== undefined;

  return (
    <Card className={props.className}>
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold">{cardTitle}</h3>
        {isMulti ? (
          <MultiBatchView
            series={props.series}
            yAxisLabel={yAxisLabel}
            emptyLabel={emptyLabel}
          />
        ) : (
          <SingleBatchView
            data={props.data}
            yAxisLabel={yAxisLabel}
            emptyLabel={emptyLabel}
            primaryLabel={h?.yieldKg ?? 'Yield (kg)'}
            secondaryLabel={h?.waste ?? 'Waste'}
          />
        )}
      </div>
    </Card>
  );
}

interface SingleBatchViewProps {
  data: CumulativeYieldPoint[];
  yAxisLabel: string;
  emptyLabel: string;
  primaryLabel: string;
  secondaryLabel: string;
}

function SingleBatchView({
  data,
  yAxisLabel,
  emptyLabel,
  primaryLabel,
  secondaryLabel,
}: SingleBatchViewProps) {
  // Build the chart rows from the GraphQL response — explicit field extraction
  // (don't spread the Apollo object, that drags in __typename and risks stale
  // fields). `sellable` is the cumulative of every saleable grade (A + B + C),
  // plotted against cumulative waste.
  const chartData = data.map((p) => ({
    date: p.date,
    classA: p.cumulativeClassA,
    classB: p.cumulativeClassB,
    classC: p.cumulativeClassC,
    waste: p.cumulativeWaste,
    sellable:
      p.cumulativeClassA + p.cumulativeClassB + p.cumulativeClassC,
  }));

  const isEmpty =
    chartData.length === 0 ||
    chartData.every(
      (r) => r.classA === 0 && r.classB === 0 && r.classC === 0 && r.waste === 0,
    );

  const primaryKey = 'sellable';
  const secondaryKey = 'waste';
  const secondaryColor = COLOR_WASTE;

  const TooltipContent = ({ active, payload, label }: ChartTooltipProps) => {
    if (!active || !payload?.length) return null;
    const primaryVal =
      payload.find((p) => p.dataKey === primaryKey)?.value ?? 0;
    const secondaryVal =
      payload.find((p) => p.dataKey === secondaryKey)?.value ?? 0;
    return (
      <ChartTooltipContainer>
        <p className="font-medium">{label}</p>
        <p
          className="text-sm"
          style={{ color: COLOR_CLASS_A }}
        >{`${primaryLabel}: ${primaryVal} kg`}</p>
        <p
          className="text-sm"
          style={{ color: secondaryColor }}
        >{`${secondaryLabel}: ${secondaryVal} kg`}</p>
      </ChartTooltipContainer>
    );
  };

  if (isEmpty) {
    return (
      <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
        {emptyLabel}
      </div>
    );
  }

  return (
    <>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#94a3b8"
              strokeOpacity={0.4}
            />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis
              fontSize={12}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip content={<TooltipContent />} />
            <Area
              type="monotone"
              dataKey={primaryKey}
              name={primaryLabel}
              stroke={COLOR_CLASS_A}
              strokeWidth={3}
              fill={COLOR_CLASS_A}
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey={secondaryKey}
              name={secondaryLabel}
              stroke={secondaryColor}
              strokeWidth={2}
              strokeDasharray="5 5"
              fill={secondaryColor}
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center justify-center gap-6">
        <LegendDot color={COLOR_CLASS_A} label={primaryLabel} />
        <LegendDot color={secondaryColor} label={secondaryLabel} />
      </div>
    </>
  );
}

interface MultiBatchViewProps {
  series: CumulativeYieldSeries[];
  yAxisLabel: string;
  emptyLabel: string;
}

function MultiBatchView({
  series,
  yAxisLabel,
  emptyLabel,
}: MultiBatchViewProps) {
  // Merge each batch's sellable cumulative (classA + classB + classC) by date so
  // every batch is a separate dataKey on the same chart.
  const byDate = new Map<string, Record<string, number | string>>();
  for (const s of series) {
    for (const p of s.data) {
      const row = byDate.get(p.date) ?? { date: p.date };
      row[s.batchId] =
        p.cumulativeClassA + p.cumulativeClassB + p.cumulativeClassC;
      byDate.set(p.date, row);
    }
  }
  const chartData = Array.from(byDate.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );

  const isEmpty =
    chartData.length === 0 ||
    chartData.every((row) => series.every((s) => !row[s.batchId]));

  const MultiTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (!active || !payload?.length) return null;
    return (
      <ChartTooltipContainer>
        <p className="font-medium">{label}</p>
        {payload.map((entry, i) => (
          <p
            key={`${entry.dataKey ?? i}`}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {`${entry.name ?? entry.dataKey}: ${entry.value} kg`}
          </p>
        ))}
      </ChartTooltipContainer>
    );
  };

  if (isEmpty) {
    return (
      <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#94a3b8"
            strokeOpacity={0.4}
          />
          <XAxis dataKey="date" fontSize={12} minTickGap={20} />
          <YAxis
            fontSize={12}
            label={{
              value: yAxisLabel,
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip content={<MultiTooltip />} />
          <Legend />
          {series.map((s) => (
            <Area
              key={s.batchId}
              type="monotone"
              dataKey={s.batchId}
              name={s.batchName}
              stroke={s.color}
              strokeWidth={2}
              fill={s.color}
              fillOpacity={0.15}
              connectNulls
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
