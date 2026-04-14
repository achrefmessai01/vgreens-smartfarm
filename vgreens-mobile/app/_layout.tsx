import '../src/global.css';

import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { tokenCache } from '@/lib/auth';
import { ApolloProvider } from '@/lib/apollo-provider';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Add it to your .env file.',
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ApolloProvider>
          <StatusBar style="auto" />
          <Slot />
        </ApolloProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
