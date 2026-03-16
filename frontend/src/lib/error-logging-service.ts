import { gql } from '@apollo/client';
import { ErrorLogData } from './error-logging-types';
import { enrichErrorData, generateSessionId, setupGlobalErrorListeners } from './error-enrichment';
import { ErrorQueue } from './error-queue';

const LOG_SYSTEM_ERROR = gql`
  mutation LogSystemError($input: CreateSystemErrorInput!) {
    logSystemError(input: $input) {
      id
      errorMessage
      severity
      createdAt
    }
  }
`;

/**
 * Core error logging service that handles sending errors to the backend
 */
export class ErrorLoggingService {
  private sessionId: string;
  private errorQueue: ErrorQueue;

  constructor() {
    this.sessionId = generateSessionId();
    this.errorQueue = new ErrorQueue(this.sendErrorToBackend.bind(this));
    setupGlobalErrorListeners(this.logError.bind(this));
  }

  /**
   * Log an error to the system
   */
  async logError(errorData: ErrorLogData): Promise<void> {
    try {
      const enrichedError = enrichErrorData(errorData, this.sessionId);
      await this.errorQueue.addError(enrichedError);
    } catch (error) {
      console.error('Failed to log error:', error);
    }
  }

  /**
   * Send enriched error to backend via GraphQL
   */
  private async sendErrorToBackend(errorData: any): Promise<void> {
    const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql';
    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: LOG_SYSTEM_ERROR.loc?.source.body,
        variables: { input: errorData },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  /**
   * Get current service status
   */
  getStatus() {
    return {
      sessionId: this.sessionId,
      ...this.errorQueue.getQueueStatus(),
    };
  }
}

// Export singleton instance
export const errorLoggingService = new ErrorLoggingService();