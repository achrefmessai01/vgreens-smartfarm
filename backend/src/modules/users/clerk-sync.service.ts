import { Repository } from 'typeorm';
import { UserRole } from '@common/enums';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { UserStatus } from '@common/enums/user-status.enum';
import { Webhook } from 'svix';

export interface HandleClerkWebhookInput {
  svixId: string;
  svixTimestamp: string;
  svixSignature: string;
  payload: any;
}
@Injectable()
export class ClerkSyncService {
  private readonly logger = new Logger(ClerkSyncService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async sendInvitation(params: {
    emailAddress: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    tenantId?: string;
  }): Promise<{ clerkUserId: string; invitationUrl: string }> {
    try {
      // Check if user already exists in Clerk by email
      let clerkUser;
      try {
        // Try to find existing user first
        const users = await clerkClient.users.getUserList({
          emailAddress: [params.emailAddress],
          limit: 1,
        });

        if (users.data && users.data.length > 0) {
          // User already exists, use existing user
          clerkUser = users.data[0];
          this.logger.log(
            `User ${params.emailAddress} already exists in Clerk (ID: ${clerkUser.id}), using existing user`,
          );
        } else {
          // Create new user in Clerk
          this.logger.log(`Creating new user in Clerk: ${params.emailAddress}`);
          clerkUser = await clerkClient.users.createUser({
            emailAddress: [params.emailAddress],
            firstName: params.firstName,
            lastName: params.lastName,
            skipPasswordChecks: true,
            skipPasswordRequirement: true,
            publicMetadata: {
              role: params.role,
              tenantId: params.tenantId,
            },
          });
          this.logger.log(`Created user in Clerk: ${clerkUser.id}`);
        }
      } catch (error: any) {
        // If user creation fails with 422, try to find the user
        if (error?.status === 422 || error?.statusCode === 422) {
          this.logger.warn(
            `User creation returned 422, attempting to find existing user: ${params.emailAddress}`,
          );
          try {
            const users = await clerkClient.users.getUserList({
              emailAddress: [params.emailAddress],
              limit: 1,
            });
            if (users.data && users.data.length > 0) {
              clerkUser = users.data[0];
              this.logger.log(`Found existing user in Clerk: ${clerkUser.id}`);
            } else {
              // Extract detailed error from Clerk
              const errorDetails = error.errors
                ? JSON.stringify(error.errors)
                : error.message || 'Unprocessable Entity';
              throw new Error(
                `Clerk API error (422): ${errorDetails}. User may already exist but could not be found.`,
              );
            }
          } catch (findError) {
            const errorDetails = error.errors
              ? JSON.stringify(error.errors)
              : error.message || 'Unprocessable Entity';
            throw new Error(
              `Failed to create or find user in Clerk: ${errorDetails}`,
            );
          }
        } else {
          // Re-throw other errors
          const errorMessage =
            error?.message || error?.toString() || 'Unknown error';
          throw new Error(`Failed to create user in Clerk: ${errorMessage}`);
        }
      }

      if (!clerkUser || !clerkUser.id) {
        throw new Error('Failed to get Clerk user ID');
      }

      // Create invitation
      let invitation;
      try {
        this.logger.log(
          `Creating invitation for user: ${clerkUser.id} (${params.emailAddress})`,
        );
        invitation = await clerkClient.invitations.createInvitation({
          emailAddress: params.emailAddress,
          publicMetadata: {
            role: params.role,
            tenantId: params.tenantId,
          },
        });
        this.logger.log(`Invitation created successfully`);
      } catch (error: any) {
        // If invitation creation fails, log but don't fail the whole operation
        // The user exists in Clerk and can be manually invited later
        this.logger.warn(
          `Failed to create invitation for ${params.emailAddress}:`,
          error?.message || error?.toString() || 'Unknown error',
        );

        // Return the clerkUserId even if invitation fails
        // The user can be manually invited later or invitation can be retried
        return {
          clerkUserId: clerkUser.id,
          invitationUrl: '',
        };
      }

      return {
        clerkUserId: clerkUser.id,
        invitationUrl: invitation?.url || '',
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to send invitation to ${params.emailAddress}:`,
        error,
      );

      // Extract more detailed error message
      let errorMessage = 'Failed to send invitation';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.errors) {
        errorMessage = `Clerk API error: ${JSON.stringify(error.errors)}`;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.toString) {
        errorMessage = error.toString();
      }

      throw new Error(errorMessage);
    }
  }

  async syncUserFromClerk(
    clerkUserId: string,
    tenantId?: string,
  ): Promise<User> {
    try {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);

      let user = await this.userRepository.findOne({
        where: { clerkUserId },
      });

      const userData = {
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        metadata: {
          clerkMetadata: clerkUser.publicMetadata,
          lastSyncedAt: new Date().toISOString(),
        },
      };

      if (user) {
        Object.assign(user, userData);
        if (tenantId && !user.tenantId) {
          user.tenantId = tenantId;
        }
        // Update status to ACTIVE when user signs up
        if (user.status === UserStatus.PENDING) {
          user.status = UserStatus.ACTIVE;
          user.isActive = true;
        }
        return this.userRepository.save(user);
      } else {
        // User doesn't exist in our DB, create it
        user = this.userRepository.create({
          clerkUserId,
          ...userData,
          role:
            (clerkUser.publicMetadata?.role as UserRole) ||
            UserRole.TENANT_USER,
          tenantId:
            (clerkUser.publicMetadata?.tenantId as string) || tenantId || null,
          status: UserStatus.ACTIVE,
          isActive: true,
        });
        return this.userRepository.save(user);
      }
    } catch (error) {
      this.logger.error(`Failed to sync user ${clerkUserId}:`, error);
      throw error;
    }
  }

  async handleClerkWebhook(input: HandleClerkWebhookInput): Promise<boolean> {
    this.logger.warn('input', input);

    try {
      const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('CLERK_WEBHOOK_SECRET is not set');
      }

      const wh = new Webhook(webhookSecret);
      const evt = wh.verify(JSON.stringify(input.payload), {
        'svix-id': input.svixId,
        'svix-timestamp': input.svixTimestamp,
        'svix-signature': input.svixSignature,
      }) as {
        type: string;
        data: {
          id: string;
          email_addresses?: Array<{ email_address: string }>;
          [key: string]: any;
        };
      };

      if (evt.type === 'user.created') {
        await this.handleClerkUserCreated(
          evt.data.id,
          evt.data.email_addresses?.[0]?.email_address,
        );
      } else if (evt.type === 'user.updated') {
        await this.handleClerkUserUpdated(evt.data.id);
      } else if (evt.type === 'user.deleted') {
        await this.handleClerkUserDeleted(evt.data.id);
      }

      return true;
    } catch (err) {
      this.logger.error('Error verifying webhook:', err);
      throw err;
    }
  }

  private async handleClerkUserCreated(
    clerkUserId: string,
    email?: string,
  ): Promise<void> {
    this.logger.log(`Processing user.created event for ${clerkUserId}`);

    // When user signs up via invitation, update status to ACTIVE
    const user = await this.userRepository.findOne({
      where: { clerkUserId },
    });

    if (user && user.status === UserStatus.PENDING) {
      this.logger.log(
        `Updating user ${clerkUserId} status from PENDING to ACTIVE`,
      );
      user.status = UserStatus.ACTIVE;
      user.isActive = true;
      await this.userRepository.save(user);
    }

    await this.syncUserFromClerk(clerkUserId);
  }

  private async handleClerkUserUpdated(clerkUserId: string): Promise<void> {
    this.logger.log(`Processing user.updated event for ${clerkUserId}`);
    await this.syncUserFromClerk(clerkUserId);
  }

  private async handleClerkUserDeleted(clerkUserId: string): Promise<void> {
    this.logger.log(`Processing user.deleted event for ${clerkUserId}`);
    await this.userRepository.delete({ clerkUserId });
  }
}
