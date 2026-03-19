import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import { ChartDot, ChartTooltipContainer, type ChartTooltipProps } from './chart-helpers';

interface BrixTrendData {
  date: string;
  brix: number;
}

interface BrixTrendChartProps {
  data: BrixTrendData[];
  className?: string;
}

const BrixTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipContainer>
      <p className="font-medium">{`Date: ${label}`}</p>
      <p className="text-sm text-cyan-500">{`Brix: ${payload[0].value}°Bx`}</p>
    </ChartTooltipContainer>
  );
};

const brixDot = <ChartDot fill="#06b6d4" stroke="#0891b2" />;

export function BrixTrendChart({ data, className }: BrixTrendChartProps) {
  const { t } = useI18n();

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {t.pages.harvest?.brixTrendOverTime ?? 'Brix Trend Over Time'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="brixGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-60" stroke="#94a3b8" />
              <XAxis dataKey="date" fontSize={12} angle={-45} textAnchor="end" interval={0} />
              <YAxis
                fontSize={12}
                domain={[6, 9]}
                label={{ value: t.pages.harvest?.brixValue ?? 'Brix (°Bx)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<BrixTooltip />} />
              <Line
                type="monotone"
                dataKey="brix"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={brixDot}
                activeDot={{ r: 6 }}
                strokeDasharray="5 5"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(6, 182, 212, 0.3))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
