import { EnrichedErrorData } from './error-logging-types';

/**
 * Error queue management for handling offline scenarios and batch sending
 */
export class ErrorQueue {
  private errorQueue: EnrichedErrorData[] = [];
  private isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
  private flushCallback: (error: EnrichedErrorData) => Promise<void>;

  constructor(flushCallback: (error: EnrichedErrorData) => Promise<void>) {
    this.flushCallback = flushCallback;
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
      this.setupPeriodicFlush();
    }
  }

  /**
   * Add error to queue (will attempt immediate send if online)
   */
  async addError(errorData: EnrichedErrorData): Promise<void> {
    if (this.isOnline) {
      try {
        await this.flushCallback(errorData);
        return;
      } catch (error) {
        console.error('Failed to send error immediately:', error);
      }
    }

    this.errorQueue.push(errorData);
    this.storeErrorLocally(errorData);
  }

  /**
   * Store error in localStorage as fallback
   */
  private storeErrorLocally(errorData: EnrichedErrorData): void {
    if (typeof window === 'undefined') return;

    try {
      const errors = JSON.parse(localStorage.getItem('pendingErrors') || '[]');
      errors.push({ ...errorData, timestamp: Date.now() });

      // Keep only last 50 errors to prevent storage bloat
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }

      localStorage.setItem('pendingErrors', JSON.stringify(errors));
    } catch (storageError) {
      console.error('Failed to store error locally:', storageError);
    }
  }

  /**
   * Setup network event listeners
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueuedErrors();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Setup periodic flushing of queued errors
   */
  private setupPeriodicFlush(): void {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      if (this.isOnline && this.errorQueue.length > 0) {
        this.flushQueuedErrors();
      }
    }, 30000); // Flush every 30 seconds
  }

  /**
   * Flush all queued errors when back online
   */
  private async flushQueuedErrors(): Promise<void> {
    const errors = [...this.errorQueue];
    this.errorQueue = [];

    for (const error of errors) {
      try {
        await this.flushCallback(error);
      } catch (flushError) {
        // Re-queue failed errors
        this.errorQueue.push(error);
      }
    }

    // Also try to send stored errors
    await this.flushStoredErrors();
  }

  /**
   * Flush errors stored in localStorage
   */
  private async flushStoredErrors(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const storedErrors = JSON.parse(
        localStorage.getItem('pendingErrors') || '[]',
      );
      if (storedErrors.length > 0) {
        for (const error of storedErrors) {
          try {
            await this.flushCallback(error);
          } catch (sendError) {
            console.error('Failed to send stored error:', sendError);
          }
        }
        localStorage.removeItem('pendingErrors');
      }
    } catch (parseError) {
      console.error('Failed to parse stored errors:', parseError);
    }
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): { queueLength: number; isOnline: boolean } {
    return {
      queueLength: this.errorQueue.length,
      isOnline: this.isOnline,
    };
  }
}
