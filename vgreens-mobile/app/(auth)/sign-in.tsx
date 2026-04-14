import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { OAuthButton } from '@/components/auth/oauth-button';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = useCallback(async () => {
    if (!isLoaded) return;

    setError('');
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
      } else {
        setError('Sign-in could not be completed. Please try again.');
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      const message =
        clerkError.errors?.[0]?.message ?? 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, email, password, setActive]);

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#016f7c" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-sm self-center">
            <Text className="mb-1 text-center text-3xl font-bold text-primary">
              vGreens
            </Text>
            <Text className="mb-8 text-center text-base text-muted-foreground">
              Sign in to your account
            </Text>

            <View className="gap-4">
              <OAuthButton strategy="oauth_google" label="Continue with Google" />
              <OAuthButton strategy="oauth_apple" label="Continue with Apple" />
            </View>

            <View className="my-6 flex-row items-center gap-3">
              <Separator className="flex-1" />
              <Text className="text-xs uppercase text-muted-foreground">or</Text>
              <Separator className="flex-1" />
            </View>

            <View className="gap-4">
              <View>
                <Text className="mb-1.5 text-sm font-medium text-foreground">
                  Email
                </Text>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                />
              </View>

              <View>
                <Text className="mb-1.5 text-sm font-medium text-foreground">
                  Password
                </Text>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                  autoComplete="password"
                  textContentType="password"
                />
              </View>

              {error ? (
                <Text className="text-sm text-destructive">{error}</Text>
              ) : null}

              <Button
                label={loading ? undefined : 'Sign In'}
                onPress={handleEmailSignIn}
                disabled={loading || !email || !password}
                className="mt-2"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : null}
              </Button>
            </View>

            <Pressable
              onPress={() => router.push('/(auth)/sign-up')}
              className="mt-6"
            >
              <Text className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Text className="font-medium text-primary">Sign up</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
