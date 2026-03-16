import { ErrorType, ReportSeverity } from '@/types/error-types';
import { ErrorLogData } from './error-logging-types';
import { errorLoggingService } from './error-logging-service';

/**
 * Simple logger class with convenient methods for different error types
 */
export class QuickErrorLogger {
  /**
   * Log a general error
   */
  async logError(errorData: ErrorLogData): Promise<void> {
    return errorLoggingService.logError(errorData);
  }

  /**
   * Log a JavaScript/Runtime error
   */
  async logJavaScriptError(error: Error, component?: string, action?: string): Promise<void> {
    return this.logError({
      errorMessage: error.message,
      stackTrace: error.stack,
      component,
      action,
      errorType: ErrorType.RUNTIME_ERROR,
      severity: ReportSeverity.High,
    });
  }

  /**
   * Log a network error with convenience parameters
   */
  async logNetworkError(
    url: string,
    method: string,
    statusCode: number,
    errorMessage: string
  ): Promise<void> {
    return this.logError({
      errorMessage,
      component: 'network',
      action: `${method.toLowerCase()}-request`,
      errorType: ErrorType.NETWORK_ERROR,
      severity: statusCode >= 500 ? ReportSeverity.High : ReportSeverity.Medium,
      requestUrl: url,
      httpMethod: method,
      httpStatusCode: statusCode,
      metadata: {
        url,
        method,
        statusCode,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log a validation error
   */
  async logValidationError(
    component: string,
    fieldName: string,
    errorMessage: string
  ): Promise<void> {
    return this.logError({
      errorMessage: `Validation error in ${fieldName}: ${errorMessage}`,
      component,
      action: 'validation',
      errorType: ErrorType.VALIDATION_ERROR,
      severity: ReportSeverity.Low,
      metadata: { fieldName },
    });
  }

  /**
   * Log an API error
   */
  async logApiError(
    endpoint: string,
    method: string,
    statusCode: number,
    response: any,
    component?: string
  ): Promise<void> {
    return this.logError({
      errorMessage: `API Error: ${statusCode} ${response?.message || 'Unknown error'}`,
      requestUrl: endpoint,
      httpMethod: method,
      httpStatusCode: statusCode,
      component,
      errorType: ErrorType.API_ERROR,
      severity: statusCode >= 500 ? ReportSeverity.High : ReportSeverity.Medium,
      metadata: { response },
    });
  }

  /**
   * Get service status info
   */
  getStatus() {
    return errorLoggingService.getStatus();
  }
}

// Export instances for convenience and backward compatibility
export const quickLogger = new QuickErrorLogger();
export const errorLogger = new QuickErrorLogger(); // Main logger with all convenience methods
export { errorLoggingService }; // For explicit service access
export default errorLogger;