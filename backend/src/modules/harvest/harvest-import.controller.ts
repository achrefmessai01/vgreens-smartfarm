import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Roles } from '@common/decorators';
import { HttpClerkAuthGuard, HttpRolesGuard } from '@common/guards';
import { UserRole } from '@common/enums';
import type { AuthRequest } from '@common/guards/clerk-auth.guard';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { HarvestImportService } from './harvest-import.service';
import type { ImportReport } from '../../../scripts/harvest-import/types';

const ALLOWED_EXTENSIONS = ['.xls', '.xlsx', '.csv'];

/**
 * REST controller for /harvests/import
 *
 * Auth model:
 *   TENANT_ADMIN  — imports only for their own tenant (tenantId from JWT, never from query)
 *   VGREENS_ADMIN — must supply ?tenantId=<uuid> to select the target tenant
 *   TENANT_USER   — blocked by @Roles (403)
 */
@Controller('harvests')
@UseGuards(HttpClerkAuthGuard, HttpRolesGuard)
export class HarvestImportController {
  constructor(
    private readonly harvestImportService: HarvestImportService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  /**
   * GET /harvests/import/available
   *
   * Returns whether the authenticated tenant has a mapper configured.
   * TENANT_ADMIN → checks their own tenant ID against the registry.
   * VGREENS_ADMIN → always true (they select the target tenant in the dialog).
   *
   * The frontend uses this to show/hide the Import button.
   */
  @Get('import/available')
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  importAvailable(@Req() req: AuthRequest): { available: boolean } {
    const user = req.user;

    if (user?.role === UserRole.VGREENS_ADMIN) {
      // vGreens admin can always open the import dialog (they pick the tenant there).
      return { available: true };
    }

    // TENANT_ADMIN: check if their tenant ID has a mapper in the registry.
    const tenantId = user?.tenantId;
    if (!tenantId) return { available: false };

    return { available: this.harvestImportService.hasMapperForTenant(tenantId) };
  }

  /**
   * POST /harvests/import
   *
   * Accepts a multipart file upload and runs the import pipeline.
   * dryRun defaults to true — pass ?dryRun=false to commit.
   */
  @Post('import')
  @Roles(UserRole.VGREENS_ADMIN, UserRole.TENANT_ADMIN)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async importHarvest(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
    @Query('dryRun') dryRunParam?: string,
    @Query('tenantId') tenantIdParam?: string,
  ): Promise<ImportReport> {
    // ── File validation ──────────────────────────────────────────────────────
    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Send the file in a multipart "file" field.',
      );
    }

    const ext = '.' + (file.originalname.split('.').pop() ?? '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(
        `Unsupported file type "${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
      );
    }

    // ── Dry-run defaults to true (safe) ──────────────────────────────────────
    const dryRun = dryRunParam !== 'false';

    // ── Resolve tenant — TENANT_ADMIN always uses their own JWT tenantId ─────
    const user = req.user;
    let tenantId: string;

    if (user?.role === UserRole.VGREENS_ADMIN) {
      if (!tenantIdParam) {
        throw new BadRequestException(
          'Supply ?tenantId=<uuid> to specify the target tenant.',
        );
      }
      tenantId = tenantIdParam;
    } else {
      // TENANT_ADMIN: tenantId is always from the JWT — cannot be overridden.
      if (!user?.tenantId) {
        throw new BadRequestException('Authenticated user has no tenant associated.');
      }
      tenantId = user.tenantId;
    }

    // ── Load tenant entity ───────────────────────────────────────────────────
    const tenant = await this.dataSource
      .getRepository(Tenant)
      .findOne({ where: { id: tenantId } });

    if (!tenant) {
      throw new NotFoundException(`Tenant "${tenantId}" not found.`);
    }

    // ── Delegate to service ──────────────────────────────────────────────────
    return this.harvestImportService.importFile(file, tenant, dryRun);
  }
}
