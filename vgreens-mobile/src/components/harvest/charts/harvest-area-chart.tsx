import { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Polyline,
  Stop,
} from 'react-native-svg';
import { useAppTheme } from '@/lib/theme-preference';
import { createChartCardStyles } from './chart-card.styles';
import {
  GridAxes,
  XAxisLabels,
  buildTicks,
  formatTick,
} from './chart-primitives';

interface Point {
  x: string;
  y: number;
}

interface HarvestAreaChartProps {
  title: string;
  subtitle?: string;
  points: Point[];
  unit: string;
  color: string;
  gradientId: string;
  height?: number;
}

export function HarvestAreaChart({
  title,
  subtitle,
  points,
  unit,
  color,
  gradientId,
  height = 180,
}: HarvestAreaChartProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () => createChartCardStyles(colors, color),
    [colors, color],
  );

  const w = 320;
  const pad = { l: 30, r: 10, t: 8, b: 22 };
  const innerW = w - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const ys = points.map((p) => p.y);
  const maxY = ys.length ? Math.max(...ys, 1) : 1;
  const span = maxY || 1;
  const ticks = buildTicks(0, maxY, 4);

  const coords = points.map((p, i) => {
    const x =
      pad.l +
      (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
    const y = pad.t + innerH * (1 - p.y / span);
    return { x, y };
  });

  const lineStr = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const areaPath = coords.length
    ? `M ${coords[0].x},${pad.t + innerH} L ${lineStr
        .split(' ')
        .join(' L ')} L ${coords[coords.length - 1].x},${pad.t + innerH} Z`
    : '';
  const last = coords[coords.length - 1];
  const lastValue = points[points.length - 1]?.y ?? 0;

  if (points.length === 0) {
    return (
      <View style={styles.wrap}>
        <View style={styles.header}>
          <View style={styles.titleCol}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        <Text style={styles.empty}>No data for this period</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.readoutRow}>
          <Text style={styles.readout}>{formatTick(lastValue)}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
      <Svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.35} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <GridAxes
          width={w}
          height={height}
          padding={pad}
          ticks={ticks}
          stroke={`${colors.mutedForeground}33`}
          textColor={colors.mutedForeground}
        />
        <XAxisLabels
          labels={points.map((p) => p.x)}
          width={w}
          height={height}
          padding={pad}
          textColor={colors.mutedForeground}
        />
        {coords.length > 1 && <Path d={areaPath} fill={`url(#${gradientId})`} />}
        <Polyline
          points={lineStr}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {last && (
          <>
            <Circle cx={last.x} cy={last.y} r={6} fill={color} opacity={0.25} />
            <Circle cx={last.x} cy={last.y} r={3.5} fill={color} />
          </>
        )}
      </Svg>
    </View>
  );
}
