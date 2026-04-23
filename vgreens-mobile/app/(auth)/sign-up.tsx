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
import { useSignUp } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { OAuthButton } from '@/components/auth/oauth-button';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const handleSignUp = useCallback(async () => {
    if (!isLoaded) return;

    setError('');
    setLoading(true);

    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      const message =
        clerkError.errors?.[0]?.message ?? 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, email, password]);

  const handleVerify = useCallback(async () => {
    if (!isLoaded) return;

    setError('');
    setLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
      } else {
        setError('Verification could not be completed. Please try again.');
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      const message =
        clerkError.errors?.[0]?.message ?? 'Invalid code. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, code, setActive]);

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
              {pendingVerification
                ? 'Verify your email'
                : 'Create your account'}
            </Text>

            {pendingVerification ? (
              <VerificationForm
                code={code}
                setCode={setCode}
                error={error}
                loading={loading}
                onVerify={handleVerify}
              />
            ) : (
              <RegistrationForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                error={error}
                loading={loading}
                onSignUp={handleSignUp}
                onNavigateSignIn={() => router.push('/(auth)/sign-in')}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function VerificationForm({
  code,
  setCode,
  error,
  loading,
  onVerify,
}: {
  code: string;
  setCode: (v: string) => void;
  error: string;
  loading: boolean;
  onVerify: () => void;
}) {
  return (
    <View className="gap-4">
      <Text className="text-center text-sm text-muted-foreground">
        We sent a verification code to your email
      </Text>

      <View>
        <Text className="mb-1.5 text-sm font-medium text-foreground">
          Verification Code
        </Text>
        <Input
          value={code}
          onChangeText={setCode}
          placeholder="Enter 6-digit code"
          keyboardType="number-pad"
          textContentType="oneTimeCode"
        />
      </View>

      {error ? (
        <Text className="text-sm text-destructive">{error}</Text>
      ) : null}

      <Button
        label={loading ? undefined : 'Verify Email'}
        onPress={onVerify}
        disabled={loading || !code}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : null}
      </Button>
    </View>
  );
}

function RegistrationForm({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  onSignUp,
  onNavigateSignIn,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  error: string;
  loading: boolean;
  onSignUp: () => void;
  onNavigateSignIn: () => void;
}) {
  return (
    <>
      <View className="gap-4">
        <OAuthButton provider="google" label="Continue with Google" />
        <OAuthButton provider="microsoft" label="Continue with Microsoft" />
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
            placeholder="Create a password"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />
        </View>

        {error ? (
          <Text className="text-sm text-destructive">{error}</Text>
        ) : null}

        <Button
          label={loading ? undefined : 'Create Account'}
          onPress={onSignUp}
          disabled={loading || !email || !password}
          className="mt-2"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : null}
        </Button>
      </View>

      <Pressable onPress={onNavigateSignIn} className="mt-6">
        <Text className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Text className="font-medium text-primary">Sign in</Text>
        </Text>
      </Pressable>
    </>
  );
}
