import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FeaturesModule } from '@modules/features/features.module';
import { TenantsModule } from '@modules/tenants/tenants.module';
import { CameraLivestreamProxyController } from './camera-livestream-proxy.controller';
import { CameraLivestreamResolver } from './camera-livestream.resolver';
import { CameraLivestreamService } from './camera-livestream.service';

@Module({
  imports: [ConfigModule, FeaturesModule, TenantsModule],
  controllers: [CameraLivestreamProxyController],
  providers: [CameraLivestreamResolver, CameraLivestreamService],
})
export class CameraLivestreamModule {}
