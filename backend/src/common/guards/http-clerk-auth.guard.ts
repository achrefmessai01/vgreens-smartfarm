import { clerkClient } from '@clerk/clerk-sdk-node';
import { UsersService } from '@modules/users/users.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AuthRequest } from './clerk-auth.guard';

/**
 * HTTP (REST) equivalent of ClerkAuthGuard.
 *
 * ClerkAuthGuard uses GqlExecutionContext and only works on GraphQL resolvers.
 * This guard does the same verification but reads the request from the HTTP
 * context, so it can be used on REST controllers like the harvest import endpoint.
 *
 * Usage: @UseGuards(HttpClerkAuthGuard, HttpRolesGuard) on a REST controller.
 */
@Injectable()
export class HttpClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(HttpClerkAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = this.extractToken(request);

    if (!token) {
      this.logger.warn('No token provided in request');
      throw new UnauthorizedException('No token provided');
    }

    this.logger.debug(
      `Verifying token (length: ${token.length}, prefix: ${token.substring(0, 20)}...`,
    );

    try {
      const session = await clerkClient.verifyToken(token, {
        authorizedParties: process.env.FRONTEND_APP_URL
          ? [
              process.env.FRONTEND_APP_URL,
              'http://localhost:3002',
              'http://localhost:8081',
              'http://192.168.1.11:8081',
            ]
          : undefined,
      });

      request.clerkSession = session;
      const sub = session.sub ?? session.userId;
      request.clerkUserId = typeof sub === 'string' ? sub : undefined;

      this.logger.debug(
        `Token verified successfully for user: ${request.clerkUserId}`,
      );

      if (request.clerkUserId) {
        await this.fetchUserFromDatabase(request);
      }

      return true;
    } catch (error) {
      this.logger.error('Token verification failed:', {
        error: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.constructor.name : 'Unknown',
        tokenPrefix: token.substring(0, 20),
      });
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async fetchUserFromDatabase(request: AuthRequest): Promise<void> {
    try {
      const usersService = this.moduleRef.get(UsersService, { strict: false });
      if (!usersService) return;

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

  private extractToken(request: Request): string | undefined {
    const auth = request.headers.authorization;
    const [type, token] = (typeof auth === 'string' ? auth : '').split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
