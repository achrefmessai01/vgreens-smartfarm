import { ErrorType, ErrorSource, ReportSeverity } from '@/types/error-types';
import {
  ErrorLogData,
  EnrichedErrorData,
  BrowserInfo,
} from './error-logging-types';

/**
 * Utility functions for enriching error data with browser and context information
 */

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get comprehensive browser information
 */
export function getBrowserInfo(): BrowserInfo {
  if (typeof window === 'undefined') {
    return {
      userAgent: 'SSR',
      language: 'en-US',
      platform: 'unknown',
      cookieEnabled: true,
      onLine: true,
      screen: {
        width: 1920,
        height: 1080,
        colorDepth: 24,
      },
    };
  }

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
    },
  };
}

/**
 * Enrich error data with browser and session info
 */
export function enrichErrorData(
  errorData: ErrorLogData,
  sessionId: string,
): EnrichedErrorData {
  const isSSR = typeof window === 'undefined';

  return {
    ...errorData,
    source: ErrorSource.FRONTEND,
    userAgent: isSSR ? 'SSR' : navigator.userAgent,
    sessionId,
    requestUrl: errorData.requestUrl || (isSSR ? '/ssr' : window.location.href),
    errorType: errorData.errorType || ErrorType.UNKNOWN_ERROR,
    severity: errorData.severity || ReportSeverity.Medium,
    metadata: {
      ...errorData.metadata,
      timestamp: new Date().toISOString(),
      url: isSSR ? '/ssr' : window.location.href,
      viewport: {
        width: isSSR ? 1920 : window.innerWidth,
        height: isSSR ? 1080 : window.innerHeight,
      },
      browser: getBrowserInfo(),
    },
  };
}

/**
 * Setup global error event listeners
 */
export function setupGlobalErrorListeners(
  logError: (error: ErrorLogData) => void,
): void {
  if (typeof window === 'undefined') {
    return; // Skip setup during SSR
  }

  window.addEventListener('error', (event) => {
    logError({
      errorMessage: event.message,
      stackTrace: event.error?.stack,
      component: 'global',
      action: 'window.error',
      errorType: ErrorType.RUNTIME_ERROR,
      severity: ReportSeverity.High,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    // Filter out network-related rejections — these are not app crashes.
    // Genuine unhandled rejections (application logic bugs) are still logged.
    const message = event.reason?.message ?? String(event.reason ?? '');
    const isNetworkNoise =
      /fetch|network|failed to fetch|load failed|aborted|networkerror/i.test(
        message,
      );
    if (isNetworkNoise) return;

    logError({
      errorMessage: `Unhandled Promise Rejection: ${message}`,
      stackTrace: event.reason?.stack,
      component: 'global',
      action: 'promise.rejection',
      errorType: ErrorType.RUNTIME_ERROR,
      severity: ReportSeverity.High,
    });
  });
}
