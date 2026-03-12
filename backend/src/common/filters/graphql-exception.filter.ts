import {
  Catch,
  HttpStatus,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphQLExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    GqlArgumentsHost.create(host);

    // If it's already a GraphQLError, return it as-is
    if (exception instanceof GraphQLError) {
      this.logger.error(
        `GraphQLError: ${exception.message}`,
        (exception as Error).stack,
      );
      return exception;
    }

    // Handle HttpException with proper Apollo error format
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

      // Map HTTP status codes to GraphQL error codes
      let code = 'INTERNAL_SERVER_ERROR';
      if (status === HttpStatus.UNAUTHORIZED) {
        code = 'UNAUTHENTICATED';
      } else if (status === HttpStatus.FORBIDDEN) {
        code = 'FORBIDDEN';
      } else if (status === HttpStatus.NOT_FOUND) {
        code = 'NOT_FOUND';
      } else if (status === HttpStatus.BAD_REQUEST) {
        code = 'BAD_USER_INPUT';
      }

      const extensions: Record<string, unknown> = {
        code,
        statusCode: status,
      };

      if (typeof response === 'object' && response !== null) {
        Object.assign(extensions, response as Record<string, unknown>);
      }

      return new GraphQLError(message, {
        extensions: {
          ...extensions,
        },
      });
    }

    // Handle unknown errors
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
