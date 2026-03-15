import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorReport } from './entities/error-report.entity';
import {
  CreateErrorReportInput,
  UpdateErrorReportInput,
  ErrorReportsFilterInput,
} from './dto';
import { OrderDirection } from '@common/enums';

@Injectable()
export class ErrorReportsService {
  constructor(
    @InjectRepository(ErrorReport)
    private readonly errorReportRepository: Repository<ErrorReport>,
  ) {}

  async findAllFiltered(
    tenantId?: string,
    filter?: ErrorReportsFilterInput | null,
  ): Promise<ErrorReport[]> {
    const query = this.errorReportRepository
      .createQueryBuilder('errorReport')
      .leftJoinAndSelect('errorReport.user', 'user')
      .leftJoinAndSelect('errorReport.tenant', 'tenant')
      .leftJoinAndSelect('errorReport.resolvedByUser', 'resolvedByUser');

    // Filter by tenant
    if (tenantId) {
      query.andWhere('errorReport.tenantId = :tenantId', { tenantId });
    }

    // Apply filters
    if (filter) {
      if (filter.userId) {
        query.andWhere('errorReport.userId = :userId', { userId: filter.userId });
      }

      if (filter.severity) {
        query.andWhere('errorReport.severity = :severity', { severity: filter.severity });
      }

      if (typeof filter.isResolved === 'boolean') {
        query.andWhere('errorReport.isResolved = :isResolved', { isResolved: filter.isResolved });
      }

      if (filter.createdAfter) {
        query.andWhere('errorReport.createdAt >= :createdAfter', {
          createdAfter: filter.createdAfter,
        });
      }

      if (filter.createdBefore) {
        query.andWhere('errorReport.createdAt <= :createdBefore', {
          createdBefore: filter.createdBefore,
        });
      }
    }

    // Apply ordering
    const orderDirection = filter?.orderDirection || OrderDirection.DESC;
    query.orderBy('errorReport.createdAt', orderDirection);

    return query.getMany();
  }

  async findOneById(id: string, tenantId?: string): Promise<ErrorReport | null> {
    const query = this.errorReportRepository
      .createQueryBuilder('errorReport')
      .leftJoinAndSelect('errorReport.user', 'user')
      .leftJoinAndSelect('errorReport.tenant', 'tenant')
      .leftJoinAndSelect('errorReport.resolvedByUser', 'resolvedByUser')
      .where('errorReport.id = :id', { id });

    if (tenantId) {
      query.andWhere('errorReport.tenantId = :tenantId', { tenantId });
    }

    return query.getOne();
  }

  async createErrorReport(
    input: CreateErrorReportInput,
    userId: string,
    tenantId?: string,
  ): Promise<ErrorReport> {
    const errorReport = this.errorReportRepository.create({
      ...input,
      userId,
      tenantId,
      attachments: input.attachments ? JSON.stringify(input.attachments) : undefined,
    });

    return this.errorReportRepository.save(errorReport);
  }

  async updateErrorReport(
    id: string,
    input: UpdateErrorReportInput,
    tenantId?: string,
  ): Promise<ErrorReport> {
    const existingReport = await this.findOneById(id, tenantId);

    if (!existingReport) {
      throw new NotFoundException(`Error report with ID ${id} not found`);
    }

    Object.assign(existingReport, input);

    return this.errorReportRepository.save(existingReport);
  }

  async resolveErrorReport(
    id: string,
    resolvedById: string,
    adminNotes?: string,
    tenantId?: string,
  ): Promise<ErrorReport> {
    const existingReport = await this.findOneById(id, tenantId);

    if (!existingReport) {
      throw new NotFoundException(`Error report with ID ${id} not found`);
    }

    existingReport.isResolved = true;
    existingReport.resolvedAt = new Date();
    existingReport.resolvedBy = resolvedById;
    if (adminNotes) {
      existingReport.adminNotes = adminNotes;
    }

    return this.errorReportRepository.save(existingReport);
  }

  async deleteErrorReport(id: string, tenantId?: string): Promise<boolean> {
    const existingReport = await this.findOneById(id, tenantId);

    if (!existingReport) {
      throw new NotFoundException(`Error report with ID ${id} not found`);
    }

    await this.errorReportRepository.remove(existingReport);
    return true;
  }

  async getUnresolvedCount(tenantId?: string): Promise<number> {
    const query = this.errorReportRepository
      .createQueryBuilder('errorReport')
      .where('errorReport.isResolved = :isResolved', { isResolved: false });

    if (tenantId) {
      query.andWhere('errorReport.tenantId = :tenantId', { tenantId });
    }

    return query.getCount();
  }
}