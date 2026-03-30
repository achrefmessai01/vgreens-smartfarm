import { UserRole } from '@common/enums';
import { ErrorReport } from './entities/error-report.entity';
import { ErrorReportsService } from './error-reports.service';
import { Roles, CurrentUser } from '@common/decorators';
import {
  CreateErrorReportInput,
  UpdateErrorReportInput,
  ErrorReportsFilterInput,
} from './dto';
import { User } from '@modules/users/entities/user.entity';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClerkAuthGuard, RolesGuard } from '@common/guards';
import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UserInterceptor, TenantInterceptor } from '@common/interceptors';

@UseGuards(ClerkAuthGuard, RolesGuard)
@UseInterceptors(UserInterceptor, TenantInterceptor)
@Resolver(() => ErrorReport)
export class ErrorReportsResolver {
  constructor(private readonly errorReportsService: ErrorReportsService) {}

  @Query(() => [ErrorReport], { name: 'errorReports' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findAll(
    @CurrentUser() currentUser: User,
    @Args('filter', { type: () => ErrorReportsFilterInput, nullable: true })
    filter?: ErrorReportsFilterInput | null,
  ): Promise<ErrorReport[]> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    if (currentUser.role !== UserRole.VGREENS_ADMIN && !currentUser.tenantId) {
      throw new Error('Tenant ID is required');
    }

    // Regular users can only see their own reports unless they are admins
    if (currentUser.role === UserRole.TENANT_USER && filter) {
      filter.userId = currentUser.id;
    }

    return this.errorReportsService.findAllFiltered(tenantId, filter);
  }

  @Query(() => ErrorReport, { name: 'errorReport', nullable: true })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<ErrorReport | null> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    const errorReport = await this.errorReportsService.findOneById(
      id,
      tenantId,
    );

    // Regular users can only see their own reports
    if (
      currentUser.role === UserRole.TENANT_USER &&
      errorReport &&
      errorReport.userId !== currentUser.id
    ) {
      throw new Error('Access denied');
    }

    return errorReport;
  }

  @Query(() => Int, { name: 'unresolvedErrorReportsCount' })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async getUnresolvedCount(@CurrentUser() currentUser: User): Promise<number> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    return this.errorReportsService.getUnresolvedCount(tenantId);
  }

  @Mutation(() => ErrorReport)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  async createErrorReport(
    @Args('input') input: CreateErrorReportInput,
    @CurrentUser() currentUser: User,
  ): Promise<ErrorReport> {
    const tenantId = currentUser.tenantId;

    return this.errorReportsService.createErrorReport(
      input,
      currentUser.id,
      tenantId,
    );
  }

  @Mutation(() => ErrorReport)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async updateErrorReport(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateErrorReportInput,
    @CurrentUser() currentUser: User,
  ): Promise<ErrorReport> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    return this.errorReportsService.updateErrorReport(id, input, tenantId);
  }

  @Mutation(() => ErrorReport)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async updateErrorReportStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => String }) status: string,
    @CurrentUser() currentUser: User,
  ): Promise<ErrorReport> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    return this.errorReportsService.updateErrorReport(
      id,
      { status: status as any },
      tenantId,
    );
  }

  @Mutation(() => ErrorReport)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async resolveErrorReport(
    @Args('id', { type: () => ID }) id: string,
    @Args('adminNotes', { type: () => String, nullable: true })
    adminNotes: string,
    @CurrentUser() currentUser: User,
  ): Promise<ErrorReport> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    return this.errorReportsService.resolveErrorReport(
      id,
      currentUser.id,
      adminNotes,
      tenantId,
    );
  }

  @Mutation(() => Boolean)
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  async deleteErrorReport(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    const tenantId =
      currentUser.role === UserRole.VGREENS_ADMIN
        ? undefined
        : currentUser.tenantId;

    return this.errorReportsService.deleteErrorReport(id, tenantId);
  }
}
