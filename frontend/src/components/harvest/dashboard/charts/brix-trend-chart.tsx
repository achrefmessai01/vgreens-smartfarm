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

interface BrixTrendData {
  date: string;
  brix: number;
}

interface BrixSeries {
  batchId: string;
  batchName: string;
  color: string;
  data: BrixTrendData[];
}

type BrixTrendChartProps = {
  className?: string;
  title?: string;
} & (
  | { data: BrixTrendData[]; series?: never }
  | { series: BrixSeries[]; data?: never }
);

const BrixTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipContainer>
      <p className="font-medium">{`Date: ${label}`}</p>
      {payload.map((entry, idx) => (
        <p
          key={`${entry.dataKey ?? idx}`}
          className="text-sm"
          style={{ color: entry.color ?? '#06b6d4' }}
        >
          {`${entry.name ?? 'Brix'}: ${entry.value}°Bx`}
        </p>
      ))}
    </ChartTooltipContainer>
  );
};

const brixDot = <ChartDot fill="#06b6d4" stroke="#0891b2" />;

function mergeSeries(series: BrixSeries[]): Array<Record<string, unknown>> {
  const byDate = new Map<string, Record<string, unknown>>();
  for (const s of series) {
    for (const point of s.data) {
      const existing = byDate.get(point.date) ?? { date: point.date };
      existing[s.batchId] = point.brix;
      byDate.set(point.date, existing);
    }
  }
  return Array.from(byDate.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );
}

export function BrixTrendChart(props: BrixTrendChartProps) {
  const { t } = useI18n();
  const { className, title } = props;
  const isMulti = 'series' in props && props.series !== undefined;

  const chartData = isMulti ? mergeSeries(props.series) : props.data;

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="mb-8 text-lg font-semibold">
          {title ??
            t.pages.harvest?.brixTrendOverTime ??
            'Brix Trend Over Time'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 1, right: 30, left: 20, bottom: 1 }}
            >
              <defs>
                <linearGradient id="brixGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
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
                domain={isMulti ? ['auto', 'auto'] : [6, 9]}
                label={{
                  value: t.pages.harvest?.brixValue ?? 'Brix (°Bx)',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip content={<BrixTooltip />} />
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
                  dataKey="brix"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={brixDot}
                  activeDot={{ r: 6 }}
                  strokeDasharray="5 5"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(6, 182, 212, 0.3))',
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
