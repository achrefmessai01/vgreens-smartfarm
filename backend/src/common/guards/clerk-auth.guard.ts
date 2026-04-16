import { clerkClient } from '@clerk/clerk-sdk-node';
import type { User } from '@modules/users/entities/user.entity';
import { UsersService } from '@modules/users/users.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

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
      this.logger.warn('No token provided in request');
      throw new UnauthorizedException('No token provided');
    }

    this.logger.debug(
      `Verifying token (length: ${token.length}, prefix: ${token.substring(0, 20)}...`,
    );

    try {
      // Verify token with proper options
      // authorizedParties tells Clerk which frontend(s) can use this token
      const session = await clerkClient.verifyToken(token, {
        // Extract the instance ID from the publishable key (format: pk_test_<instance>_<key>)
        authorizedParties: process.env.FRONTEND_APP_URL
          ? [process.env.FRONTEND_APP_URL] // Add local ip like this: 'http://192.168.0.132:3000' if testing on a mobile device
          : undefined,
      });
      request.clerkSession = session;
      const sub = session.sub ?? session.userId;
      request.clerkUserId = typeof sub === 'string' ? sub : undefined;

      this.logger.debug(
        `Token verified successfully for user: ${request.clerkUserId}`,
      );

      // Fetch user from database (must happen here before RolesGuard runs)
      if (request.clerkUserId) {
        await this.fetchUserFromDatabase(request);
      }

      return true;
    } catch (error) {
      this.logger.error('Token verification failed:', {
        error: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.constructor.name : 'Unknown',
        tokenPrefix: token.substring(0, 20),
        stack: error instanceof Error ? error.stack : undefined,
      });
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
