import { ErrorBoundary } from '@/components/error-boundary';
import { ErrorMonitoringInitializer } from '@/components/error-monitoring-initializer';
import { NetworkStatusMonitor } from '@/components/network-status-monitor';
import { RegisterSW } from '@/components/register-sw';
import { ToastProvider } from '@/components/ui/toast-provider';
import { I18nProvider } from '@/i18n';
import { ApolloProvider } from '@/lib/apollo-provider';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
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
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/vGreens.svg',
    shortcut: '/vGreens.svg',
    apple: [
      { url: '/icons/ios/120.png', sizes: '120x120', type: 'image/png' },
      { url: '/icons/ios/152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/ios/167.png', sizes: '167x167', type: 'image/png' },
      { url: '/icons/ios/180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'vGreens Lab',
  },
  applicationName: 'vGreens Lab',
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10b981',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
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
                    <ToastProvider>
                      <NetworkStatusMonitor />
                      <RegisterSW />
                      {children}
                    </ToastProvider>
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
