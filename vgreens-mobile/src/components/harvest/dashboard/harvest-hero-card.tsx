import { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';
import { HarvestProgressRing } from './harvest-progress-ring';
import { createHeroCardStyles } from './harvest-hero-card.styles';

interface HarvestHeroCardProps {
  totalYield: number;
  goal: number;
  harvestCount: number;
  daysActive: number;
  trendPercent?: number | null;
  trendLabel?: string;
}

function formatKg(n: number): string {
  if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return n.toFixed(0);
}

function HarvestHeroCardBase({
  totalYield,
  goal,
  harvestCount,
  daysActive,
  trendPercent,
  trendLabel = 'vs last season',
}: HarvestHeroCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createHeroCardStyles(colors), [colors]);

  const progress = goal > 0 ? Math.min(1, totalYield / goal) : 0;
  const percent = Math.round(progress * 100);

  return (
    <View style={styles.card}>
      <View style={styles.glowAccent} />
      <View style={styles.row}>
        <View style={styles.ringCol}>
          <HarvestProgressRing
            value={progress}
            size={128}
            strokeWidth={10}
            colorFrom="#34d399"
            colorTo="#10b981"
            trackColor={`${colors.mutedForeground}33`}
            label="GOAL"
            primaryText={`${percent}%`}
            sublabel={`of ${formatKg(goal)} kg`}
            sublabelColor={colors.mutedForeground}
            primaryTextColor={colors.foreground}
            gradientId="grad-hero-ring"
          />
        </View>

        <View style={styles.statsCol}>
          <Text style={styles.eyebrow}>SEASON TO DATE</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Text style={styles.value}>{formatKg(totalYield)}</Text>
            <Text style={styles.unit}>kg</Text>
          </View>
          {trendPercent != null ? (
            <View style={styles.trendRow}>
              <TrendingUp size={12} color="#10b981" />
              <Text style={styles.trendText}>
                {trendPercent >= 0 ? '+' : ''}
                {trendPercent.toFixed(1)}% {trendLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={styles.footerItem}>
          <Text style={styles.footerValue}>{harvestCount}</Text>
          <Text style={styles.footerLabel}>harvests</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerValue}>{daysActive}</Text>
          <Text style={styles.footerLabel}>days active</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerValue}>{formatKg(goal - totalYield)}</Text>
          <Text style={styles.footerLabel}>kg to goal</Text>
        </View>
      </View>
    </View>
  );
}

export const HarvestHeroCard = memo(HarvestHeroCardBase);
HarvestHeroCard.displayName = 'HarvestHeroCard';
