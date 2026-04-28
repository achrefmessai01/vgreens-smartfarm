import { Fragment, useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useAppTheme } from '@/lib/theme-preference';
import { createChartCardStyles } from './chart-card.styles';
import {
  GridAxes,
  XAxisLabels,
  buildTicks,
  formatTick,
} from './chart-primitives';

interface Row {
  date: string;
  marketable: number;
  waste: number;
}

interface HarvestBarChartProps {
  title: string;
  subtitle?: string;
  rows: Row[];
  height?: number;
}

const MARKETABLE = { top: '#34d399', bottom: '#059669' };
const WASTE = { top: '#f87171', bottom: '#dc2626' };

export function HarvestBarChart({
  title,
  subtitle,
  rows,
  height = 200,
}: HarvestBarChartProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createChartCardStyles(colors), [colors]);

  const data = rows.slice(-8);
  const w = 320;
  const pad = { l: 30, r: 10, t: 8, b: 22 };
  const innerW = w - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const totals = data.map((r) => r.marketable + r.waste);
  const maxY = Math.max(1, ...totals);
  const ticks = buildTicks(0, maxY, 4);

  if (data.length === 0) {
    return (
      <View style={styles.wrap}>
        <View style={styles.header}>
          <View style={styles.titleCol}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        <Text style={styles.empty}>No distribution data</Text>
      </View>
    );
  }

  const slot = innerW / data.length;
  const barWidth = Math.max(8, Math.min(28, slot * 0.6));

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Text style={styles.peakText}>Peak: {formatTick(maxY)} kg</Text>
      </View>
      <Svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`}>
        <Defs>
          <LinearGradient id="bar-marketable" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={MARKETABLE.top} />
            <Stop offset="1" stopColor={MARKETABLE.bottom} />
          </LinearGradient>
          <LinearGradient id="bar-waste" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={WASTE.top} />
            <Stop offset="1" stopColor={WASTE.bottom} />
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
          labels={data.map((r) => r.date)}
          width={w}
          height={height}
          padding={pad}
          textColor={colors.mutedForeground}
        />
        {data.map((r, i) => {
          const cx = pad.l + slot * (i + 0.5);
          const x = cx - barWidth / 2;
          const mH = innerH * (r.marketable / maxY);
          const wH = innerH * (r.waste / maxY);
          const yWaste = pad.t + innerH - wH;
          const yMarketable = yWaste - mH;
          return (
            <Fragment key={`${r.date}-${i}`}>
              {r.waste > 0 && (
                <Rect
                  x={x}
                  y={yWaste}
                  width={barWidth}
                  height={wH}
                  fill="url(#bar-waste)"
                />
              )}
              {r.marketable > 0 && (
                <Rect
                  x={x}
                  y={yMarketable}
                  width={barWidth}
                  height={mH}
                  rx={3}
                  ry={3}
                  fill="url(#bar-marketable)"
                />
              )}
            </Fragment>
          );
        })}
      </Svg>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: MARKETABLE.top }]} />
          <Text style={styles.legendText}>Marketable</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: WASTE.top }]} />
          <Text style={styles.legendText}>Waste</Text>
        </View>
      </View>
    </View>
  );
}
