import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Crop } from './entities';
import { CropService } from './crop.service';
import { CropResolver } from './crop.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Crop])],
  providers: [CropResolver, CropService],
  exports: [CropService, TypeOrmModule],
})
export class CropModule {}
