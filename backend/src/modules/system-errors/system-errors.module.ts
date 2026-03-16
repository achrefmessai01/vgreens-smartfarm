import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemErrorsService } from './system-errors.service';
import { SystemErrorsResolver } from './system-errors.resolver';
import { SystemError } from './entities/system-error.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemError])],
  providers: [SystemErrorsService, SystemErrorsResolver],
  exports: [SystemErrorsService],
})
export class SystemErrorsModule {}