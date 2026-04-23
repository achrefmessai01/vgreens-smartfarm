import { useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import {
  Globe,
  HelpCircle,
  LogOut,
  Moon,
} from 'lucide-react-native';
import { useMeQuery } from '@/generated/graphql';
import { useAppTheme } from '@/lib/theme-preference';
import {
  ROLE_LABELS,
  getRoleAccent,
  getUserDisplayName,
  getUserInitials,
} from '@/types/user';
import { SettingsAppearance } from '@/components/settings/settings-appearance';
import { SettingsHeroCard } from '@/components/settings/settings-hero-card';
import { SettingsRow } from '@/components/settings/settings-row';
import { SettingsSection } from '@/components/settings/settings-section';
import { mapGqlRole } from '@/components/settings/settings-utils';
import { createSettingsStyles } from '@/components/settings/settings-screen.styles';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { colors } = useAppTheme();
  const { data } = useMeQuery({ fetchPolicy: 'cache-and-network' });
  const styles = useMemo(() => createSettingsStyles(colors), [colors]);

  const me = data?.me;
  const role = mapGqlRole(me?.role);
  const accent = getRoleAccent(role);
  const verified = (me?.status ?? null) === 'ACTIVE' || !!me?.isActive;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.h1} numberOfLines={1}>
              Settings
            </Text>
            <Text style={styles.sub}>Account · preferences</Text>
          </View>
          <Pressable style={styles.helpBtn} accessibilityLabel="Help">
            <HelpCircle size={16} color={colors.foreground} />
          </Pressable>
        </View>

        <SettingsHeroCard
          name={me ? getUserDisplayName(me) : '—'}
          roleLabel={ROLE_LABELS[role] ?? role}
          tenantLabel={me?.tenant?.name ?? ''}
          email={me?.email ?? null}
          accent={accent}
          initials={getUserInitials(me?.firstName, me?.lastName, me?.email)}
          verified={verified}
        />

        <SettingsSection title="PREFERENCES">
          <View style={{ paddingTop: 4 }}>
            <SettingsRow
              Icon={Moon}
              iconColor="#8b5cf6"
              title="Appearance"
              subtitle="Match device · or pick your own"
              showChevron={false}
            />
            <SettingsAppearance />
          </View>
          <SettingsRow
            Icon={Globe}
            iconColor="#0ea5e9"
            title="Language"
            subtitle="App and notifications"
            right={<Text style={styles.rightText}>English</Text>}
            onPress={() => {}}
            isLast
          />
        </SettingsSection>

        <Pressable
          style={styles.signOut}
          onPress={() => void signOut()}
          accessibilityLabel="Sign out"
        >
          <LogOut size={14} color="#b91c1c" />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        <Text style={styles.appName}>vGreens · v0.1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
