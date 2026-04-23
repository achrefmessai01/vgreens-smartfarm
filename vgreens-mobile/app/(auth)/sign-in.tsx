import { useMemo } from 'react';
import {
  View,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/lib/theme-preference';
import { SignInHero } from '@/components/auth/sign-in-hero';
import { SignInForm } from '@/components/auth/sign-in-form';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { isLoaded } = useSignIn();
  const version = Constants.expoConfig?.version ?? '0.1.0';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: { flex: 1, backgroundColor: colors.background },
        // flex: 1 so heroWrap (flex: 1) expands to fill space above the form card
        scroll: { flex: 1 },
        heroWrap: { flex: 1 },
        center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
      }),
    [colors],
  );

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/*
        iOS: automaticallyAdjustKeyboardInsets tells UIScrollView to add a
        bottom content inset equal to the keyboard height and auto-scroll the
        focused input into view — the most native and reliable approach.
        Android: softwareKeyboardLayoutMode="pan" in app.json shifts the
        entire window up, no scroll-view intervention needed.
      */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        bounces={false}
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.heroWrap}>
          <SignInHero />
        </View>
        <SignInForm
          onRequestAccess={() => router.push('/(auth)/sign-up')}
          version={version}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
