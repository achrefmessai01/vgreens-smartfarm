import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ForbiddenException } from '../exceptions';
import { User } from '@modules/users/entities/user.entity';
import type { AuthRequest } from './clerk-auth.guard';

/**
 * HTTP (REST) equivalent of RolesGuard.
 *
 * RolesGuard uses GqlExecutionContext and only works on GraphQL resolvers.
 * This guard does the same role check but reads the user from the HTTP request,
 * which HttpClerkAuthGuard has already populated before this guard runs.
 *
 * Usage: @UseGuards(HttpClerkAuthGuard, HttpRolesGuard) on a REST controller.
 */
@Injectable()
export class HttpRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user as User | undefined;
    const clerkUserId = request.clerkUserId as string | undefined;

    if (!user) {
      throw new ForbiddenException(
        `User not found in database. Clerk User ID: ${clerkUserId || 'unknown'}. ` +
          `Please create the user first with the appropriate role (${requiredRoles.join(' or ')}).`,
      );
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(' or ')}. Your role: ${user.role}`,
      );
    }

    return true;
  }
}
