import './globals.css';
import type { Metadata } from 'next';
import { I18nProvider } from '@/i18n';
import { ThemeProvider } from 'next-themes';
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';
import { ApolloProvider } from '@/lib/apollo-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { ErrorMonitoringInitializer } from '@/components/error-monitoring-initializer';
import { PostHogProvider } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'vGreens Lab',
  description:
    'vGreens Lab is a platform for managing and analyzing greenhouse data',
  icons: {
    icon: '/vGreens.svg',
    shortcut: '/vGreens.svg',
    apple: '/vGreens.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ErrorBoundary level="global">
            <PostHogProvider>
              <ApolloProvider>
                <I18nProvider defaultLocale="en">
                  <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                  >
                    <ErrorMonitoringInitializer />
                    {children}
                  </ThemeProvider>
                </I18nProvider>
              </ApolloProvider>
            </PostHogProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
