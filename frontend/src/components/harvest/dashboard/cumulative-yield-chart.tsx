import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/i18n';

interface CumulativeYieldData {
  date: string;
  cumulative: number;
  cumulativeWaste: number;
}

interface CumulativeYieldChartProps {
  data: CumulativeYieldData[];
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{`Date: ${label}`}</p>
        <p className="text-sm text-emerald-500">
          {`Yield: ${payload.find((p: any) => p.dataKey === 'cumulative')?.value || 0} kg`}
        </p>
        <p className="text-sm text-red-500">
          {`Waste: ${payload.find((p: any) => p.dataKey === 'cumulativeWaste')?.value || 0} kg`}
        </p>
      </div>
    );
  }
  return null;
};

const CustomDot = (props: any) => {
  const { cx, cy } = props;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#10b981"
      stroke="#059669"
      strokeWidth={2}
      className="hover:r-6 transition-all duration-200 cursor-pointer"
      style={{
        filter: 'drop-shadow(0 4px 6px rgba(16, 185, 129, 0.4))',
      }}
    />
  );
};

export function CumulativeYieldChart({ data, className }: CumulativeYieldChartProps) {
  const { t } = useI18n();

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {t.pages.harvest?.cumulativeYieldProgress || 'Cumulative Yield Progress'}
        </h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-60" stroke="#94a3b8" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                className="text-muted-foreground"
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis 
                fontSize={12}
                className="text-muted-foreground"
                label={{ value: t.pages.harvest?.totalYieldKg || 'Total Yield (kg)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#10b981"
                strokeWidth={3}
                strokeDasharray="3 0"
                fill="url(#cumulativeGradient)"
                dot={<CustomDot />}
                activeDot={{ r: 6, className: "drop-shadow-lg" }}
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
                fill="url(#wasteGradient)"
                dot={{ r: 3, fill: "#ef4444" }}
                activeDot={{ r: 5, fill: "#ef4444" }}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-medium text-foreground">
              {t.pages.harvest?.yieldKg || 'Yield (kg)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-foreground">
              {t.pages.harvest?.waste || 'Waste'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}