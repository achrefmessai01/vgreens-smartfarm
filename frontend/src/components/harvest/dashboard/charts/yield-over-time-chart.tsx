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

interface YieldOverTimeData {
  date: string;
  yield: number;
}

interface YieldSeries {
  batchId: string;
  batchName: string;
  color: string;
  data: YieldOverTimeData[];
}

type YieldOverTimeChartProps = {
  className?: string;
  title?: string;
} & (
  | { data: YieldOverTimeData[]; series?: never }
  | { series: YieldSeries[]; data?: never }
);

const YieldTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipContainer>
      <p className="font-medium">{`Date: ${label}`}</p>
      {payload.map((entry, idx) => (
        <p
          key={`${entry.dataKey ?? idx}`}
          className="text-sm"
          style={{ color: entry.color ?? '#3b82f6' }}
        >
          {`${entry.name ?? 'Yield'}: ${entry.value} kg`}
        </p>
      ))}
    </ChartTooltipContainer>
  );
};

const yieldDot = <ChartDot fill="#3b82f6" stroke="#1d4ed8" />;

function mergeSeries(series: YieldSeries[]): Array<Record<string, unknown>> {
  const byDate = new Map<string, Record<string, unknown>>();
  for (const s of series) {
    for (const point of s.data) {
      const existing = byDate.get(point.date) ?? { date: point.date };
      existing[s.batchId] = point.yield;
      byDate.set(point.date, existing);
    }
  }
  return Array.from(byDate.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );
}

export function YieldOverTimeChart(props: YieldOverTimeChartProps) {
  const { t } = useI18n();
  const { className, title } = props;
  const isMulti = 'series' in props && props.series !== undefined;

  const chartData = isMulti ? mergeSeries(props.series) : props.data;

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold">
          {title ?? t.pages.harvest?.yieldOverTime ?? 'Yield Over Time'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                fontSize={12}
                label={{
                  value: t.pages.harvest?.yieldKg ?? 'Yield (kg)',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip content={<YieldTooltip />} />
              {isMulti && <Legend />}
              {isMulti
                ? props.series.map((s) => (
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
                : (
                    <Line
                      type="monotone"
                      dataKey="yield"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={yieldDot}
                      activeDot={{ r: 6 }}
                      style={{
                        filter:
                          'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))',
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
