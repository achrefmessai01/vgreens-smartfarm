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
import {
  ChartTooltipContainer,
  type ChartTooltipProps,
} from '../chart-helpers';

interface ClassDistributionData {
  date: string;
  marketable: number;
  classB: number;
  classC: number;
  waste: number;
}

interface ClassDistributionSeries {
  batchId: string;
  batchName: string;
  color: string;
  marketable: number;
  classB: number;
  classC: number;
  waste: number;
}

type ClassDistributionChartProps = {
  className?: string;
  title?: string;
} & (
  | { data: ClassDistributionData[]; series?: never }
  | { series: ClassDistributionSeries[]; data?: never }
);

const ClassTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipContainer>
      <p className="font-medium">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {`${entry.name ?? entry.dataKey}: ${Math.round((entry.value ?? 0) * 10) / 10} kg`}
        </p>
      ))}
    </ChartTooltipContainer>
  );
};

export function ClassDistributionChart(props: ClassDistributionChartProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const { className, title } = props;
  const isMulti = 'series' in props && props.series !== undefined;

  const qualityAName = h?.qualityA ?? 'Quality A';
  const qualityBName = h?.qualityB ?? 'Quality B';
  const qualityCName = h?.qualityC ?? 'Quality C';
  const wasteName = h?.waste ?? 'Waste';

  const chartData = isMulti
    ? props.series.map((s) => ({
        name: s.batchName,
        marketable: s.marketable,
        classB: s.classB,
        classC: s.classC,
        waste: s.waste,
        color: s.color,
      }))
    : props.data;
  const xKey = isMulti ? 'name' : 'date';

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold">
          {title ?? h?.classDistribution ?? 'Class Distribution'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
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
                <linearGradient id="classCGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={1} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="opacity-60"
                stroke="#94a3b8"
              />
              <XAxis
                dataKey={xKey}
                fontSize={12}
                angle={isMulti ? 0 : -45}
                textAnchor={isMulti ? 'middle' : 'end'}
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
                name={qualityAName}
                radius={[0, 0, 4, 4]}
                style={{
                  filter: 'drop-shadow(0 4px 6px rgba(16, 185, 129, 0.3))',
                }}
              />
              <Bar
                dataKey="classB"
                stackId="a"
                fill="url(#classBGradient)"
                name={qualityBName}
                style={{
                  filter: 'drop-shadow(0 4px 6px rgba(20, 184, 166, 0.3))',
                }}
              />
              <Bar
                dataKey="classC"
                stackId="a"
                fill="url(#classCGradient)"
                name={qualityCName}
                style={{
                  filter: 'drop-shadow(0 4px 6px rgba(245, 158, 11, 0.3))',
                }}
              />
              <Bar
                dataKey="waste"
                stackId="a"
                fill="url(#wasteGradient)"
                name={wasteName}
                radius={[4, 4, 0, 0]}
                style={{
                  filter: 'drop-shadow(0 4px 6px rgba(239, 68, 68, 0.3))',
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
