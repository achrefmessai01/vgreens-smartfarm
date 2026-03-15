import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorReport } from './entities/error-report.entity';
import { ErrorReportsService } from './error-reports.service';
import { ErrorReportsResolver } from './error-reports.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ErrorReport])],
  providers: [ErrorReportsService, ErrorReportsResolver],
  exports: [ErrorReportsService],
})
export class ErrorReportsModule {}