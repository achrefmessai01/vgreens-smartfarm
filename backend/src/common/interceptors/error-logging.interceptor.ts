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

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorLoggingInterceptor.name);

  constructor(private readonly systemErrorsService: SystemErrorsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Log error to our system
        this.logSystemError(context, error);
        
        // Re-throw the error so normal error handling continues
        return throwError(() => error);
      }),
    );
  }

  private async logSystemError(context: ExecutionContext, error: any): Promise<void> {
    try {
      const contextType = context.getType<string>();
      let errorData: any = {
        error,
        component: `${context.getClass().name}.${context.getHandler().name}`,
      };

      if (contextType === 'http') {
        // REST API error
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        
        errorData = {
          ...errorData,
          httpMethod: request.method,
          requestUrl: request.url,
          httpStatusCode: response.statusCode || error.status || 500,
          userId: request.user?.id,
          tenantId: request.user?.tenantId,
          requestPayload: this.sanitizePayload(request.body),
        };
      } else {
        // Try to handle GraphQL context
        try {
          const gqlContext = GqlExecutionContext.create(context);
          const info = gqlContext.getInfo();
          const request = gqlContext.getContext().req;
          
          errorData = {
            ...errorData,
            requestUrl: `GraphQL: ${info.operation.operation} ${info.fieldName}`,
            httpMethod: 'GRAPHQL',
            userId: request.user?.id,
            tenantId: request.user?.tenantId,
            requestPayload: this.sanitizePayload(gqlContext.getArgs()),
          };
        } catch (gqlError) {
          // Not a GraphQL context, handle as generic
          this.logger.debug('Non-GraphQL context detected');
        }
      }

      // Log the error
      await this.systemErrorsService.logBackendError(errorData);

    } catch (loggingError) {
      this.logger.error(
        `Failed to log system error: ${loggingError.message}`,
        loggingError.stack,
      );
    }
  }

  /**
   * Remove sensitive data from payload before logging
   */
  private sanitizePayload(payload: any): any {
    if (!payload || typeof payload !== 'object') {
      return payload;
    }

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
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}