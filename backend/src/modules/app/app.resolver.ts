import { Public } from '@common/decorators';
import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Public()
  @Query(() => String)
  health(): string {
    return 'OK';
  }
}
