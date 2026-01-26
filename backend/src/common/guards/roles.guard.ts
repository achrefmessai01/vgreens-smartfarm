import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '../exceptions';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { User } from '@modules/users/entities/user.entity';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const gqlCtx = GqlExecutionContext.create(context);
    const request = gqlCtx.getContext().req;
    const user = request.user as User | undefined;
    const clerkUserId = request.clerkUserId as string | undefined;

    if (!user) {
      throw new ForbiddenException(
        `User not found in database. Clerk User ID: ${clerkUserId || 'unknown'}. ` +
          `Please create the user first with the appropriate role (${requiredRoles.join(' or ')}).`,
      );
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(' or ')}. Your role: ${user.role}`,
      );
    }

    return true;
  }
}
