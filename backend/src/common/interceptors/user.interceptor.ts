import {
  Injectable,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ModuleRef } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UsersService } from '@modules/users/users.service';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(private readonly moduleRef: ModuleRef) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const gqlCtx = GqlExecutionContext.create(context);
    const request = gqlCtx.getContext().req;

    // If we have a Clerk user ID but no database user, fetch or create it
    if (request.clerkUserId && !request.user) {
      try {
        const usersService = this.moduleRef.get(UsersService, {
          strict: false,
        });
        let user = await usersService.findByClerkUserId(request.clerkUserId);

        if (!user) {
          console.warn(
            `User with Clerk ID ${request.clerkUserId} not found in database. ` +
              `Please create the user in the database first with the appropriate role.`,
          );
        }

        if (user) {
          request.user = user;
          request.tenantId = user.tenantId;
        }
      } catch (error) {
        console.warn('UserInterceptor error:', error);
      }
    }

    return next.handle();
  }
}
