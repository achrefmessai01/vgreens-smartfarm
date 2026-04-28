import { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { BadgeCheck, Mail } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';
import { createHeroStyles } from './settings-hero-card.styles';

interface SettingsHeroCardProps {
  name: string;
  roleLabel: string;
  tenantLabel?: string;
  email?: string | null;
  accent: string;
  initials: string;
  verified?: boolean;
}

function SettingsHeroCardBase({
  name,
  roleLabel,
  tenantLabel,
  email,
  accent,
  initials,
  verified,
}: SettingsHeroCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createHeroStyles(colors, accent), [colors, accent]);

  const subLine = tenantLabel ? `${roleLabel} · ${tenantLabel}` : roleLabel;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          {verified ? (
            <View style={styles.verifiedDot}>
              <BadgeCheck size={12} color="#fff" />
            </View>
          ) : null}
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {subLine}
          </Text>
          {email ? (
            <View style={styles.emailRow}>
              <Mail size={12} color={colors.mutedForeground} />
              <Text style={styles.emailText} numberOfLines={1}>
                {email}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export const SettingsHeroCard = memo(SettingsHeroCardBase);
SettingsHeroCard.displayName = 'SettingsHeroCard';
