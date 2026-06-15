import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Greenhouse } from './entities';
import { GreenhouseService } from './greenhouse.service';
import { GreenhouseResolver } from './greenhouse.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Greenhouse])],
  providers: [GreenhouseResolver, GreenhouseService],
  exports: [GreenhouseService],
})
export class GreenhouseModule {}
