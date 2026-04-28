import { useCallback, useState } from 'react';
import { useSignIn } from '@clerk/clerk-expo';

type Stage = 'password' | 'otp' | 'totp';

function describe(status: string | null): string {
  switch (status) {
    case 'needs_first_factor':
      return 'A verification step is required.';
    case 'needs_second_factor':
      return 'Two-factor authentication is required.';
    case 'needs_new_password':
      return 'This account requires a new password before you can continue.';
    case 'needs_identifier':
      return 'Enter your email address to continue.';
    default:
      return `Sign-in is not complete (status: ${status ?? 'unknown'}).`;
  }
}

function toMessage(err: unknown, fallback: string): string {
  const e = err as { errors?: { message: string }[] };
  return e.errors?.[0]?.message ?? fallback;
}

type EmailCodeFactor = { strategy: string; emailAddressId?: string };

function findEmailFactor(
  factors: EmailCodeFactor[] | null | undefined,
): EmailCodeFactor | undefined {
  return factors?.find((f) => f.strategy === 'email_code');
}

export function useSignInFlow() {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [stage, setStage] = useState<Stage>('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // tracks whether the pending OTP is a second factor (post-password) or first factor
  const [otpIsSecondFactor, setOtpIsSecondFactor] = useState(false);

  const clearError = useCallback(() => setError(''), []);

  const reset = useCallback(() => {
    setOtpCode('');
    setStage('password');
    setError('');
    setOtpIsSecondFactor(false);
  }, []);

  const signInWithPassword = useCallback(async () => {
    if (!isLoaded || !signIn) return;
    setError('');
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        return;
      }

      if (result.status === 'needs_second_factor') {
        // Password accepted — now handle the required 2FA step.
        const emailFactor = findEmailFactor(
          result.supportedSecondFactors as EmailCodeFactor[] | undefined,
        );
        if (emailFactor?.emailAddressId) {
          // Send OTP to email as the second factor.
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
            emailAddressId: emailFactor.emailAddressId,
          });
          setOtpIsSecondFactor(true);
          setStage('otp');
          return;
        }
        // Fall back to TOTP authenticator app.
        setStage('totp');
        return;
      }

      if (result.status === 'needs_first_factor') {
        // Clerk instance requires email OTP before (or instead of) password.
        const emailFactor = findEmailFactor(
          result.supportedFirstFactors as EmailCodeFactor[] | undefined,
        );
        if (emailFactor?.emailAddressId) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailFactor.emailAddressId,
          });
          setOtpIsSecondFactor(false);
          setStage('otp');
          return;
        }
      }

      setError(describe(result.status));
    } catch (err) {
      setError(toMessage(err, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, email, password, setActive]);

  // "Forgot password?" — send email OTP directly without a password.
  const sendEmailCode = useCallback(async () => {
    if (!isLoaded || !signIn || !email.trim()) return;
    setError('');
    setLoading(true);
    try {
      const result = await signIn.create({
        strategy: 'email_code',
        identifier: email.trim(),
      });
      const factor = findEmailFactor(
        result.supportedFirstFactors as EmailCodeFactor[] | undefined,
      );
      if (!factor?.emailAddressId) {
        setError('Email code is not enabled for this account.');
        return;
      }
      await signIn.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: factor.emailAddressId,
      });
      setOtpIsSecondFactor(false);
      setStage('otp');
    } catch (err) {
      setError(toMessage(err, 'Could not send email code.'));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, email]);

  const verifyEmailCode = useCallback(async () => {
    if (!isLoaded || !signIn || !otpCode.trim()) return;
    setError('');
    setLoading(true);
    try {
      // Use the correct Clerk method depending on whether this is 1FA or 2FA.
      const result = otpIsSecondFactor
        ? await signIn.attemptSecondFactor({
            strategy: 'email_code',
            code: otpCode.trim(),
          })
        : await signIn.attemptFirstFactor({
            strategy: 'email_code',
            code: otpCode.trim(),
          });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
      } else {
        setError(describe(result.status));
      }
    } catch (err) {
      setError(toMessage(err, 'Invalid verification code.'));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, otpCode, otpIsSecondFactor, setActive]);

  const verifyTotp = useCallback(async () => {
    if (!isLoaded || !signIn || !otpCode.trim()) return;
    setError('');
    setLoading(true);
    try {
      const result = await signIn.attemptSecondFactor({
        strategy: 'totp',
        code: otpCode.trim(),
      });
      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
      } else {
        setError(describe(result.status));
      }
    } catch (err) {
      setError(toMessage(err, 'Two-factor verification failed.'));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, otpCode, setActive]);

  return {
    isLoaded,
    email, setEmail,
    password, setPassword,
    otpCode, setOtpCode,
    stage, setStage,
    error, clearError,
    loading,
    reset,
    signInWithPassword,
    sendEmailCode,
    verifyEmailCode,
    verifyTotp,
  };
}
