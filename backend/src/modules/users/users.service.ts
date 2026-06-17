import {
  Logger,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { BaseService } from '@common/services';
import { InjectRepository } from '@nestjs/typeorm';
import { ClerkSyncService } from './clerk-sync.service';
import { CreateUserInput, UpdateUserInput } from './dto';
import { HarvestViewSettingsInput } from './dto/user-settings';
import { mergeUserSettings } from './utils/user-settings.util';
import { OrderDirection, UserRole } from '@common/enums';
import { UserStatus } from '@common/enums/user-status.enum';

@Injectable()
export class UsersService extends BaseService<User> {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly clerkSyncService: ClerkSyncService,
  ) {
    super(userRepository);
  }

  async findByClerkUserId(clerkUserId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { clerkUserId },
      relations: ['tenant'],
    });
  }

  async findByEmail(email: string, tenantId?: string): Promise<User | null> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (tenantId) {
      query.andWhere('user.tenantId = :tenantId', { tenantId });
    }

    return query.getOne();
  }

  async createUser(
    createUserInput: CreateUserInput,
    currentUser?: User,
  ): Promise<User> {
    try {
      // Check if user already exists by email
      if (createUserInput.email) {
        const existingUser = await this.findByEmail(createUserInput.email);
        if (existingUser) {
          throw new ForbiddenException('User with this email already exists');
        }
      }

      // If clerkUserId is provided, check if it exists
      if (createUserInput.clerkUserId) {
        const existingUser = await this.findByClerkUserId(
          createUserInput.clerkUserId,
        );
        if (existingUser) {
          throw new ForbiddenException(
            'User with this Clerk ID already exists',
          );
        }
      }

      // Only vGreens admins can create users with admin roles
      if (createUserInput.role === UserRole.VGREENS_ADMIN) {
        if (!currentUser || currentUser.role !== UserRole.VGREENS_ADMIN) {
          throw new ForbiddenException(
            'Only vGreens admins can create admin users',
          );
        }
        if (createUserInput.tenantId) {
          throw new ForbiddenException(
            'VGREENS_ADMIN users cannot be assigned to a tenant',
          );
        }
      } else {
        if (!createUserInput.tenantId) {
          throw new ForbiddenException(
            'Tenant ID is required for non-admin users',
          );
        }
      }

      // If no clerkUserId provided, send invitation via Clerk
      let clerkUserId = createUserInput.clerkUserId;
      let invitationUrl: string | undefined;

      if (!clerkUserId && createUserInput.email) {
        try {
          // Send invitation via Clerk
          const invitation = await this.clerkSyncService.sendInvitation({
            emailAddress: createUserInput.email,
            firstName: createUserInput.firstName,
            lastName: createUserInput.lastName,
            role: createUserInput.role,
            tenantId: createUserInput.tenantId,
          });
          clerkUserId = invitation.clerkUserId;
          invitationUrl = invitation.invitationUrl;
        } catch (error) {
          // Log the error with full details
          this.logger.error('Failed to send Clerk invitation:', error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : typeof error === 'string'
                ? error
                : 'Unknown error';
          throw new ForbiddenException(
            `Failed to send invitation: ${errorMessage}`,
          );
        }
      }

      if (!clerkUserId) {
        throw new ForbiddenException(
          'Either clerkUserId or email must be provided',
        );
      }

      const user = this.userRepository.create({
        ...createUserInput,
        clerkUserId,
        role: createUserInput.role || UserRole.TENANT_USER,
        tenantId:
          createUserInput.role === UserRole.VGREENS_ADMIN
            ? undefined
            : createUserInput.tenantId,
        status: invitationUrl ? UserStatus.PENDING : UserStatus.ACTIVE, // PENDING if invitation sent
        isActive: !invitationUrl, // Inactive if pending invitation
        metadata: invitationUrl
          ? {
              invitationUrl,
              invitationSentAt: new Date().toISOString(),
            }
          : undefined,
      });

      return this.userRepository.save(user);
    } catch (error) {
      // Re-throw known exceptions
      if (error instanceof ForbiddenException) {
        throw error;
      }
      // Log unexpected errors with full stack trace
      this.logger.error('Error creating user:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error';
      throw new ForbiddenException(`Failed to create user: ${errorMessage}`);
    }
  }

  async updateUser(
    id: string,
    updateUserInput: UpdateUserInput,
    currentUser: User,
    tenantId?: string,
  ): Promise<User> {
    const effectiveTenantId =
      currentUser.role === UserRole.VGREENS_ADMIN ? undefined : tenantId;

    const user = await this.findOne(id, effectiveTenantId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Role change restrictions — only enforce when the role is actually
    // changing. Clients commonly send the user's existing role on every
    // update (firstName/lastName/etc.), and we shouldn't block those edits
    // unless the role itself differs.
    const isRoleChanging =
      updateUserInput.role != null && updateUserInput.role !== user.role;

    if (isRoleChanging) {
      // Only vGreens admins can change roles
      if (currentUser.role !== UserRole.VGREENS_ADMIN) {
        throw new ForbiddenException(
          'Only vGreens admins can change user roles',
        );
      }

      // Prevent changing own role
      if (currentUser.id === id) {
        throw new ForbiddenException('Cannot change your own role');
      }

      if (updateUserInput.role === UserRole.VGREENS_ADMIN) {
        updateUserInput.tenantId = undefined;
      } else {
        if (user.role === UserRole.VGREENS_ADMIN && !updateUserInput.tenantId) {
          throw new ForbiddenException(
            'Tenant ID is required when changing from VGREENS_ADMIN to non-admin role',
          );
        }
      }
    }

    if (user.role === UserRole.VGREENS_ADMIN && updateUserInput.tenantId) {
      throw new ForbiddenException(
        'VGREENS_ADMIN users cannot be assigned to a tenant',
      );
    }

    Object.assign(user, updateUserInput);
    return this.userRepository.save(user);
  }

  async findAllWithTenant(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['tenant'],
      order: { createdAt: OrderDirection.DESC },
    });
  }

  async findAllByTenant(tenantId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { tenantId },
      relations: ['tenant'],
      order: { createdAt: OrderDirection.DESC },
    });
  }

  async findAllAdmins(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.VGREENS_ADMIN },
      relations: ['tenant'],
    });
  }

  async setPreferredLanguage(userId: string, language: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    user.preferredLanguage = language;
    return this.userRepository.save(user);
  }

  async setFarmOverviewTimeRange(userId: string, value: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    user.farmOverviewTimeRange = value;
    return this.userRepository.save(user);
  }

  /**
   * Persist the signed-in user's harvest-entry view preferences (sort +
   * plantingDate range). Validates the structure, then MERGES `harvestView`
   * into the existing userSettings blob so other settings keys survive
   * (read-modify-write).
   */
  async updateHarvestViewSettings(
    userId: string,
    input: HarvestViewSettingsInput,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    user.userSettings = mergeUserSettings(user.userSettings, {
      harvestView: {
        sort: input.sort ?? null,
        range: input.range ?? null,
      },
    });
    return this.userRepository.save(user);
  }
}
