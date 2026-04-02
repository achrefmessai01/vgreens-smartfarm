import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

interface YieldOverTimeChartProps {
  data: YieldOverTimeData[];
  className?: string;
}

const YieldTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipContainer>
      <p className="font-medium">{`Date: ${label}`}</p>
      <p className="text-sm text-blue-500">{`Yield: ${payload[0].value} kg`}</p>
    </ChartTooltipContainer>
  );
};

const yieldDot = <ChartDot fill="#3b82f6" stroke="#1d4ed8" />;

export function YieldOverTimeChart({
  data,
  className,
}: YieldOverTimeChartProps) {
  const { t } = useI18n();

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold">
          {t.pages.harvest?.yieldOverTime ?? 'Yield Over Time'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
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
              <Line
                type="monotone"
                dataKey="yield"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={yieldDot}
                activeDot={{ r: 6 }}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))',
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
