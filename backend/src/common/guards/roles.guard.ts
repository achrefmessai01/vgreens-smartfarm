import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '../exceptions';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../enums';
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

    // VGREENS_MEMBER is a view-only sibling of VGREENS_ADMIN: it inherits read
    // access on every Query/Subscription resolver that lists VGREENS_ADMIN,
    // but never gains mutation access implicitly — the few mutations they may
    // trigger (alert acknowledgement, CSV export) opt them in explicitly via
    // `@Roles(..., UserRole.VGREENS_MEMBER)`. This keeps the ~60 existing
    // decorators untouched while enforcing "read anywhere admin can, write
    // nowhere" as a single rule.
    const info = gqlCtx.getInfo?.();
    const opType: string | undefined = info?.operation?.operation;
    const isReadOp = opType === 'query' || opType === 'subscription';
    const effectiveRoles =
      isReadOp &&
      requiredRoles.includes(UserRole.VGREENS_ADMIN) &&
      !requiredRoles.includes(UserRole.VGREENS_MEMBER)
        ? [...requiredRoles, UserRole.VGREENS_MEMBER]
        : requiredRoles;

    const hasRole = effectiveRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(' or ')}. Your role: ${user.role}`,
      );
    }

    return true;
  }
}
