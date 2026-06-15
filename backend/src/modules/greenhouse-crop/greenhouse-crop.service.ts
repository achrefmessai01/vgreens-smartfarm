import {
  Logger,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { GreenhouseService } from '@modules/greenhouse/greenhouse.service';
import { GreenhouseCrop } from './entities/greenhouse-crop.entity';

// Manages which crops a greenhouse may grow. Tenant isolation is enforced by
// verifying the greenhouse belongs to the caller's tenant (GreenhouseService
// throws when it doesn't; VGREENS_ADMIN passes tenantId=undefined = unscoped),
// mirroring the resolver pattern used elsewhere.
@Injectable()
export class GreenhouseCropService {
  private readonly logger = new Logger(GreenhouseCropService.name);

  constructor(
    @InjectRepository(GreenhouseCrop)
    private readonly greenhouseCropRepository: Repository<GreenhouseCrop>,
    private readonly greenhouseService: GreenhouseService,
  ) {}

  // Assign a crop to a greenhouse. Idempotent: a duplicate (greenhouseId,
  // cropId) hits the unique constraint and we return the existing row.
  async assign(
    greenhouseId: string,
    cropId: string,
    tenantId?: string,
  ): Promise<GreenhouseCrop> {
    // Ownership check (throws NotFound when the greenhouse isn't the caller's).
    await this.greenhouseService.findOneById(greenhouseId, tenantId);

    try {
      const link = this.greenhouseCropRepository.create({
        greenhouseId,
        cropId,
      });
      return await this.greenhouseCropRepository.save(link);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const existing = await this.greenhouseCropRepository.findOne({
          where: { greenhouseId, cropId },
        });
        if (existing) return existing;
      }
      this.logger.error(
        `assign failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to assign crop');
    }
  }

  // Remove a crop assignment (hard delete). No-op if it doesn't exist.
  async unassign(
    greenhouseId: string,
    cropId: string,
    tenantId?: string,
  ): Promise<boolean> {
    await this.greenhouseService.findOneById(greenhouseId, tenantId);
    await this.greenhouseCropRepository.delete({ greenhouseId, cropId });
    return true;
  }
}
