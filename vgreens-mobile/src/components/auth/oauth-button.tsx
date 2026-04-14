import { useState, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';

type OAuthStrategy = 'oauth_google' | 'oauth_apple';

interface OAuthButtonProps {
  strategy: OAuthStrategy;
  label: string;
}

export function OAuthButton({ strategy, label }: OAuthButtonProps) {
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy });
  const [loading, setLoading] = useState(false);

  const handleOAuth = useCallback(async () => {
    try {
      setLoading(true);
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error(`[OAuth ${strategy}] Error:`, err);
    } finally {
      setLoading(false);
      WebBrowser.dismissBrowser();
    }
  }, [startOAuthFlow, strategy]);

  return (
    <Button
      variant="outline"
      label={loading ? undefined : label}
      onPress={handleOAuth}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#016f7c" />
      ) : null}
    </Button>
  );
}
