import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useAppTheme } from '@/lib/theme-preference';
import { SettingsAppearance } from '@/components/settings/settings-appearance';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={['bottom']}
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-1 px-4 pt-2">
        <Text className="text-2xl font-bold text-foreground">Settings</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          Appearance and account
        </Text>

        <SettingsAppearance />

        <Pressable
          onPress={() => signOut()}
          style={[styles.signOut, { backgroundColor: colors.destructive }]}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  signOut: {
    marginTop: 32,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
});
