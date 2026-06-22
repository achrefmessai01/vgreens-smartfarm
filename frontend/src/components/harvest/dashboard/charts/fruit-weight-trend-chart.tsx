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

interface FruitWeightTrendData {
  date: string;
  weight: number;
}

interface FruitWeightSeries {
  batchId: string;
  batchName: string;
  color: string;
  data: FruitWeightTrendData[];
}

type FruitWeightTrendChartProps = {
  className?: string;
  title?: string;
} & (
  | { data: FruitWeightTrendData[]; series?: never }
  | { series: FruitWeightSeries[]; data?: never }
);

const FruitWeightTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipContainer>
      <p className="font-medium">{`Date: ${label}`}</p>
      {payload.map((entry, idx) => (
        <p
          key={`${entry.dataKey ?? idx}`}
          className="text-sm"
          style={{ color: entry.color ?? '#f59e0b' }}
        >
          {`${entry.name ?? 'Fruit Weight'}: ${entry.value} g`}
        </p>
      ))}
    </ChartTooltipContainer>
  );
};

const fruitWeightDot = <ChartDot fill="#f59e0b" stroke="#d97706" />;

function mergeSeries(
  series: FruitWeightSeries[],
): Array<Record<string, unknown>> {
  const byDate = new Map<string, Record<string, unknown>>();
  for (const s of series) {
    for (const point of s.data) {
      const existing = byDate.get(point.date) ?? { date: point.date };
      existing[s.batchId] = point.weight;
      byDate.set(point.date, existing);
    }
  }
  return Array.from(byDate.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );
}

export function FruitWeightTrendChart(props: FruitWeightTrendChartProps) {
  const { t } = useI18n();
  const { className, title } = props;
  const isMulti = 'series' in props && props.series !== undefined;

  const chartData = isMulti ? mergeSeries(props.series) : props.data;

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="mb-8 text-lg font-semibold">
          {title ??
            t.pages.harvest?.fruitWeightTrendOverTime ??
            'Fruit Weight Trend Over Time'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 1, right: 30, left: 20, bottom: 1 }}
            >
              <defs>
                <linearGradient
                  id="fruitWeightGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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
                domain={['auto', 'auto']}
                label={{
                  value:
                    t.pages.harvest?.fruitWeightValue ?? 'Fruit Weight (g)',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip content={<FruitWeightTooltip />} />
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
                  dataKey="weight"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={fruitWeightDot}
                  activeDot={{ r: 6 }}
                  strokeDasharray="5 5"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3))',
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
