import { UserRole } from '@common/enums';
import { UseGuards, BadRequestException } from '@nestjs/common';
import { Roles } from '@common/decorators';
import { RolesGuard } from '@common/guards';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CurrentUser } from '@common/decorators';
import { CreateUserInput, UpdateUserInput } from './dto';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';

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

  @Query(() => [User])
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async users(@CurrentUser() currentUser: User): Promise<User[]> {
    if (currentUser.role === UserRole.VGREENS_ADMIN) {
      return this.usersService.findAllWithTenant();
    } else {
      if (!currentUser.tenantId) {
        throw new Error('Tenant ID is required for tenant admins');
      }
      return this.usersService.findAllByTenant(currentUser.tenantId);
    }
  }

  @Query(() => User, { nullable: true })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async user(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<User | null> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId || undefined;
    return this.usersService.findOne(id, tenantId);
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
  ): Promise<User> {
    // VGREENS_ADMIN can update any user (tenantId = undefined)
    // Tenant admins can only update users in their tenant
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId || undefined;
    return this.usersService.updateUser(
      id,
      updateUserInput,
      currentUser,
      tenantId,
    );
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async deleteUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    // VGREENS_ADMIN can delete any user (tenantId = undefined)
    // Tenant admins can only delete users in their tenant
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId || undefined;
    await this.usersService.delete(id, tenantId);
    return true;
  }
}
