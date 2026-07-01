import {
  Catch,
  HttpStatus,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import type { Response } from 'express';

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphQLExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    // ── REST (HTTP) context ───────────────────────────────────────────────────
    // The filter is global (APP_FILTER) so it catches REST exceptions too.
    // For HTTP contexts we must write a JSON response directly — returning a
    // GraphQLError here would leave the response unsent.
    if (host.getType() === 'http') {
      const res = host.switchToHttp().getResponse<Response>();

      if (exception instanceof HttpException) {
        const status = exception.getStatus();
        const body = exception.getResponse();
        const message =
          typeof body === 'string'
            ? body
            : (body as { message?: string }).message || exception.message;

        this.logger.error(
          `HttpException: ${message} (status ${status})`,
          (exception as Error).stack,
        );

        return res.status(status).json({ statusCode: status, message });
      }

      const error =
        exception instanceof Error ? exception : new Error('Unknown error');
      this.logger.error(`Unknown error: ${error.message}`, error.stack);
      return res.status(500).json({ statusCode: 500, message: 'Internal server error' });
    }

    // ── GraphQL context ───────────────────────────────────────────────────────
    GqlArgumentsHost.create(host);

    if (exception instanceof GraphQLError) {
      this.logger.error(
        `GraphQLError: ${exception.message}`,
        (exception as Error).stack,
      );
      return exception;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus() as HttpStatus;
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : (response as { message?: string }).message || exception.message;

      this.logger.error(
        `HttpException: ${message} (status ${status})`,
        (exception as Error).stack,
      );

      let code = 'INTERNAL_SERVER_ERROR';
      if (status === HttpStatus.UNAUTHORIZED) code = 'UNAUTHENTICATED';
      else if (status === HttpStatus.FORBIDDEN) code = 'FORBIDDEN';
      else if (status === HttpStatus.NOT_FOUND) code = 'NOT_FOUND';
      else if (status === HttpStatus.BAD_REQUEST) code = 'BAD_USER_INPUT';
      else if (status === HttpStatus.CONFLICT) code = 'CONFLICT';

      const extensions: Record<string, unknown> = { code, statusCode: status };
      if (typeof response === 'object' && response !== null) {
        Object.assign(extensions, response as Record<string, unknown>);
      }

      return new GraphQLError(message, { extensions });
    }

    const error =
      exception instanceof Error
        ? exception
        : new Error('Unknown error thrown in GraphQL context');

    this.logger.error(`Unknown error: ${error.message}`, error.stack);

    return new GraphQLError('Internal server error', {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    });
  }
}
