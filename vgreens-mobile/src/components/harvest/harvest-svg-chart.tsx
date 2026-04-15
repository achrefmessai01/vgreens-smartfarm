import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Line, Circle } from 'react-native-svg';
import { useAppTheme } from '@/lib/theme-preference';

interface Point {
  x: string;
  y: number;
}

interface HarvestSvgLineChartProps {
  title: string;
  points: Point[];
  yLabel: string;
  color: string;
  height?: number;
}

export function HarvestSvgLineChart({
  title,
  points,
  yLabel,
  color,
  height = 140,
}: HarvestSvgLineChartProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 12,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        chartTitle: {
          fontSize: 14,
          fontWeight: '700',
          color: colors.foreground,
          marginBottom: 8,
        },
        empty: {
          fontSize: 13,
          color: colors.mutedForeground,
          paddingVertical: 24,
        },
        axisHint: {
          fontSize: 10,
          color: colors.mutedForeground,
          marginTop: 4,
        },
      }),
    [colors],
  );

  const w = 320;
  const pad = { l: 8, r: 8, t: 8, b: 24 };
  const innerW = w - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const ys = points.map((p) => p.y);
  const minY = ys.length ? Math.min(...ys) : 0;
  const maxY = ys.length ? Math.max(...ys) : 1;
  const span = maxY - minY || 1;

  const coords = points.map((p, i) => {
    const x =
      pad.l +
      (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
    const ny = (p.y - minY) / span;
    const y = pad.t + innerH * (1 - ny);
    return `${x},${y}`;
  });

  const last = coords.length
    ? coords[coords.length - 1].split(',').map(Number)
    : [0, 0];

  const axisStroke = `${colors.mutedForeground}55`;

  if (points.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.chartTitle}>{title}</Text>
        <Text style={styles.empty}>No data for this period</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.chartTitle}>{title}</Text>
      <Svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`}>
        <Line
          x1={pad.l}
          y1={pad.t + innerH}
          x2={w - pad.r}
          y2={pad.t + innerH}
          stroke={axisStroke}
          strokeWidth={1}
        />
        <Polyline
          points={coords.join(' ')}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Circle cx={last[0]} cy={last[1]} r={4} fill={color} />
      </Svg>
      <Text style={styles.axisHint}>{yLabel}</Text>
    </View>
  );
}
