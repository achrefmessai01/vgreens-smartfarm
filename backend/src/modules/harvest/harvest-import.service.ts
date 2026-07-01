import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
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

  async importFile(
    file: Express.Multer.File,
    tenant: Tenant,
    dryRun: boolean,
  ): Promise<ImportReport> {
    const mapperFn = getMapperForTenant(tenant.id);

    if (!mapperFn) {
      throw new BadRequestException(
        `Harvest import is not configured for "${tenant.name}".`,
      );
    }

    const os = await import('os');
    const fs = await import('fs');
    const path = await import('path');

    const ext = path.extname(file.originalname).toLowerCase() || '.xls';
    const tmpPath = path.join(
      os.tmpdir(),
      `harvest-import-${Date.now()}${ext}`,
    );

    try {
      fs.writeFileSync(tmpPath, file.buffer);
      const { rows, issues } = mapperFn(tmpPath);
      return await runImport(
        this.dataSource,
        tenant.name,
        rows,
        issues,
        'knaup',
        file.originalname,
        dryRun,
      );
    } finally {
      try {
        fs.unlinkSync(tmpPath);
      } catch {
        // ignore cleanup errors
      }
    }
  }
}
