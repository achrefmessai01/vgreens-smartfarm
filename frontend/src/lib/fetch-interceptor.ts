import { errorLogger } from '@/lib/error-logging';
import { ErrorType, ReportSeverity } from '@/types/error-types';

/**
 * Fetch interceptor for REST API calls (if any)
 */
export function createFetchInterceptor() {
  if (typeof window === 'undefined') {
    return () => {}; // Return a no-op cleanup function for SSR
  }
  
  const originalFetch = window.fetch;
  
  window.fetch = async function interceptedFetch(
    input: RequestInfo | URL, 
    init?: RequestInit
  ): Promise<Response> {
    const url = input.toString();
    const method = init?.method || 'GET';
    const startTime = Date.now();
    
    try {
      const response = await originalFetch(input, init);
      const duration = Date.now() - startTime;
      
      // Log failed HTTP requests
      if (!response.ok) {
        let responseText = '';
        try {
          responseText = await response.clone().text();
        } catch (e) {
          responseText = 'Could not read response body';
        }
        
        errorLogger.logNetworkError(
          url,
          method,
          response.status,
          `HTTP ${response.status}: ${response.statusText}`
        );
      }
      
      // Log slow requests
      if (duration > 5000) {
        errorLogger.logError({
          errorMessage: `Slow HTTP Request: ${method} ${url} took ${duration}ms`,
          component: 'fetch-interceptor',
          action: method.toLowerCase(),
          errorType: ErrorType.TIMEOUT_ERROR,
          severity: ReportSeverity.Medium,
          metadata: {
            duration,
            url,
            method,
            status: response.status,
          },
          requestUrl: url,
          httpMethod: method,
          httpStatusCode: response.status,
        });
      }
      
      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      errorLogger.logError({
        errorMessage: `Fetch Request Failed: ${error.message}`,
        stackTrace: error.stack,
        component: 'fetch-interceptor', 
        action: method.toLowerCase(),
        errorType: ErrorType.NETWORK_ERROR,
        severity: ReportSeverity.High,
        metadata: {
          duration,
          url,
          method,
          error: error.toString(),
        },
        requestUrl: url,
        httpMethod: method,
      });
      
      throw error;
    }
  };
  
  // Return cleanup function
  return () => {
    if (typeof window !== 'undefined') {
      window.fetch = originalFetch;
    }
  };
}

/**
 * Enhanced fetch interceptor with retry logic
 */
export function createAdvancedFetchInterceptor(maxRetries: number = 3) {
  if (typeof window === 'undefined') {
    return () => {}; // Return a no-op cleanup function for SSR
  }
  
  const originalFetch = window.fetch;
  
  window.fetch = async function interceptedFetch(
    input: RequestInfo | URL, 
    init?: RequestInit,
    retryCount: number = 0
  ): Promise<Response> {
    const url = input.toString();
    const method = init?.method || 'GET';
    
    try {
      return await originalFetch(input, init);
    } catch (error: any) {
      if (retryCount < maxRetries) {
        errorLogger.logError({
          errorMessage: `Fetch retry ${retryCount + 1}/${maxRetries}: ${error.message}`,
          component: 'fetch-interceptor-retry',
          action: method.toLowerCase(),
          errorType: ErrorType.NETWORK_ERROR,
          severity: ReportSeverity.Low,
          metadata: { url, method, retryCount, maxRetries },
          requestUrl: url,
          httpMethod: method,
        });
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return interceptedFetch(input, init, retryCount + 1);
      }
      
      // Final failure after all retries
      errorLogger.logError({
        errorMessage: `Fetch failed after ${maxRetries} retries: ${error.message}`,
        stackTrace: error.stack,
        component: 'fetch-interceptor-retry',
        action: method.toLowerCase(),
        errorType: ErrorType.NETWORK_ERROR,
        severity: ReportSeverity.High,
        metadata: { url, method, maxRetries },
        requestUrl: url,
        httpMethod: method,
      });
      
      throw error;
    }
  };
  
  return () => {
    if (typeof window !== 'undefined') {
      window.fetch = originalFetch;
    }
  };
}