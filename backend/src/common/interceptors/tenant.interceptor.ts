import {
  Injectable,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRole } from '@common/enums';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlCtx = GqlExecutionContext.create(context);
    const request = gqlCtx.getContext().req;

    if (request.user?.role === UserRole.VGREENS_ADMIN) {
      return next.handle();
    }

    if (request.user?.tenantId || request.user?.metadata?.tenantId) {
      request.tenantId =
        request.user.tenantId || request.user.metadata.tenantId;
    }

    return next.handle();
  }
}
