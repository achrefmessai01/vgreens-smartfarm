import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { runImport } from '../../../scripts/harvest-import/engine';
import type { ImportReport } from '../../../scripts/harvest-import/types';
import {
  hasMapperForTenant,
  getMapperForTenant,
} from './harvest-import-mapper.registry';

@Injectable()
export class HarvestImportService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  hasMapperForTenant(tenantId: string): boolean {
    return hasMapperForTenant(tenantId);
  }

  async importForTenant(
    fileUpload: Promise<FileUpload>,
    tenantId: string,
    dryRun: boolean,
  ): Promise<ImportReport> {
    const tenant = await this.dataSource
      .getRepository(Tenant)
      .findOne({ where: { id: tenantId } });

    if (!tenant) {
      throw new NotFoundException(`Tenant "${tenantId}" not found.`);
    }

    return this.importFile(fileUpload, tenant, dryRun);
  }

  async importFile(
    fileUpload: Promise<FileUpload>,
    tenant: Tenant,
    dryRun: boolean,
  ): Promise<ImportReport> {
    const file = await Promise.resolve(fileUpload);

    const mapperFn = getMapperForTenant(tenant.id);
    if (!mapperFn) {
      throw new BadRequestException(
        `Harvest import is not configured for "${tenant.name}".`,
      );
    }

    const os = await import('os');
    const fs = await import('fs');
    const path = await import('path');

    const ext = path.extname(file.filename).toLowerCase() || '.xls';
    const tmpPath = path.join(
      os.tmpdir(),
      `harvest-import-${Date.now()}${ext}`,
    );

    try {
      // pipe upload to disk before passing to xlsx parser
      await new Promise<void>((resolve, reject) => {
        const readStream = file.createReadStream();
        const writeStream = fs.createWriteStream(tmpPath);
        readStream.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
        readStream.on('error', reject);
      });

      const { rows, issues } = mapperFn(tmpPath);
      return await runImport(
        this.dataSource,
        tenant.name,
        rows,
        issues,
        'knaup',
        file.filename,
        dryRun,
      );
    } finally {
      try {
        fs.unlinkSync(tmpPath);
      } catch { /* best-effort */ }
    }
  }
}
