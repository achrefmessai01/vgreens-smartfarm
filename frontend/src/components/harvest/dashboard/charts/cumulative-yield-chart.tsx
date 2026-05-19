import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import { useHarvestClassBMode } from '@/lib/harvest-class-b-mode';
import {
  ChartDot,
  ChartTooltipContainer,
  type ChartTooltipProps,
} from '../chart-helpers';

interface CumulativeYieldData {
  date: string;
  cumulative: number;
  cumulativeClassB: number;
  cumulativeWaste: number;
}

interface CumulativeYieldSeries {
  batchId: string;
  batchName: string;
  color: string;
  data: CumulativeYieldData[];
}

type CumulativeYieldChartProps = {
  className?: string;
  title?: string;
} & (
  | { data: CumulativeYieldData[]; series?: never }
  | { series: CumulativeYieldSeries[]; data?: never }
);

const cumulativeDot = <ChartDot fill="#10b981" stroke="#059669" />;

function mergeSeries(
  series: CumulativeYieldSeries[],
): Array<Record<string, unknown>> {
  const byDate = new Map<string, Record<string, unknown>>();
  for (const s of series) {
    for (const point of s.data) {
      const existing = byDate.get(point.date) ?? { date: point.date };
      existing[s.batchId] = point.cumulative;
      byDate.set(point.date, existing);
    }
  }
  return Array.from(byDate.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );
}

export function CumulativeYieldChart(props: CumulativeYieldChartProps) {
  const { t } = useI18n();
  const classBMode = useHarvestClassBMode();
  const h = t.pages.harvest;
  const { className, title } = props;
  const isMulti = 'series' in props && props.series !== undefined;

  const primaryLabel = classBMode
    ? (h?.quality1 ?? 'Quality 1')
    : (h?.yieldKg ?? 'Yield (kg)');
  const secondaryLabel = classBMode
    ? (h?.quality2 ?? 'Quality 2')
    : (h?.waste ?? 'Waste');
  const secondaryDataKey: 'cumulativeClassB' | 'cumulativeWaste' = classBMode
    ? 'cumulativeClassB'
    : 'cumulativeWaste';
  const secondaryStroke = classBMode ? '#14b8a6' : '#ef4444';
  const secondaryGradientId = classBMode
    ? 'cumulativeClassBGradient'
    : 'cumulativeWasteGradient';
  const secondaryDotFill = classBMode ? '#14b8a6' : '#ef4444';
  const secondaryShadow = classBMode
    ? 'drop-shadow(0 2px 4px rgba(20, 184, 166, 0.3))'
    : 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))';
  const secondaryLegendColor = classBMode ? 'bg-teal-500' : 'bg-red-500';

  const CumulativeTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (!active || !payload?.length) return null;
    if (isMulti) {
      return (
        <ChartTooltipContainer>
          <p className="font-medium">{`Date: ${label}`}</p>
          {payload.map((entry, idx) => (
            <p
              key={`${entry.dataKey ?? idx}`}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {`${entry.name ?? 'Yield'}: ${entry.value} kg`}
            </p>
          ))}
        </ChartTooltipContainer>
      );
    }
    const yieldVal =
      payload.find((p) => p.dataKey === 'cumulative')?.value ?? 0;
    const secondaryVal =
      payload.find((p) => p.dataKey === secondaryDataKey)?.value ?? 0;
    return (
      <ChartTooltipContainer>
        <p className="font-medium">{`Date: ${label}`}</p>
        <p className="text-sm text-emerald-500">{`${primaryLabel}: ${yieldVal} kg`}</p>
        <p
          className={`text-sm ${classBMode ? 'text-teal-500' : 'text-red-500'}`}
        >{`${secondaryLabel}: ${secondaryVal} kg`}</p>
      </ChartTooltipContainer>
    );
  };

  const chartData = isMulti ? mergeSeries(props.series) : props.data;

  return (
    <Card className={className}>
      <div className="p-8">
        <h3 className="mb-4 text-lg font-semibold">
          {title ?? h?.cumulativeYieldProgress ?? 'Cumulative Yield Progress'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 1, right: 30, left: 20, bottom: 1 }}
            >
              <defs>
                <linearGradient
                  id="cumulativeGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient
                  id="cumulativeWasteGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient
                  id="cumulativeClassBGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="opacity-60"
                stroke="#94a3b8"
              />
              <XAxis
                dataKey="date"
                fontSize={12}
                angle={0}
                textAnchor="middle"
                interval={isMulti ? 'preserveStartEnd' : 0}
                minTickGap={isMulti ? 20 : undefined}
              />
              <YAxis
                fontSize={12}
                label={{
                  value: h?.totalYieldKg ?? 'Total Yield (kg)',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip content={<CumulativeTooltip />} />
              {isMulti && <Legend />}
              {isMulti ? (
                props.series.map((s) => (
                  <Area
                    key={s.batchId}
                    type="monotone"
                    dataKey={s.batchId}
                    name={s.batchName}
                    stroke={s.color}
                    strokeWidth={2}
                    fill={s.color}
                    fillOpacity={0.15}
                    dot={{ r: 3, fill: s.color, stroke: s.color }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                ))
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#cumulativeGradient)"
                    dot={cumulativeDot}
                    activeDot={{ r: 6 }}
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={secondaryDataKey}
                    stroke={secondaryStroke}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill={`url(#${secondaryGradientId})`}
                    dot={{ r: 3, fill: secondaryDotFill }}
                    activeDot={{ r: 5, fill: secondaryDotFill }}
                    style={{
                      filter: secondaryShadow,
                    }}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {!isMulti && (
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium">{primaryLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${secondaryLegendColor}`} />
              <span className="text-sm font-medium">{secondaryLabel}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
