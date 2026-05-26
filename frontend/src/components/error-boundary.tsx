'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ReportSeverity } from '@/types/error-types';
import { errorLogger } from '@/lib/error-logging';
import { useI18nOptional } from '@/i18n';
import { getTranslations } from '@/i18n/translations';

// English-only fallback strings used when this boundary renders above the
// I18nProvider in the tree (e.g. the root-level <ErrorBoundary level="global">
// in app/layout.tsx). Mirrors the keys read below from `t.*`.
const fallbackT = getTranslations('en');

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'component' | 'global';
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to our system
    errorLogger.logError({
      errorMessage: error.message,
      stackTrace: error.stack,
      component: `ErrorBoundary.${this.props.level || 'component'}`,
      action: 'render',
      metadata: {
        errorInfo,
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name,
      },
      severity:
        this.props.level === 'global'
          ? ReportSeverity.Critical
          : ReportSeverity.High,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent error={this.state.error!} retry={this.retry} />
        );
      }

      return (
        <DefaultErrorFallback error={this.state.error!} retry={this.retry} />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  const t = useI18nOptional()?.t ?? fallbackT;
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-gray-900 dark:text-white">
            {t.errors.boundary.title}
          </CardTitle>
          <CardDescription>{t.errors.boundary.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-300">
                {t.errors.boundary.devDetails}
              </summary>
              <pre className="mt-2 max-h-32 overflow-auto rounded bg-gray-100 p-2 text-xs text-red-600 dark:bg-gray-700 dark:text-red-400">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          <div className="mt-6 flex space-x-3">
            <Button onClick={retry} className="flex-1" variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t.common.tryAgain}
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
              variant="secondary"
            >
              {t.common.reloadPage}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const subject = encodeURIComponent('Error Report');
                const body = encodeURIComponent(
                  `Error: ${error.message}\n\nStack trace:\n${error.stack}\n\nURL: ${window.location.href}`,
                );
                window.location.href = `mailto:support@vgreens.com?subject=${subject}&body=${body}`;
              }}
            >
              {t.common.contactSupport}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>,
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for manual error reporting
export function useErrorHandler() {
  return React.useCallback((error: Error, context?: string) => {
    errorLogger.logJavaScriptError(error, context, 'manual');
  }, []);
}
