import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import {
  ChartDot,
  ChartTooltipContainer,
  type ChartTooltipProps,
} from '../chart-helpers';

interface YieldPerRunningMeterData {
  date: string;
  yieldPerRunningMeter: number;
}

interface YieldPerRunningMeterSeries {
  batchId: string;
  batchName: string;
  color: string;
  data: YieldPerRunningMeterData[];
}

type YieldPerRunningMeterChartProps = {
  className?: string;
  title?: string;
} & (
  | { data: YieldPerRunningMeterData[]; series?: never }
  | { series: YieldPerRunningMeterSeries[]; data?: never }
);

const YieldPerRunningMeterTooltip = ({
  active,
  payload,
  label,
}: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipContainer>
      <p className="font-medium">{`Date: ${label}`}</p>
      {payload.map((entry, idx) => (
        <p
          key={`${entry.dataKey ?? idx}`}
          className="text-sm"
          style={{ color: entry.color ?? '#6366f1' }}
        >
          {`${entry.name ?? 'Yield/running m'}: ${entry.value} kg/m`}
        </p>
      ))}
    </ChartTooltipContainer>
  );
};

const yieldPerRunningMeterDot = <ChartDot fill="#6366f1" stroke="#4338ca" />;

function mergeSeries(
  series: YieldPerRunningMeterSeries[],
): Array<Record<string, unknown>> {
  const byDate = new Map<string, Record<string, unknown>>();
  for (const s of series) {
    for (const point of s.data) {
      const existing = byDate.get(point.date) ?? { date: point.date };
      existing[s.batchId] = point.yieldPerRunningMeter;
      byDate.set(point.date, existing);
    }
  }
  return Array.from(byDate.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );
}

export function YieldPerRunningMeterChart(
  props: YieldPerRunningMeterChartProps,
) {
  const { t } = useI18n();
  const { className, title } = props;
  const isMulti = 'series' in props && props.series !== undefined;

  const chartData = isMulti ? mergeSeries(props.series) : props.data;

  return (
    <Card className={className}>
      <div className="p-8">
        <h3 className="mb-4 text-lg font-semibold">
          {title ??
            t.pages.harvest?.yieldPerRunningMeterOverTime ??
            'Yield per Running Meter Over Time'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 1, right: 30, left: 20, bottom: 1 }}
            >
              <defs>
                <linearGradient
                  id="yieldPerRunningMeterGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
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
                  value:
                    t.pages.harvest?.yieldPerRunningMeterUnit ??
                    'Yield (kg/running m)',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip content={<YieldPerRunningMeterTooltip />} />
              {isMulti && <Legend />}
              {isMulti ? (
                props.series.map((s) => (
                  <Line
                    key={s.batchId}
                    type="monotone"
                    dataKey={s.batchId}
                    name={s.batchName}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: s.color, stroke: s.color }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                ))
              ) : (
                <Line
                  type="monotone"
                  dataKey="yieldPerRunningMeter"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={yieldPerRunningMeterDot}
                  activeDot={{ r: 6 }}
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))',
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
