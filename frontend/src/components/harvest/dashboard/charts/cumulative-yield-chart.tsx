import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import {
  ChartDot,
  ChartTooltipContainer,
  type ChartTooltipProps,
} from '../chart-helpers';

interface CumulativeYieldData {
  date: string;
  cumulative: number;
  cumulativeWaste: number;
}

interface CumulativeYieldChartProps {
  data: CumulativeYieldData[];
  className?: string;
}

const CumulativeTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  const yieldVal = payload.find((p) => p.dataKey === 'cumulative')?.value ?? 0;
  const wasteVal =
    payload.find((p) => p.dataKey === 'cumulativeWaste')?.value ?? 0;
  return (
    <ChartTooltipContainer>
      <p className="font-medium">{`Date: ${label}`}</p>
      <p className="text-sm text-emerald-500">{`Yield: ${yieldVal} kg`}</p>
      <p className="text-sm text-red-500">{`Waste: ${wasteVal} kg`}</p>
    </ChartTooltipContainer>
  );
};

const cumulativeDot = <ChartDot fill="#10b981" stroke="#059669" />;

export function CumulativeYieldChart({
  data,
  className,
}: CumulativeYieldChartProps) {
  const { t } = useI18n();

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold">
          {t.pages.harvest?.cumulativeYieldProgress ??
            'Cumulative Yield Progress'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                fontSize={12}
                label={{
                  value: t.pages.harvest?.totalYieldKg ?? 'Total Yield (kg)',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip content={<CumulativeTooltip />} />
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
                dataKey="cumulativeWaste"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#cumulativeWasteGradient)"
                dot={{ r: 3, fill: '#ef4444' }}
                activeDot={{ r: 5, fill: '#ef4444' }}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium">
              {t.pages.harvest?.yieldKg ?? 'Yield (kg)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-sm font-medium">
              {t.pages.harvest?.waste ?? 'Waste'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
