import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import { useHarvestClassBMode } from '@/lib/harvest-class-b-mode';
import {
  ChartTooltipContainer,
  type ChartTooltipProps,
} from '../chart-helpers';

interface ClassDistributionData {
  date: string;
  marketable: number;
  classB: number;
  waste: number;
}

interface ClassDistributionChartProps {
  data: ClassDistributionData[];
  className?: string;
}

const ClassTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipContainer>
      <p className="font-medium">{`Date: ${label}`}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {`${entry.name ?? entry.dataKey}: ${entry.value} kg`}
        </p>
      ))}
    </ChartTooltipContainer>
  );
};

export function ClassDistributionChart({
  data,
  className,
}: ClassDistributionChartProps) {
  const { t } = useI18n();
  const classBMode = useHarvestClassBMode();
  const h = t.pages.harvest;

  const primaryName = classBMode
    ? (h?.quality1 ?? 'Quality 1')
    : (h?.marketable ?? 'Marketable');
  const secondaryName = classBMode
    ? (h?.quality2 ?? 'Quality 2')
    : (h?.waste ?? 'Waste');
  const secondaryDataKey: 'classB' | 'waste' = classBMode ? 'classB' : 'waste';
  const secondaryGradientId = classBMode
    ? 'classBGradient'
    : 'wasteGradient';
  const secondaryShadow = classBMode
    ? 'drop-shadow(0 4px 6px rgba(20, 184, 166, 0.3))'
    : 'drop-shadow(0 4px 6px rgba(239, 68, 68, 0.3))';

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold">
          {h?.classDistribution ?? 'Class Distribution'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id="marketableGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={1} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="classBGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={1} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={1} />
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
                  value: h?.weightKg ?? 'Weight (kg)',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip content={<ClassTooltip />} />
              <Bar
                dataKey="marketable"
                stackId="a"
                fill="url(#marketableGradient)"
                name={primaryName}
                radius={[0, 0, 4, 4]}
                style={{
                  filter: 'drop-shadow(0 4px 6px rgba(16, 185, 129, 0.3))',
                }}
              />
              <Bar
                dataKey={secondaryDataKey}
                stackId="a"
                fill={`url(#${secondaryGradientId})`}
                name={secondaryName}
                radius={[4, 4, 0, 0]}
                style={{
                  filter: secondaryShadow,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
