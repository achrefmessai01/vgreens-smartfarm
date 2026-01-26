import {
  Catch,
  HttpStatus,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);

    // If it's already a GraphQLError, return it as-is
    if (exception instanceof GraphQLError) {
      return exception;
    }

    // Handle HttpException with proper Apollo error format
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : (response as any).message || exception.message;

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

      return new GraphQLError(message, {
        extensions: {
          code,
          statusCode: status,
          ...(typeof response === 'object' && response !== null
            ? response
            : {}),
        },
      });
    }

    // Handle unknown errors
    return new GraphQLError('Internal server error', {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    });
  }
}
