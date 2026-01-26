import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UsersService } from '@modules/users/users.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const gqlCtx = GqlExecutionContext.create(context);
    const request = gqlCtx.getContext().req;

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const session = await clerkClient.verifyToken(token);
      request.clerkSession = session;
      request.clerkUserId = session.sub || session.userId;

      // Fetch user from database (must happen here before RolesGuard runs)
      if (request.clerkUserId) {
        await this.fetchUserFromDatabase(request);
      }

      return true;
    } catch (error) {
      this.logger.error('Token verification failed', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async fetchUserFromDatabase(request: any): Promise<void> {
    try {
      const usersService = this.moduleRef.get(UsersService, {
        strict: false,
      });

      if (!usersService) {
        return;
      }

      const user = await usersService.findByClerkUserId(request.clerkUserId);
      this.logger.log(`User fetched from database: ${user?.email}`);
      if (user) {
        request.user = user;
        request.tenantId = user.tenantId;
      }
    } catch (error) {
      this.logger.warn(
        `Failed to fetch user for Clerk ID: ${request.clerkUserId}`,
        error,
      );
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
