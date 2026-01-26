import { UserRole } from '@common/enums';
import { ForbiddenException } from '../exceptions';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const gqlCtx = GqlExecutionContext.create(context);
    const request = gqlCtx.getContext().req;
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // VGREENS_ADMIN doesn't require tenantId - they can access all tenants
    if (user.role === UserRole.VGREENS_ADMIN) {
      return true;
    }

    const tenantId = user.tenantId || user.metadata?.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant ID not found');
    }

    request.tenantId = tenantId;
    return true;
  }
}
