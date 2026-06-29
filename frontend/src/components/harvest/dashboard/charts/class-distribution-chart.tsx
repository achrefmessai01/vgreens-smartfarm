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
import { classLetter } from '@/lib/harvest-utils';
import {
  ChartTooltipContainer,
  type ChartTooltipProps,
} from '../chart-helpers';

// Per-day per-class kg, classes positional and dynamic (index 0=A, 1=B, ...).
interface ClassDistributionData {
  date: string;
  classes: number[];
  waste: number;
}

interface ClassDistributionSeries {
  batchId: string;
  batchName: string;
  color: string;
  classes: number[];
  waste: number;
}

type ClassDistributionChartProps = {
  className?: string;
  title?: string;
} & (
  | { data: ClassDistributionData[]; series?: never }
  | { series: ClassDistributionSeries[]; data?: never }
);

// Solid fills cycled per class index; waste is always red.
const CLASS_FILLS = ['#10b981', '#14b8a6', '#f59e0b', '#3b82f6', '#a855f7'];
const WASTE_FILL = '#ef4444';

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
  const wasteName = h?.waste ?? 'Waste';
  const classLabelTpl = h?.qualityClassLabel ?? 'Quality {class}';
  const classLabel = (i: number) =>
    classLabelTpl.replace('{class}', classLetter(i));

  const rows = isMulti
    ? props.series.map((s) => ({
        label: s.batchName,
        classes: s.classes,
        waste: s.waste,
      }))
    : props.data.map((d) => ({
        label: d.date,
        classes: d.classes,
        waste: d.waste,
      }));
  // Flatten the per-class arrays into discrete keys (class0, class1, ...) recharts
  // can stack, padding to the widest row.
  const maxClasses = Math.max(0, ...rows.map((r) => r.classes.length));
  const chartData = rows.map((r) => {
    const point: Record<string, number | string> = {
      label: r.label,
      waste: r.waste,
    };
    for (let i = 0; i < maxClasses; i++) point[`class${i}`] = r.classes[i] ?? 0;
    return point;
  });
  const classIdxs = Array.from({ length: maxClasses }, (_, i) => i);

  return (
    <Card className={className}>
      <div className="p-4 sm:p-6">
        <h3 className="mb-4 text-lg font-semibold">
          {title ?? h?.classDistribution ?? 'Class Distribution'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="opacity-60"
                stroke="#94a3b8"
              />
              <XAxis
                dataKey="label"
                fontSize={11}
                angle={-35}
                textAnchor="end"
                height={55}
                interval={isMulti ? 'preserveStartEnd' : 0}
                minTickGap={isMulti ? 20 : undefined}
                tickMargin={8}
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
              {classIdxs.map((i) => (
                <Bar
                  key={i}
                  dataKey={`class${i}`}
                  stackId="a"
                  fill={CLASS_FILLS[i % CLASS_FILLS.length]}
                  name={classLabel(i)}
                  radius={i === 0 ? [0, 0, 4, 4] : undefined}
                />
              ))}
              <Bar
                dataKey="waste"
                stackId="a"
                fill={WASTE_FILL}
                name={wasteName}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
