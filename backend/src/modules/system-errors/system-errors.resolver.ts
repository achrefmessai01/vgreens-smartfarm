import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SystemErrorsService } from './system-errors.service';
import { SystemError } from './entities/system-error.entity';
import { CreateSystemErrorInput } from './dto/create-system-error.input';
import { AuthGuard } from '@common/guards';
import { CurrentUser, Public } from '@common/decorators';
import { User } from '@modules/users/entities/user.entity';
import { ErrorSource, ReportSeverity } from '@common/enums';

@Resolver(() => SystemError)
export class SystemErrorsResolver {
  constructor(private readonly systemErrorsService: SystemErrorsService) {}

  @Public()
  @Mutation(() => SystemError)
  async logSystemError(
    @Args('input') createSystemErrorInput: CreateSystemErrorInput,
  ): Promise<SystemError> {
    return this.systemErrorsService.logError(createSystemErrorInput);
  }

  @Query(() => [SystemError])
  @UseGuards(AuthGuard)
  async getRecentSystemErrors(
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
    @Args('offset', { type: () => Number, nullable: true }) offset?: number,
    @Args('severity', { type: () => ReportSeverity, nullable: true })
    severity?: ReportSeverity,
    @Args('source', { type: () => ErrorSource, nullable: true })
    source?: ErrorSource,
    @Args('isResolved', { type: () => Boolean, nullable: true })
    isResolved?: boolean,
  ): Promise<SystemError[]> {
    const { errors } = await this.systemErrorsService.getRecentErrors(
      limit,
      offset,
      severity,
      source,
      isResolved,
    );
    return errors;
  }

  @Query(() => String)
  @UseGuards(AuthGuard)
  async getSystemErrorStats(
    @Args('hours', { type: () => Number, nullable: true }) hours?: number,
  ): Promise<string> {
    const stats = await this.systemErrorsService.getErrorStats(hours);
    return JSON.stringify(stats);
  }

  @Mutation(() => SystemError)
  @UseGuards(AuthGuard)
  async resolveSystemError(
    @Args('errorId', { type: () => ID }) errorId: string,
    @Args('resolutionNotes', { type: () => String, nullable: true })
    resolutionNotes?: string,
    @CurrentUser() user?: User,
  ): Promise<SystemError> {
    return this.systemErrorsService.resolveError(
      errorId,
      user!.id,
      resolutionNotes,
    );
  }
}
