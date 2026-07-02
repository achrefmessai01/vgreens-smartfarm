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
  ChartTitle,
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
  subtitle?: string;
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
          {`${entry.name ?? entry.dataKey}: ${
            typeof entry.value === 'number' ? entry.value.toFixed(1) : 0
          }%`}
        </p>
      ))}
    </ChartTooltipContainer>
  );
};

export function ClassDistributionChart(props: ClassDistributionChartProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const { className, title, subtitle } = props;
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
  // can stack, padding to the widest row. Each row is normalised to percentages
  // of that row's total (sum of classes + waste) so stacks always reach 100%.
  const maxClasses = Math.max(0, ...rows.map((r) => r.classes.length));
  const chartData = rows.map((r) => {
    const total =
      r.classes.reduce((sum, val) => sum + (val ?? 0), 0) + (r.waste ?? 0);
    const toPct = (value: number) => (total > 0 ? (value / total) * 100 : 0);
    const point: Record<string, number | string> = {
      label: r.label,
      waste: toPct(r.waste ?? 0),
    };
    for (let i = 0; i < maxClasses; i++) {
      point[`class${i}`] = toPct(r.classes[i] ?? 0);
    }
    return point;
  });
  const classIdxs = Array.from({ length: maxClasses }, (_, i) => i);

  // Adaptive x-axis density so labels stop stacking on top of each other:
  //  - comparing batches → let recharts pick start/end + fill by gap
  //  - up to ~2 weeks of days → show every tick
  //  - up to ~45 days (Month view) → weekly ticks
  //  - longer (Total view, 60+ days) → roughly monthly ticks
  const xInterval: number | 'preserveStartEnd' = isMulti
    ? 'preserveStartEnd'
    : chartData.length <= 14
      ? 0
      : chartData.length <= 45
        ? 6
        : 29;

  return (
    <Card className={className}>
      <div className="p-4 sm:p-6">
        <ChartTitle
          title={title ?? h?.classDistribution ?? 'Class Distribution'}
          subtitle={subtitle}
        />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
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
                interval={xInterval}
                minTickGap={isMulti ? 20 : 8}
                tickMargin={8}
              />
              <YAxis
                fontSize={12}
                width={72}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(value: number) => `${value}%`}
                label={{
                  value: h?.percentage ?? 'Percentage (%)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' },
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
