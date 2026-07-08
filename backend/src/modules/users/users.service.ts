import {
  Logger,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { In, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { BaseService } from '@common/services';
import { InjectRepository } from '@nestjs/typeorm';
import { ClerkSyncService } from './clerk-sync.service';
import { CreateUserInput, UpdateUserInput } from './dto';
import { HarvestViewSettingsInput } from './dto/user-settings';
import { mergeUserSettings } from './utils/user-settings.util';
import { OrderDirection, UserRole } from '@common/enums';
import { UserStatus } from '@common/enums/user-status.enum';
import { getAdminEmailDomainError } from './utils/admin-email-domain';
import { getTenantDomainError } from './utils/tenant-allowed-domains';

@Injectable()
export class UsersService extends BaseService<User> {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly clerkSyncService: ClerkSyncService,
  ) {
    super(userRepository);
  }

  /**
   * Enforce the tenant's `allowedDomains` whitelist. No-op when the tenantId is
   * missing (admin users have no tenant) or when the tenant has an empty list.
   * Loaded lazily so the caller doesn't have to pre-fetch the tenant.
   */
  private async assertTenantAllowsEmail(
    tenantId: string | null | undefined,
    email: string | null | undefined,
  ): Promise<void> {
    if (!tenantId) return;
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      select: ['id', 'allowedDomains'],
    });
    if (!tenant) return; // surfaced separately by the FK / other checks
    const error = getTenantDomainError(email, tenant.allowedDomains);
    if (error) throw new BadRequestException(error);
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

      // Only vGreens admins can create internal vGreens users (VGREENS_ADMIN
      // and its view-only sibling VGREENS_MEMBER). Both are cross-tenant and
      // therefore must not carry a tenantId.
      const isInternalRole =
        createUserInput.role === UserRole.VGREENS_ADMIN ||
        createUserInput.role === UserRole.VGREENS_MEMBER;
      if (isInternalRole) {
        if (!currentUser || currentUser.role !== UserRole.VGREENS_ADMIN) {
          throw new ForbiddenException(
            'Only vGreens admins can create internal vGreens users',
          );
        }
        if (createUserInput.tenantId) {
          throw new ForbiddenException(
            'Internal vGreens users cannot be assigned to a tenant',
          );
        }
      } else {
        if (!createUserInput.tenantId) {
          throw new ForbiddenException(
            'Tenant ID is required for non-admin users',
          );
        }
      }

      // Admin roles require an email on an allowed domain (VSL-182).
      // Checked before inviting so we never create a Clerk user for a
      // request that will be rejected.
      const domainError = getAdminEmailDomainError(
        createUserInput.role,
        createUserInput.email,
        createUserInput.tenantId,
      );
      if (domainError) {
        throw new BadRequestException(domainError);
      }

      // Per-tenant whitelist (Tenant.allowedDomains). Layered on top of the
      // admin-role rule so a non-admin user added to a domain-restricted
      // tenant is still rejected before a Clerk invitation is sent. Internal
      // vGreens roles are cross-tenant so we skip this whitelist for them.
      await this.assertTenantAllowsEmail(
        isInternalRole ? null : createUserInput.tenantId,
        createUserInput.email,
      );

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
        tenantId: isInternalRole ? undefined : createUserInput.tenantId,
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
      // Re-throw known exceptions (incl. the domain-rule validation error)
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
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

      // Internal vGreens roles (admin + member) are cross-tenant, so promoting
      // a user into either clears any tenantId in the update payload.
      const isNextInternalRole =
        updateUserInput.role === UserRole.VGREENS_ADMIN ||
        updateUserInput.role === UserRole.VGREENS_MEMBER;
      const isPrevInternalRole =
        user.role === UserRole.VGREENS_ADMIN ||
        user.role === UserRole.VGREENS_MEMBER;

      if (isNextInternalRole) {
        updateUserInput.tenantId = undefined;
      } else if (isPrevInternalRole && !updateUserInput.tenantId) {
        // Demoting from an internal role into a tenant-scoped role — a
        // tenantId is required or the resulting user would be orphaned.
        throw new ForbiddenException(
          'Tenant ID is required when demoting an internal vGreens user to a tenant role',
        );
      }
    }

    // Compute the resulting user state up front so every downstream check
    // reasons about what the row will look like *after* this update, not
    // what it looks like today. In particular the "internal role can't have
    // a tenant" invariant needs to fire against `nextRole` — checking
    // `user.role` here rejects legitimate demotions like
    // VGREENS_MEMBER → TENANT_ADMIN + tenantId in the same request.
    const nextRole = updateUserInput.role ?? user.role;
    const nextTenantId =
      updateUserInput.tenantId !== undefined
        ? updateUserInput.tenantId
        : user.tenantId;
    const nextEmail =
      updateUserInput.email !== undefined ? updateUserInput.email : user.email;
    const isNextInternalRoleForInvariant =
      nextRole === UserRole.VGREENS_ADMIN ||
      nextRole === UserRole.VGREENS_MEMBER;

    if (isNextInternalRoleForInvariant && updateUserInput.tenantId) {
      // Note: when the role is being changed *into* an internal role the
      // block above already clears `updateUserInput.tenantId`, so this
      // branch only fires when the caller is trying to assign a tenant to a
      // user who is (and will remain) internal — the case we actually want
      // to reject.
      throw new ForbiddenException(
        'Internal vGreens users cannot be assigned to a tenant',
      );
    }

    // Enforce the destination tenant's allowedDomains whitelist whenever the
    // user is being moved to a different tenant or their email is being
    // changed (the existing tenant might restrict the new address). Skipped
    // when the user is — or is becoming — a VGREENS_ADMIN (no tenant scope).
    const tenantChanging =
      updateUserInput.tenantId !== undefined &&
      updateUserInput.tenantId !== user.tenantId;
    const emailChanging =
      updateUserInput.email !== undefined &&
      updateUserInput.email !== user.email;
    if (
      nextRole !== UserRole.VGREENS_ADMIN &&
      nextRole !== UserRole.VGREENS_MEMBER &&
      (tenantChanging || emailChanging)
    ) {
      await this.assertTenantAllowsEmail(nextTenantId, nextEmail);
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
    // Internal vGreens roles are cross-tenant, so they never appear in a
    // tenant-scoped user list even if a row somehow carries a tenantId.
    return this.userRepository.find({
      where: {
        tenantId,
        role: Not(In([UserRole.VGREENS_ADMIN, UserRole.VGREENS_MEMBER])),
      },
      relations: ['tenant'],
      order: { createdAt: OrderDirection.DESC },
    });
  }

  async findOne(id: string, tenantId?: string): Promise<User | null> {
    if (tenantId === undefined) {
      return this.userRepository.findOne({
        where: { id },
        relations: ['tenant'],
      });
    }
    return this.userRepository.findOne({
      where: {
        id,
        tenantId,
        role: Not(In([UserRole.VGREENS_ADMIN, UserRole.VGREENS_MEMBER])),
      },
      relations: ['tenant'],
    });
  }

  async findAllAdmins(): Promise<User[]> {
    // Both internal vGreens roles show up on the admin user list — they share
    // the same cross-tenant surface.
    return this.userRepository.find({
      where: {
        role: In([UserRole.VGREENS_ADMIN, UserRole.VGREENS_MEMBER]),
      },
      relations: ['tenant'],
    });
  }

  async delete(id: string, tenantId?: string): Promise<void> {
    if (tenantId === undefined) {
      await this.userRepository.softDelete(id);
      return;
    }
    // A tenant admin's scoped delete must never reach an internal vGreens
    // user, even if a bug elsewhere put one in scope.
    await this.userRepository.softDelete({
      id,
      tenantId,
      role: Not(In([UserRole.VGREENS_ADMIN, UserRole.VGREENS_MEMBER])),
    });
  }

  async setPreferredLanguage(userId: string, language: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    // Expand-phase dual-write (VSL-279): userSettings is the canonical home,
    // the flat column is kept in sync so a migration rollback stays lossless.
    user.userSettings = mergeUserSettings(user.userSettings, {
      preferredLanguage: language,
    });
    user.preferredLanguage = language;
    return this.userRepository.save(user);
  }

  async setFarmOverviewTimeRange(userId: string, value: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    // Expand-phase dual-write (VSL-279) — see setPreferredLanguage.
    user.userSettings = mergeUserSettings(user.userSettings, {
      farmOverviewTimeRange: value,
    });
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
    // Read-modify-write at the harvestView sub-key level too: only fields
    // present in the input overwrite their counterpart, so a sort-only update
    // doesn't wipe the collapsed-batch list (and vice versa).
    const existing = user.userSettings?.harvestView ?? {};
    user.userSettings = mergeUserSettings(user.userSettings, {
      harvestView: {
        sort: input.sort !== undefined ? input.sort : (existing.sort ?? null),
        range:
          input.range !== undefined ? input.range : (existing.range ?? null),
        collapsedBatchIds:
          input.collapsedBatchIds !== undefined
            ? input.collapsedBatchIds
            : (existing.collapsedBatchIds ?? null),
      },
    });
    return this.userRepository.save(user);
  }
}
