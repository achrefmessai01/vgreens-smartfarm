import '../src/global.css';

import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { tokenCache } from '@/lib/auth';
import { ApolloProvider } from '@/lib/apollo-provider';
import { ThemeProvider, ThemedRoot, useAppTheme } from '@/lib/theme-preference';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Add it to your .env file.',
  );
}

function StatusBarThemed() {
  const { resolvedScheme } = useAppTheme();
  return (
    <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ThemeProvider>
          <ApolloProvider>
            <ThemedRoot>
              <StatusBarThemed />
              <Slot />
            </ThemedRoot>
          </ApolloProvider>
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
