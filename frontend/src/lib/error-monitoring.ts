import { errorLogger } from '@/lib/error-logging';
import { createFetchInterceptor } from '@/lib/fetch-interceptor';
import { apolloErrorLink, apolloRequestLoggingLink } from '@/lib/apollo-error-handling';
import { ErrorType, ReportSeverity } from '@/types/error-types';

// Re-export for backward compatibility
export const errorLink = apolloErrorLink;
export const requestLoggingLink = apolloRequestLoggingLink;

/**
 * Initialize all error monitoring on app startup
 */
export function initializeErrorMonitoring() {
  // Initialize fetch interceptor
  const cleanupFetch = createFetchInterceptor();
  
  // Log app initialization
  errorLogger.logError({
    errorMessage: 'Application Initialized',
    component: 'app',
    action: 'startup',
    errorType: ErrorType.RUNTIME_ERROR,
    severity: ReportSeverity.Low,
    metadata: {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    },
  });
  
  // Return cleanup function
  return () => {
    cleanupFetch();
  };
}

/**
 * Initialize enhanced monitoring with performance tracking
 */
export function initializeAdvancedErrorMonitoring() {
  const cleanupFetch = createFetchInterceptor();
  
  // Track performance metrics
  const performanceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > 3000) { // Log slow operations > 3s
        errorLogger.logError({
          errorMessage: `Slow Performance: ${entry.name} took ${entry.duration}ms`,
          component: 'performance-monitor',
          action: entry.name,
          errorType: ErrorType.TIMEOUT_ERROR,
          severity: ReportSeverity.Medium,
          metadata: {
            duration: entry.duration,
            entryType: entry.entryType,
            startTime: entry.startTime,
          },
        });
      }
    }
  });
  
  // Observe navigation and resource loading
  performanceObserver.observe({ entryTypes: ['navigation', 'resource'] });
  
  // Track memory usage (if available)
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
      
      if (memoryUsage > 0.9) { // Alert if memory usage > 90%
        errorLogger.logError({
          errorMessage: `High Memory Usage: ${(memoryUsage * 100).toFixed(1)}%`,
          component: 'memory-monitor',
          action: 'memory-check',
          errorType: ErrorType.RUNTIME_ERROR,
          severity: ReportSeverity.High,
          metadata: {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          },
        });
      }
    }, 60000); // Check every minute
  }
  
  return () => {
    cleanupFetch();
    performanceObserver.disconnect();
  };
}

// Export everything needed for Apollo Client setup
export { apolloErrorLink, apolloRequestLoggingLink } from '@/lib/apollo-error-handling';
export { createFetchInterceptor, createAdvancedFetchInterceptor } from '@/lib/fetch-interceptor';