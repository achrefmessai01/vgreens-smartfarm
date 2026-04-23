import { useCallback, useState } from 'react';
import { useSignIn } from '@clerk/clerk-expo';

type Stage = 'email' | 'otp' | 'totp';

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

export function useSignInFlow() {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [stage, setStage] = useState<Stage>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const clearError = useCallback(() => setError(''), []);

  const reset = useCallback(() => {
    setOtpCode('');
    setStage('email');
    setError('');
  }, []);

  const signInWithPassword = useCallback(async () => {
    if (!isLoaded || !signIn) return;
    setError('');
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
      } else if (result.status === 'needs_second_factor') {
        setStage('totp');
        setError('Enter your authenticator code to complete sign-in.');
      } else {
        setError(describe(result.status));
      }
    } catch (err) {
      setError(toMessage(err, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, email, password, setActive]);

  const sendEmailCode = useCallback(async () => {
    if (!isLoaded || !signIn || !email.trim()) return;
    setError('');
    setLoading(true);
    try {
      const result = await signIn.create({
        strategy: 'email_code',
        identifier: email.trim(),
      });
      const factor = result.supportedFirstFactors?.find(
        (f) => f.strategy === 'email_code',
      ) as { emailAddressId?: string } | undefined;
      if (!factor?.emailAddressId) {
        setError('Email code is not enabled for this account.');
        return;
      }
      await signIn.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: factor.emailAddressId,
      });
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
      const result = await signIn.attemptFirstFactor({
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
  }, [isLoaded, signIn, otpCode, setActive]);

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
