import { memo, useMemo, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/lib/theme-preference';

interface HarvestFormSectionProps {
  step?: number;
  title: string;
  description?: string;
  children: ReactNode;
}

function HarvestFormSectionBase({
  step,
  title,
  description,
  children,
}: HarvestFormSectionProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        section: {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          gap: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
        stepChip: {
          width: 26,
          height: 26,
          borderRadius: 8,
          backgroundColor: `${colors.primary}1f`,
          alignItems: 'center',
          justifyContent: 'center',
        },
        stepText: {
          fontSize: 12,
          fontWeight: '800',
          color: colors.primary,
        },
        titleCol: { flex: 1, gap: 2 },
        title: {
          fontSize: 15,
          fontWeight: '700',
          color: colors.foreground,
          letterSpacing: -0.1,
        },
        description: {
          fontSize: 12,
          color: colors.mutedForeground,
          lineHeight: 17,
        },
        body: { gap: 14 },
      }),
    [colors],
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        {typeof step === 'number' ? (
          <View style={styles.stepChip}>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ) : null}
        <View style={styles.titleCol}>
          <Text style={styles.title}>{title}</Text>
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

export const HarvestFormSection = memo(HarvestFormSectionBase);
HarvestFormSection.displayName = 'HarvestFormSection';
