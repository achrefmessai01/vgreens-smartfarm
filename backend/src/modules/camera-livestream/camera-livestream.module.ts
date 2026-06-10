import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FeaturesModule } from '@modules/features/features.module';
import { CameraLivestreamResolver } from './camera-livestream.resolver';
import { CameraLivestreamService } from './camera-livestream.service';

@Module({
  imports: [ConfigModule, FeaturesModule],
  providers: [CameraLivestreamResolver, CameraLivestreamService],
})
export class CameraLivestreamModule {}
