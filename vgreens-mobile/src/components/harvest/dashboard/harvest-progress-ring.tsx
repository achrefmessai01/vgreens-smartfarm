import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface HarvestProgressRingProps {
  value: number; // 0..1
  size?: number;
  strokeWidth?: number;
  colorFrom: string;
  colorTo: string;
  trackColor: string;
  label?: string;
  sublabel?: string;
  primaryText?: string;
  primaryTextColor?: string;
  sublabelColor?: string;
  gradientId: string;
}

function HarvestProgressRingBase({
  value,
  size = 128,
  strokeWidth = 10,
  colorFrom,
  colorTo,
  trackColor,
  label,
  sublabel,
  primaryText,
  primaryTextColor = '#fff',
  sublabelColor,
  gradientId,
}: HarvestProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const c = Math.PI * 2 * r;
  const clamped = Math.max(0, Math.min(1, value));
  const offset = c * (1 - clamped);

  const styles = StyleSheet.create({
    wrap: { width: size, height: size, alignItems: 'center', justifyContent: 'center' },
    inner: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
    label: { fontSize: 9, fontWeight: '800', letterSpacing: 1, opacity: 0.7 },
    primary: { fontSize: size > 110 ? 26 : 18, fontWeight: '800', letterSpacing: -0.5 },
    sub: { fontSize: 9, opacity: 0.8, marginTop: 2 },
  });

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colorFrom} />
            <Stop offset="1" stopColor={colorTo} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.inner}>
        {label ? (
          <Text style={[styles.label, { color: primaryTextColor }]}>{label}</Text>
        ) : null}
        {primaryText ? (
          <Text style={[styles.primary, { color: primaryTextColor }]}>
            {primaryText}
          </Text>
        ) : null}
        {sublabel ? (
          <Text
            style={[
              styles.sub,
              { color: sublabelColor ?? primaryTextColor },
            ]}
          >
            {sublabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export const HarvestProgressRing = memo(HarvestProgressRingBase);
HarvestProgressRing.displayName = 'HarvestProgressRing';
