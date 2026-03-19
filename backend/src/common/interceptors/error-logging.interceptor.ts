import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SystemErrorsService } from '@modules/system-errors/system-errors.service';

/**
 * HTTP status codes that represent expected client-side behaviour.
 * These are not system errors — logging them fills the DB with noise.
 */
const SKIP_HTTP_STATUSES = new Set([400, 401, 403, 404, 405, 422, 429]);

interface BackendErrorData {
  error: Error;
  component: string;
  httpMethod?: string;
  requestUrl?: string;
  httpStatusCode?: number;
  userId?: string;
  tenantId?: string;
  requestPayload?: Record<string, unknown>;
}

interface RequestWithUser {
  method: string;
  url: string;
  body: Record<string, unknown>;
  user?: { id?: string; tenantId?: string };
}

interface GqlContextWithRequest {
  req: RequestWithUser;
}

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorLoggingInterceptor.name);

  constructor(private readonly systemErrorsService: SystemErrorsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        void this.logSystemError(context, error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Returns true for errors that should never be persisted:
   * - Expected client errors (4xx)
   * - Timeout errors — on a small machine these create a feedback loop
   *   (timeout → log → DB query → timeout → log → ...)
   */
  private shouldSkipLogging(error: unknown, httpStatusCode?: number): boolean {
    const err = error as Record<string, unknown>;

    const status =
      httpStatusCode ??
      (typeof err?.status === 'number' ? err.status : undefined) ??
      (typeof err?.statusCode === 'number'
        ? err.statusCode
        : undefined);

    if (status !== undefined && SKIP_HTTP_STATUSES.has(status)) return true;

    const msg = typeof err?.message === 'string' ? err.message.toLowerCase() : '';
    const name = typeof err?.name === 'string' ? err.name.toLowerCase() : '';

    if (
      name.includes('timeout') ||
      msg.includes('timeout') ||
      msg.includes('query_timeout') ||
      msg.includes('connection timeout') ||
      msg.includes('etimedout')
    ) {
      return true;
    }

    return false;
  }

  private async logSystemError(
    context: ExecutionContext,
    error: unknown,
  ): Promise<void> {
    try {
      const contextType = context.getType<string>();
      const component = `${context.getClass().name}.${context.getHandler().name}`;
      let errorData: BackendErrorData = { error: error as Error, component };

      if (contextType === 'http') {
        const request = context
          .switchToHttp()
          .getRequest<RequestWithUser>();
        const response = context
          .switchToHttp()
          .getResponse<{ statusCode: number }>();
        const err = error as Record<string, unknown>;
        const httpStatusCode =
          response.statusCode ||
          (typeof err.status === 'number' ? err.status : 500);

        if (this.shouldSkipLogging(error, httpStatusCode)) return;

        errorData = {
          ...errorData,
          httpMethod: request.method,
          requestUrl: request.url,
          httpStatusCode,
          userId: request.user?.id,
          tenantId: request.user?.tenantId,
          requestPayload: this.sanitizePayload(request.body),
        };
      } else {
        try {
          const gqlContext = GqlExecutionContext.create(context);
          const info = gqlContext.getInfo<{
            operation: { operation: string };
            fieldName: string;
          }>();
          const ctx = gqlContext.getContext<GqlContextWithRequest>();
          const request = ctx.req;

          if (this.shouldSkipLogging(error)) return;

          errorData = {
            ...errorData,
            requestUrl: `GraphQL: ${info.operation.operation} ${info.fieldName}`,
            httpMethod: 'GRAPHQL',
            userId: request.user?.id,
            tenantId: request.user?.tenantId,
            requestPayload: this.sanitizePayload(
              gqlContext.getArgs<Record<string, unknown>>(),
            ),
          };
        } catch {
          this.logger.debug('Non-GraphQL context detected');
          if (this.shouldSkipLogging(error)) return;
        }
      }

      await this.systemErrorsService.logBackendError(errorData);
    } catch (loggingError) {
      const err = loggingError as Error;
      this.logger.error(
        `Failed to log system error: ${err.message}`,
        err.stack,
      );
    }
  }

  private sanitizePayload(
    payload: Record<string, unknown>,
  ): Record<string, unknown> {
    if (!payload || typeof payload !== 'object') return payload;

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'cookie',
      'session',
    ];

    const sanitized = { ...payload };
    for (const field of sensitiveFields) {
      if (sanitized[field]) sanitized[field] = '[REDACTED]';
    }
    return sanitized;
  }
}
