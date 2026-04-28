import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import Svg, { Path, Rect } from 'react-native-svg';
import { useAppTheme } from '@/lib/theme-preference';

export type OAuthProvider = 'google' | 'microsoft' | 'apple';

interface OAuthButtonProps {
  provider: OAuthProvider;
  label: string;
  disabled?: boolean;
}

function GoogleMark() {
  return (
    <Svg width={16} height={16} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

function MicrosoftMark() {
  return (
    <Svg width={16} height={16} viewBox="0 0 48 48">
      <Rect x="2" y="2" width="20" height="20" fill="#F25022" />
      <Rect x="26" y="2" width="20" height="20" fill="#7FBA00" />
      <Rect x="2" y="26" width="20" height="20" fill="#00A4EF" />
      <Rect x="26" y="26" width="20" height="20" fill="#FFB900" />
    </Svg>
  );
}

export function OAuthButton({ provider, label, disabled }: OAuthButtonProps) {
  const { colors } = useAppTheme();
  const strategy = `oauth_${provider}` as const;
  const { startOAuthFlow } = useOAuth({ strategy });
  const [loading, setLoading] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        btn: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          height: 46,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
        },
        label: {
          fontSize: 14,
          fontWeight: '700',
          color: colors.foreground,
        },
        disabled: { opacity: 0.6 },
      }),
    [colors],
  );

  const handleOAuth = useCallback(async () => {
    try {
      setLoading(true);
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error(`[OAuth ${provider}] Error:`, err);
    } finally {
      setLoading(false);
      WebBrowser.dismissBrowser();
    }
  }, [startOAuthFlow, provider]);

  const Mark = provider === 'microsoft' ? MicrosoftMark : GoogleMark;

  return (
    <Pressable
      onPress={handleOAuth}
      disabled={loading || disabled}
      style={[styles.btn, (loading || disabled) && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.foreground} />
      ) : (
        <>
          <View>
            <Mark />
          </View>
          <Text style={styles.label}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
