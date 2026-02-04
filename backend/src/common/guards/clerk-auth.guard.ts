import {
  Logger,
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector, ModuleRef } from '@nestjs/core';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UsersService } from '@modules/users/users.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { User } from '@modules/users/entities/user.entity';

export interface AuthRequest extends Request {
  clerkSession?: Awaited<ReturnType<typeof clerkClient.verifyToken>>;
  clerkUserId?: string;
  user?: User;
  tenantId?: string | null;
}

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
    const request = gqlCtx.getContext<{ req: AuthRequest }>().req;

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const session = await clerkClient.verifyToken(token);
      request.clerkSession = session;
      const sub = session.sub ?? session.userId;
      request.clerkUserId = typeof sub === 'string' ? sub : undefined;

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

  private async fetchUserFromDatabase(request: AuthRequest): Promise<void> {
    try {
      const usersService = this.moduleRef.get(UsersService, {
        strict: false,
      });

      if (!usersService) {
        return;
      }

      const clerkUserId = request.clerkUserId;
      if (!clerkUserId) return;

      const user = await usersService.findByClerkUserId(clerkUserId);
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

  private extractTokenFromHeader(request: Request): string | undefined {
    const auth = request.headers.authorization;
    const [type, token] = (typeof auth === 'string' ? auth : '').split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
