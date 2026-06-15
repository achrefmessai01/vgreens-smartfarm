import { Roles } from '@common/decorators';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@common/enums';
import { RolesGuard } from '@common/guards';
import { User } from '@modules/users/entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CameraLivestreamService } from './camera-livestream.service';
import { CameraLivestreamFeed, CameraLivestreamStream } from './objects';

@Resolver(() => CameraLivestreamFeed)
@UseGuards(RolesGuard)
export class CameraLivestreamResolver {
  constructor(
    private readonly cameraLivestreamService: CameraLivestreamService,
  ) {}

  @Query(() => [CameraLivestreamFeed], {
    name: 'cameraLivestreamFeeds',
  })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  cameraLivestreamFeeds(
    @CurrentUser() currentUser: User,
  ): Promise<CameraLivestreamFeed[]> {
    return this.cameraLivestreamService.listCameras(currentUser);
  }

  @Query(() => CameraLivestreamStream, {
    name: 'cameraLivestreamStreamUrl',
  })
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN, UserRole.TENANT_USER)
  cameraLivestreamStreamUrl(
    @CurrentUser() currentUser: User,
    @Args('cameraId') cameraId: string,
  ): Promise<CameraLivestreamStream> {
    return this.cameraLivestreamService.createStream(currentUser, cameraId);
  }
}
