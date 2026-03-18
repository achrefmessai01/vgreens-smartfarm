import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemError } from './entities/system-error.entity';
import { CreateSystemErrorInput } from './dto/create-system-error.input';
import { ErrorSource, ErrorType, ReportSeverity } from '@common/enums';
import { createHash } from 'crypto';

@Injectable()
export class SystemErrorsService {
  private readonly logger = new Logger(SystemErrorsService.name);

  constructor(
    @InjectRepository(SystemError)
    private readonly systemErrorRepository: Repository<SystemError>,
  ) {}

  /**
   * Log a system error with deduplication and alerting
   */
  async logError(createSystemErrorInput: CreateSystemErrorInput): Promise<SystemError> {
    try {
      // Create error hash for deduplication
      const errorHash = this.createErrorHash(
        createSystemErrorInput.errorMessage,
        createSystemErrorInput.stackTrace,
        createSystemErrorInput.component
      );

      // Check for existing error (within last hour for performance)
      const recentSimilarError = await this.systemErrorRepository
        .createQueryBuilder('error')
        .where('error.errorHash = :errorHash', { errorHash })
        .andWhere('error.createdAt > :oneHourAgo', { 
          oneHourAgo: new Date(Date.now() - 60 * 60 * 1000) 
        })
        .getOne();

      if (recentSimilarError) {
        // Update existing error record
        await this.systemErrorRepository.update(recentSimilarError.id, {
          occurrenceCount: recentSimilarError.occurrenceCount + 1,
          lastOccurredAt: new Date(),
          // Reset notification flag if it's been more than 15 minutes
          isNotified: recentSimilarError.lastOccurredAt && 
            (Date.now() - recentSimilarError.lastOccurredAt.getTime()) > 15 * 60 * 1000 
            ? false 
            : recentSimilarError.isNotified
        });

        const updatedError = await this.systemErrorRepository.findOne({
          where: { id: recentSimilarError.id },
          relations: ['tenant', 'user', 'resolver']
        });

        // Send alert for recurring high-severity errors
        if (updatedError && !updatedError.isNotified && 
            (updatedError.severity === ReportSeverity.CRITICAL || 
             updatedError.severity === ReportSeverity.URGENT)) {
          this.sendAlert(updatedError);
        }

        return updatedError!;
      }

      // Create new error record
      const systemError = this.systemErrorRepository.create({
        ...createSystemErrorInput,
        errorHash,
        occurrenceCount: 1,
        lastOccurredAt: new Date(),
        isNotified: false,
      });

      const savedError = await this.systemErrorRepository.save(systemError);

      // Load relations
      const errorWithRelations = await this.systemErrorRepository.findOne({
        where: { id: savedError.id },
        relations: ['tenant', 'user', 'resolver']
      });

      // Send immediate alert for critical/urgent errors
      if (errorWithRelations && 
          (errorWithRelations.severity === ReportSeverity.CRITICAL || 
           errorWithRelations.severity === ReportSeverity.URGENT)) {
        this.sendAlert(errorWithRelations);
      }

      return errorWithRelations!;

    } catch (error) {
      this.logger.error(`Failed to log system error: ${error.message}`, error.stack);
      // Fallback: still log to console if database fails
      this.logger.error(`Original error: ${createSystemErrorInput.errorMessage}`, createSystemErrorInput.stackTrace);
      throw error;
    }
  }

  /**
   * Get recent errors with filtering and pagination
   */
  async getRecentErrors(
    limit: number = 50,
    offset: number = 0,
    severity?: ReportSeverity,
    source?: ErrorSource,
    isResolved?: boolean
  ): Promise<{ errors: SystemError[]; total: number }> {
    const queryBuilder = this.systemErrorRepository
      .createQueryBuilder('error')
      .leftJoinAndSelect('error.tenant', 'tenant')
      .leftJoinAndSelect('error.user', 'user')
      .leftJoinAndSelect('error.resolver', 'resolver')
      .orderBy('error.createdAt', 'DESC');

    if (severity) {
      queryBuilder.andWhere('error.severity = :severity', { severity });
    }

    if (source) {
      queryBuilder.andWhere('error.source = :source', { source });
    }

    if (isResolved !== undefined) {
      queryBuilder.andWhere('error.isResolved = :isResolved', { isResolved });
    }

    const [errors, total] = await queryBuilder
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { errors, total };
  }

  /**
   * Get error statistics for dashboard
   */
  async getErrorStats(hours: number = 24): Promise<any> {
    const sinceDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    const stats = await this.systemErrorRepository
      .createQueryBuilder('error')
      .select([
        'error.source as source',
        'error.errorType as errorType', 
        'error.severity as severity',
        'COUNT(*) as count',
        'SUM(error.occurrenceCount) as totalOccurrences'
      ])
      .where('error.createdAt >= :sinceDate', { sinceDate })
      .groupBy('error.source, error.errorType, error.severity')
      .getRawMany();

    const unresolved = await this.systemErrorRepository.count({
      where: { 
        isResolved: false,
        createdAt: sinceDate
      }
    });

    const critical = await this.systemErrorRepository.count({
      where: {
        severity: ReportSeverity.CRITICAL,
        createdAt: sinceDate
      }
    });

    return {
      stats,
      unresolved,
      critical,
      timeframe: `${hours} hours`
    };
  }

  /**
   * Mark error as resolved
   */
  async resolveError(
    errorId: string, 
    resolvedBy: string, 
    resolutionNotes?: string
  ): Promise<SystemError> {
    await this.systemErrorRepository.update(errorId, {
      isResolved: true,
      resolvedAt: new Date(),
      resolvedBy,
      resolutionNotes
    });

    return this.systemErrorRepository.findOne({
      where: { id: errorId },
      relations: ['tenant', 'user', 'resolver']
    })!;
  }

  /**
   * Create hash for error deduplication
   */
  private createErrorHash(message: string, stackTrace?: string, component?: string): string {
    const hashInput = `${message}||${stackTrace || ''}||${component || ''}`;
    return createHash('md5').update(hashInput).digest('hex');
  }

  /**
   * Send alert for critical errors (implement your notification logic)
   */
  private async sendAlert(error: SystemError): Promise<void> {
    try {
      this.logger.warn(`🚨 CRITICAL ERROR ALERT 🚨`, {
        id: error.id,
        source: error.source,
        errorType: error.errorType,
        severity: error.severity,
        message: error.errorMessage,
        component: error.component,
        occurrences: error.occurrenceCount,
        tenantId: error.tenantId,
        userId: error.userId
      });

      // TODO: Implement real-time alerting
      // - Send to Slack webhook
      // - Send email to dev team
      // - Push notification to admin dashboard
      // - Update monitoring systems (e.g., Datadog, Sentry)

      // Mark as notified
      await this.systemErrorRepository.update(error.id, { isNotified: true });

    } catch (alertError) {
      this.logger.error(`Failed to send alert: ${alertError.message}`);
    }
  }

  /**
   * Quick helper methods for common error types
   */
  async logFrontendError(errorData: {
    errorMessage: string;
    stackTrace?: string;
    component?: string;
    userAgent?: string;
    requestUrl?: string;
    userId?: string;
    tenantId?: string;
    sessionId?: string;
    severity?: ReportSeverity;
  }): Promise<SystemError> {
    return this.logError({
      source: ErrorSource.FRONTEND,
      errorType: ErrorType.RUNTIME_ERROR,
      severity: errorData.severity || ReportSeverity.MEDIUM,
      ...errorData
    });
  }

  async logBackendError(errorData: {
    error: Error;
    httpMethod?: string;
    requestUrl?: string;
    httpStatusCode?: number;
    component?: string;
    userId?: string;
    tenantId?: string;
    requestPayload?: Record<string, any>;
    severity?: ReportSeverity;
  }): Promise<SystemError> {
    return this.logError({
      source: ErrorSource.BACKEND,
      errorType: this.classifyBackendError(errorData.error),
      severity: errorData.severity || this.determineSeverity(errorData.error),
      errorMessage: errorData.error.message,
      stackTrace: errorData.error.stack,
      httpMethod: errorData.httpMethod,
      requestUrl: errorData.requestUrl,
      httpStatusCode: errorData.httpStatusCode,
      component: errorData.component,
      userId: errorData.userId,
      tenantId: errorData.tenantId,
      requestPayload: errorData.requestPayload
    });
  }

  /**
   * Classify backend errors into types
   */
  private classifyBackendError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (name.includes('validation') || message.includes('validation')) {
      return ErrorType.VALIDATION_ERROR;
    }
    if (name.includes('unauthorized') || message.includes('unauthorized')) {
      return ErrorType.AUTHENTICATION_ERROR;
    }
    if (name.includes('forbidden') || message.includes('forbidden')) {
      return ErrorType.AUTHORIZATION_ERROR;
    }
    if (name.includes('timeout') || message.includes('timeout')) {
      return ErrorType.TIMEOUT_ERROR;
    }
    if (message.includes('database') || message.includes('connection')) {
      return ErrorType.DATABASE_ERROR;
    }
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK_ERROR;
    }
    
    return ErrorType.RUNTIME_ERROR;
  }

  /**
   * Auto-determine error severity
   */
  private determineSeverity(error: Error): ReportSeverity {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal')) {
      return ReportSeverity.CRITICAL;
    }
    if (message.includes('urgent') || message.includes('security')) {
      return ReportSeverity.URGENT; 
    }
    if (message.includes('database') || message.includes('connection')) {
      return ReportSeverity.HIGH;
    }
    
    return ReportSeverity.MEDIUM;
  }
}