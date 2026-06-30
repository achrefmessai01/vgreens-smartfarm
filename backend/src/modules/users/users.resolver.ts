import { UserRole } from '@common/enums';
import { UseGuards, BadRequestException } from '@nestjs/common';
import { Roles } from '@common/decorators';
import { RolesGuard } from '@common/guards';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CurrentUser } from '@common/decorators';
import { CreateUserInput, UpdateUserInput } from './dto';
import { HarvestViewSettingsInput } from './dto/user-settings';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { resolveTenantId } from '@common/utils';

@Resolver(() => User)
@UseGuards(RolesGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { nullable: true })
  async me(@CurrentUser() user: User): Promise<User | null> {
    if (!user) {
      return null;
    }
    return this.usersService.findByClerkUserId(user.clerkUserId);
  }

  /**
   * Persist the signed-in user's preferred locale so the language choice
   * follows them across browsers / devices. The list of accepted values
   * mirrors `frontend/src/i18n/config.ts > locales`.
   */
  @Mutation(() => User)
  async setMyLanguage(
    @Args('language') language: string,
    @CurrentUser() user: User,
  ): Promise<User> {
    if (!user) {
      throw new BadRequestException('Not authenticated');
    }
    const allowed = new Set([
      'en',
      'de',
      'fr',
      'es',
      'it',
      'pt',
      'pl',
      'ro',
      'tr',
      'el',
      'ar',
    ]);
    if (!allowed.has(language)) {
      throw new BadRequestException(`Unsupported language code: ${language}`);
    }
    return this.usersService.setPreferredLanguage(user.id, language);
  }

  /**
   * Persist the signed-in user's farm-overview time-range selection. Accepts
   * either a preset key (5m, 1h, 24h, 7d, 30d, 90d, ytd) or a custom range
   * encoded as `custom:<fromISO>|<toISO>` — the pipe separator avoids the
   * `:` collisions inside ISO 8601 timestamps. Both timestamps must parse,
   * `from` must be strictly before `to`, and `to` cannot be more than 60 s
   * in the future (small clock-skew tolerance).
   */
  @Mutation(() => User)
  async setMyFarmOverviewTimeRange(
    @Args('value') value: string,
    @CurrentUser() user: User,
  ): Promise<User> {
    if (!user) {
      throw new BadRequestException('Not authenticated');
    }
    const presets = new Set(['5m', '1h', '24h', '7d', '30d', '90d', 'ytd']);
    if (presets.has(value)) {
      return this.usersService.setFarmOverviewTimeRange(user.id, value);
    }
    if (value.startsWith('custom:')) {
      const body = value.slice('custom:'.length);
      const pipeIdx = body.indexOf('|');
      if (pipeIdx > 0) {
        const fromIso = body.slice(0, pipeIdx);
        const toIso = body.slice(pipeIdx + 1);
        const from = new Date(fromIso);
        const to = new Date(toIso);
        if (
          !Number.isNaN(from.getTime()) &&
          !Number.isNaN(to.getTime()) &&
          from < to &&
          to.getTime() <= Date.now() + 60_000
        ) {
          return this.usersService.setFarmOverviewTimeRange(user.id, value);
        }
      }
      throw new BadRequestException(`Invalid custom range: ${value}`);
    }
    throw new BadRequestException(`Unsupported time-range value: ${value}`);
  }

  /**
   * Persist the signed-in user's harvest-entry view preferences (sort field +
   * direction and a relative plantingDate range preset). All values are enum-
   * validated by the InputType; the service merges them into the existing
   * userSettings blob without clobbering sibling keys.
   */
  @Mutation(() => User)
  async updateMyHarvestViewSettings(
    @Args('input') input: HarvestViewSettingsInput,
    @CurrentUser() user: User,
  ): Promise<User> {
    if (!user) {
      throw new BadRequestException('Not authenticated');
    }
    return this.usersService.updateHarvestViewSettings(user.id, input);
  }

  @Query(() => [User])
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async users(
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<User[]> {
    // VGREENS_ADMIN: with a tenantId filter from the global selector we mirror
    // tenant-admin view (`findAllByTenant`); without one we surface every user
    // across tenants for cross-tenant administration.
    if (currentUser.role === UserRole.VGREENS_ADMIN) {
      return tenantId
        ? this.usersService.findAllByTenant(tenantId)
        : this.usersService.findAllWithTenant();
    }
    // Non-admins: helper enforces tenant pinning (and throws on cross-tenant
    // override attempts).
    const scopedTenantId = resolveTenantId(currentUser, tenantId);
    if (!scopedTenantId) {
      throw new Error('Tenant ID is required for tenant admins');
    }
    return this.usersService.findAllByTenant(scopedTenantId);
  }

  @Query(() => User, { nullable: true })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async user(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<User | null> {
    return this.usersService.findOne(
      id,
      resolveTenantId(currentUser, tenantId, false),
    );
  }

  @Mutation(() => User)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async createUser(
    @Args('input') createUserInput: CreateUserInput,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    try {
      // Tenant admins can only create users for their tenant
      if (currentUser.role === UserRole.TENANT_ADMIN) {
        if (!currentUser.tenantId) {
          throw new BadRequestException(
            'Tenant ID is required for tenant admins',
          );
        }
        // Set tenantId for tenant admin users
        createUserInput = {
          ...createUserInput,
          tenantId: currentUser.tenantId,
        };
        // Tenant admins cannot create admin users
        if (createUserInput.role === UserRole.VGREENS_ADMIN) {
          throw new BadRequestException(
            'Tenant admins cannot create admin users',
          );
        }
      }
      return await this.usersService.createUser(createUserInput, currentUser);
    } catch (error) {
      // Re-throw known exceptions
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Log and re-throw other errors
      console.error('Error in createUser resolver:', error);
      throw error;
    }
  }

  @Mutation(() => User)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateUserInput: UpdateUserInput,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<User> {
    // VGREENS_ADMIN can update any user; tenant admins are pinned to their own
    // tenant. The helper enforces this and rejects cross-tenant override
    // attempts from tenant admins.
    return this.usersService.updateUser(
      id,
      updateUserInput,
      currentUser,
      resolveTenantId(currentUser, tenantId, false),
    );
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async deleteUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<boolean> {
    await this.usersService.delete(
      id,
      resolveTenantId(currentUser, tenantId, false),
    );
    return true;
  }
}
