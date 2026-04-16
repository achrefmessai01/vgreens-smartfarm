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
import { useSignIn } from '@clerk/clerk-expo';
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
  const [emailCode, setEmailCode] = useState('');
  const [pendingEmailCode, setPendingEmailCode] = useState(false);
  const [secondFactorCode, setSecondFactorCode] = useState('');
  const [secondFactorStrategy, setSecondFactorStrategy] = useState<
    'totp' | 'backup_code'
  >('totp');
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getStatusMessage = (status: string | null) => {
    if (!status) {
      return 'Sign-in could not be completed. Please try again.';
    }
    switch (status) {
      case 'needs_first_factor':
        return 'A verification step is required. Continue with password, email code, or another available method.';
      case 'needs_second_factor':
        return 'Two-factor authentication is required for this account.';
      case 'needs_new_password':
        return 'This account requires a new password before you can continue.';
      case 'needs_identifier':
        return 'Please enter your email address to continue.';
      default:
        return `Sign-in is not complete yet (status: ${status}).`;
    }
  };

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
        setPendingEmailCode(false);
        setNeedsSecondFactor(false);
        await setActive({ session: result.createdSessionId });
      } else if (result.status === 'needs_second_factor') {
        setNeedsSecondFactor(true);
        setError('Enter your authenticator code to complete sign-in.');
      } else {
        setError(getStatusMessage(result.status));
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

  const handleSendEmailCode = useCallback(async () => {
    if (!isLoaded || !signIn) return;
    if (!email.trim()) return;

    setError('');
    setLoading(true);

    try {
      const result = await signIn.create({
        strategy: 'email_code',
        identifier: email.trim(),
      });

      if (result.status === 'complete' && result.createdSessionId) {
        setPendingEmailCode(false);
        await setActive({ session: result.createdSessionId });
        return;
      }

      const emailFactor = result.supportedFirstFactors?.find(
        (factor) => factor.strategy === 'email_code',
      ) as { emailAddressId?: string } | undefined;

      if (!emailFactor?.emailAddressId) {
        setError('Email code is not enabled for this account.');
        return;
      }

      await signIn.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: emailFactor.emailAddressId,
      });

      setPendingEmailCode(true);
      setNeedsSecondFactor(false);
      setError('');
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      const message =
        clerkError.errors?.[0]?.message ??
        'Could not send email code. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, email, setActive]);

  const handleVerifyEmailCode = useCallback(async () => {
    if (!isLoaded || !signIn) return;
    if (!emailCode.trim()) return;

    setError('');
    setLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code: emailCode.trim(),
      });

      if (result.status === 'complete' && result.createdSessionId) {
        setPendingEmailCode(false);
        await setActive({ session: result.createdSessionId });
      } else {
        setError(getStatusMessage(result.status));
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      const message =
        clerkError.errors?.[0]?.message ?? 'Invalid verification code. Try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, emailCode, setActive]);

  const handleSecondFactorSignIn = useCallback(async () => {
    if (!isLoaded || !signIn) return;
    if (!secondFactorCode.trim()) return;

    setError('');
    setLoading(true);

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: secondFactorStrategy,
        code: secondFactorCode.trim(),
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        setNeedsSecondFactor(false);
      } else {
        setError(getStatusMessage(result.status));
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      const message =
        clerkError.errors?.[0]?.message ??
        'Second-factor verification failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [
    isLoaded,
    signIn,
    secondFactorCode,
    secondFactorStrategy,
    setActive,
  ]);

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

              {pendingEmailCode ? (
                <View>
                  <Text className="mb-1.5 text-sm font-medium text-foreground">
                    Email verification code
                  </Text>
                  <Input
                    value={emailCode}
                    onChangeText={setEmailCode}
                    placeholder="Enter code from email"
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    autoComplete="one-time-code"
                    textContentType="oneTimeCode"
                  />
                </View>
              ) : null}

              {needsSecondFactor ? (
                <View className="gap-3">
                  <Text className="text-sm font-medium text-foreground">
                    Verification code
                  </Text>
                  <Input
                    value={secondFactorCode}
                    onChangeText={setSecondFactorCode}
                    placeholder="Enter 2FA code"
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    autoComplete="one-time-code"
                    textContentType="oneTimeCode"
                  />
                  <View className="flex-row gap-2">
                    <Button
                      label="Authenticator App"
                      onPress={() => setSecondFactorStrategy('totp')}
                      className={
                        secondFactorStrategy === 'totp'
                          ? 'flex-1'
                          : 'flex-1 bg-secondary'
                      }
                    />
                    <Button
                      label="Backup Code"
                      onPress={() => setSecondFactorStrategy('backup_code')}
                      className={
                        secondFactorStrategy === 'backup_code'
                          ? 'flex-1'
                          : 'flex-1 bg-secondary'
                      }
                    />
                  </View>
                </View>
              ) : null}

              {error ? (
                <Text className="text-sm text-destructive">{error}</Text>
              ) : null}

              <Button
                label={
                  loading
                    ? undefined
                    : pendingEmailCode
                      ? 'Verify Email Code'
                      : needsSecondFactor
                        ? 'Verify Code'
                        : 'Sign In'
                }
                onPress={
                  pendingEmailCode
                    ? handleVerifyEmailCode
                    : needsSecondFactor
                      ? handleSecondFactorSignIn
                      : handleEmailSignIn
                }
                disabled={
                  loading ||
                  !email ||
                  (pendingEmailCode
                    ? !emailCode.trim()
                    : needsSecondFactor
                      ? !secondFactorCode.trim()
                      : !password)
                }
                className="mt-2"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : null}
              </Button>

              {!pendingEmailCode && !needsSecondFactor ? (
                <Button
                  label={loading ? undefined : 'Send Email Code'}
                  onPress={handleSendEmailCode}
                  disabled={loading || !email}
                  className="bg-secondary"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : null}
                </Button>
              ) : null}

              {pendingEmailCode ? (
                <Pressable onPress={() => setPendingEmailCode(false)}>
                  <Text className="text-sm text-primary">Use password instead</Text>
                </Pressable>
              ) : null}
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
