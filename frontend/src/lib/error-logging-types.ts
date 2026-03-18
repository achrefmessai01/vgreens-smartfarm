import { ErrorType, ErrorSource, ReportSeverity } from '@/types/error-types';

export interface ErrorLogData {
  errorMessage: string;
  stackTrace?: string;
  component?: string;
  action?: string;
  severity?: ReportSeverity;
  errorType?: ErrorType;
  metadata?: Record<string, any>;
  requestUrl?: string;
  httpMethod?: string;
  httpStatusCode?: number;
}

export interface EnrichedErrorData extends ErrorLogData {
  source: ErrorSource;
  userAgent: string;
  sessionId: string;
  requestUrl: string;
  metadata: Record<string, any>;
}

export interface BrowserInfo {
  userAgent: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  onLine: boolean;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
}