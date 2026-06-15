import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GreenhouseModule } from '@modules/greenhouse/greenhouse.module';
import { GreenhouseCrop } from './entities';
import { GreenhouseCropService } from './greenhouse-crop.service';
import { GreenhouseCropResolver } from './greenhouse-crop.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([GreenhouseCrop]), GreenhouseModule],
  providers: [GreenhouseCropResolver, GreenhouseCropService],
  exports: [GreenhouseCropService, TypeOrmModule],
})
export class GreenhouseCropModule {}
