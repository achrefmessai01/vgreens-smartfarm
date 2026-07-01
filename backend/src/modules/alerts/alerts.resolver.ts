import { UserRole } from '@common/enums';
import { Alert } from './entities/alert.entity';
import { AlertsService } from './alerts.service';
import { Roles, CurrentUser } from '@common/decorators';
import { CreateAlertInput, UpdateAlertInput, AlertsFilterInput } from './dto';
import { User } from '@modules/users/entities/user.entity';
import { Inject, UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { AlertThresholdService } from './alert-threshold.service';
import {
  Resolver,
  Query,
  Mutation,
  Subscription,
  Args,
  ID,
} from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';
import { resolveTenantId } from '@common/utils';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB, ALERT_CREATED_EVENT } from './pubsub';

@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver(() => Alert)
export class AlertsResolver {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly alertThresholdService: AlertThresholdService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  // VSL-97: real-time push of newly-created alerts (drives toast
  // notifications). Tenant isolation is enforced by `filter`: tenant-scoped
  // users only receive alerts for their own tenant; VGREENS_ADMIN receives
  // all (or only the selected tenant when one is passed). Role restrictions
  // mirror the `alerts` query. The authenticated user is attached to
  // `context.req.user` by the (reused) ClerkAuthGuard.
  @Subscription(() => Alert, {
    name: 'alertCreated',
    // Extract the alert from the published payload (`{ alertCreated: <alert> }`).
    // Null-safe so a stray/undefined event can never crash the resolver.
    resolve: (payload: { alertCreated?: Alert } | undefined) =>
      payload?.alertCreated,
    // Tenant isolation. Null-safe: events without an alert are skipped (so an
    // undefined payload is filtered out instead of reaching resolve).
    filter: (
      payload: { alertCreated?: Alert } | undefined,
      variables: { tenantId?: string | null } | undefined,
      context: { req?: { user?: User } },
    ) => {
      const user = context?.req?.user;
      const alert = payload?.alertCreated;
      if (!user || !alert) return false;
      if (user.role === UserRole.VGREENS_ADMIN) {
        // When admin has scoped to a single tenant via the global selector,
        // only stream alerts for that tenant. Otherwise (no scope) admin
        // sees the firehose across all tenants.
        return variables?.tenantId
          ? alert.tenantId === variables.tenantId
          : true;
      }
      return alert.tenantId === user.tenantId;
    },
  })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  alertCreated(
    // Declared so the variable is exposed in the GraphQL schema for the
    // subscription's filter to consume; the resolver body itself ignores it.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Args('tenantId', { type: () => ID, nullable: true })
    _tenantId?: string | null,
  ) {
    return this.pubSub.asyncIterableIterator<{ alertCreated: Alert }>(
      ALERT_CREATED_EVENT,
    );
  }

  @Query(() => [Alert], { name: 'alerts' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findAll(
    @CurrentUser() currentUser: User,
    @Args('filter', { type: () => AlertsFilterInput, nullable: true })
    filter?: AlertsFilterInput | null,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Alert[]> {
    return this.alertsService.findAllFiltered(
      resolveTenantId(currentUser, tenantId),
      filter,
    );
  }

  @Query(() => Alert, { name: 'alert', nullable: true })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Alert | null> {
    return this.alertsService.findOneById(
      id,
      resolveTenantId(currentUser, tenantId, false),
    );
  }

  @Mutation(() => Alert)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async createAlert(
    @Args('input') input: CreateAlertInput,
    @CurrentUser() currentUser: User,
  ): Promise<Alert> {
    // Admins must supply input.tenantId explicitly when the selector points
    // at a tenant; non-admins are pinned to their own.
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? input.tenantId
        : currentUser.tenantId;

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.alertsService.createAlert(input, tenantId);
  }

  @Mutation(() => Alert)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async updateAlert(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateAlertInput,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Alert> {
    return this.alertsService.updateAlert(
      id,
      input,
      resolveTenantId(currentUser, tenantId, false),
    );
  }

  @Mutation(() => Alert)
  // VGREENS_MEMBER is view-only overall, but alert acknowledgement is a
  // low-risk workflow action we let them perform so on-call reviewers can
  // clear the queue without escalating to VGREENS_ADMIN.
  @Roles(
    UserRole.VGREENS_ADMIN,
    UserRole.VGREENS_MEMBER,
    UserRole.TENANT_ADMIN,
    UserRole.TENANT_USER,
  )
  async acknowledgeAlert(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Alert> {
    return this.alertsService.acknowledgeAlert(
      id,
      currentUser.id,
      resolveTenantId(currentUser, tenantId, false),
    );
  }

  @Mutation(() => Alert)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async resolveAlert(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<Alert> {
    return this.alertsService.resolveAlert(
      id,
      currentUser.id,
      resolveTenantId(currentUser, tenantId, false),
    );
  }

  @Mutation(() => Boolean, { name: 'runThresholdCheck' })
  // @Roles(UserRole.VGREENS_ADMIN)
  async runThresholdCheck(
    @Args('tenantId', { type: () => ID }) tenantId: string,
    @Args('bucketName', { type: () => String }) bucketName: string,
  ): Promise<boolean> {
    await this.alertThresholdService.runThresholdCheckForBucket(
      tenantId,
      bucketName,
    );
    return true;
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async softDeleteAlert(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<boolean> {
    await this.alertsService.softDeleteAlert(
      id,
      currentUser.id,
      resolveTenantId(currentUser, tenantId, false),
    );
    return true;
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async deleteAlert(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
    @Args('tenantId', { type: () => ID, nullable: true })
    tenantId?: string | null,
  ): Promise<boolean> {
    await this.alertsService.deleteAlert(
      id,
      resolveTenantId(currentUser, tenantId, false),
    );
    return true;
  }
}
