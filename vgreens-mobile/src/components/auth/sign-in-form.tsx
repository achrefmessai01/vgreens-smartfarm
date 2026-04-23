import { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowRight,
  Check,
  KeyRound,
  Lock,
  Mail,
} from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';
import { AuthField } from './auth-field';
import { OAuthButton } from './oauth-button';
import { createSignInFormStyles } from './sign-in-form.styles';
import { useSignInFlow } from '@/lib/hooks/use-sign-in-flow';

interface SignInFormProps {
  onRequestAccess: () => void;
  version?: string;
}

export function SignInForm({ onRequestAccess, version }: SignInFormProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createSignInFormStyles(colors), [colors]);
  const [remember, setRemember] = useState(true);
  const flow = useSignInFlow();

  const isOtp = flow.stage === 'otp';
  const isTotp = flow.stage === 'totp';
  const isCode = isOtp || isTotp;

  const submit = isOtp
    ? flow.verifyEmailCode
    : isTotp
      ? flow.verifyTotp
      : flow.signInWithPassword;

  const canSubmit =
    !flow.loading &&
    (isCode
      ? flow.otpCode.trim().length > 0
      : flow.email.trim().length > 0 && flow.password.length > 0);

  const ctaLabel = isCode ? 'Verify code' : 'Sign in';

  return (
    <View style={styles.card}>
      <View style={styles.handle} />
      <Text style={styles.heading}>
        {isCode ? 'Verify your code' : 'Sign in'}
      </Text>
      <Text style={styles.sub}>
        {isCode ? 'Enter the code we sent to your email.' : 'Access your farm dashboard'}
      </Text>

      {!isCode ? (
        <>
          <View style={styles.oauthRow}>
            <OAuthButton provider="google" label="Google" disabled={flow.loading} />
            <OAuthButton provider="microsoft" label="Microsoft" disabled={flow.loading} />
          </View>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR WITH EMAIL</Text>
            <View style={styles.dividerLine} />
          </View>
          <AuthField
            Icon={Mail}
            value={flow.email}
            onChangeText={(v) => { flow.setEmail(v); flow.clearError(); }}
            placeholder="Email"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <AuthField
            Icon={Lock}
            value={flow.password}
            onChangeText={(v) => { flow.setPassword(v); flow.clearError(); }}
            placeholder="Password"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
          />
          <View style={styles.rememberRow}>
            <Pressable
              onPress={() => setRemember((v) => !v)}
              style={styles.rememberLeft}
              hitSlop={6}
            >
              <View style={[styles.checkbox, remember && styles.checkboxActive]}>
                {remember ? <Check size={12} color="#fff" strokeWidth={3} /> : null}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </Pressable>
            <Pressable onPress={flow.sendEmailCode} hitSlop={6}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <AuthField
          Icon={KeyRound}
          value={flow.otpCode}
          onChangeText={(v) => { flow.setOtpCode(v); flow.clearError(); }}
          placeholder={isTotp ? 'Authenticator code' : '6-digit code'}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
        />
      )}

      {flow.error ? <Text style={styles.errorText}>{flow.error}</Text> : null}

      <Pressable
        onPress={() => void submit()}
        disabled={!canSubmit}
        style={[styles.cta, !canSubmit && styles.ctaDisabled]}
      >
        {flow.loading ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <>
            <Text style={styles.ctaText}>{ctaLabel}</Text>
            <ArrowRight size={16} color={colors.primaryForeground} />
          </>
        )}
      </Pressable>

      {isCode ? (
        <Pressable onPress={flow.reset}>
          <Text style={styles.helperCenter}>
            <Text style={styles.helperLink}>Use password instead</Text>
          </Text>
        </Pressable>
      ) : (
        <Pressable onPress={onRequestAccess}>
          <Text style={styles.helperCenter}>
            New to vGreens?{' '}
            <Text style={styles.helperLink}>Request access</Text>
          </Text>
        </Pressable>
      )}

      {version ? (
        <Text style={styles.footer}>Protected by vGreens · v{version}</Text>
      ) : null}
    </View>
  );
}
