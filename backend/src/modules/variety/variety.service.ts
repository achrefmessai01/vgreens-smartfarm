import {
  Logger,
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { OrderDirection } from '@common/enums';
import { Variety } from './entities/variety.entity';
import { Crop } from '@modules/crop/entities/crop.entity';
import { CreateVarietyInput, UpdateVarietyInput } from './dto';

// Global variety catalog. Reads are open to any authenticated user; writes
// (create / update / delete) are admin-only and enforced by the resolver via
// @Roles(...). The catalog is intentionally NOT tenant-scoped for now — this
// mirrors how the crops reference table works and keeps the harvest form
// simple. Tenant isolation can be layered on later without changing the
// external API surface.
@Injectable()
export class VarietyService {
  private readonly logger = new Logger(VarietyService.name);

  constructor(
    @InjectRepository(Variety)
    private readonly varietyRepository: Repository<Variety>,
  ) {}

  // Live varieties belonging to a crop, sorted alphabetically.
  async findByCrop(cropId: string): Promise<Variety[]> {
    return this.varietyRepository
      .createQueryBuilder('variety')
      .where('variety.cropId = :cropId', { cropId })
      .orderBy('variety.name', OrderDirection.ASC)
      .getMany();
  }

  // Adds a new variety attached to the given crop. (cropId, name) is unique
  // among live rows; if a soft-deleted row with the same key exists we revive
  // it instead of creating a duplicate.
  async createVariety(input: CreateVarietyInput): Promise<Variety> {
    const name = input.name.trim();
    if (!name) {
      throw new BadRequestException('Variety name is required');
    }

    // Make sure the parent crop actually exists so we fail fast with a clear
    // error rather than a generic FK violation.
    const cropRepo = this.varietyRepository.manager.getRepository(Crop);
    const crop = await cropRepo.findOne({ where: { id: input.cropId } });
    if (!crop) {
      throw new NotFoundException(`Crop with ID ${input.cropId} not found`);
    }

    // If a row with the same (cropId, name) was soft-deleted, revive it
    // instead of inserting a second row that would collide with the unique
    // index.
    const existing = await this.varietyRepository
      .createQueryBuilder('variety')
      .withDeleted()
      .where('variety.cropId = :cropId AND variety.name = :name', {
        cropId: input.cropId,
        name,
      })
      .getOne();
    if (existing) {
      if (existing.deletedAt) {
        existing.deletedAt = null as unknown as Date | undefined;
        existing.deletedById = null as unknown as string | undefined;
        existing.description = input.description ?? existing.description;
        return this.varietyRepository.save(existing);
      }
      throw new ConflictException(
        'A variety with this name already exists for this crop',
      );
    }

    try {
      const variety = this.varietyRepository.create({
        cropId: input.cropId,
        name,
        description: input.description,
      });
      return await this.varietyRepository.save(variety);
    } catch (error) {
      // Surface the unique-index collision as a clean 409 instead of a 500.
      if (
        error instanceof QueryFailedError &&
        (error as unknown as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'A variety with this name already exists for this crop',
        );
      }
      this.logger.error(
        `createVariety failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to create variety');
    }
  }

  // Renames or edits an existing variety. cropId is fixed at creation-time so
  // batches that already reference the variety keep pointing at the same crop.
  async updateVariety(id: string, input: UpdateVarietyInput): Promise<Variety> {
    const variety = await this.varietyRepository.findOne({ where: { id } });
    if (!variety) {
      throw new NotFoundException(`Variety with ID ${id} not found`);
    }

    if (input.name !== undefined) {
      const trimmed = input.name.trim();
      if (!trimmed) {
        throw new BadRequestException('Variety name is required');
      }
      variety.name = trimmed;
    }
    if (input.description !== undefined) {
      variety.description = input.description || undefined;
    }

    try {
      return await this.varietyRepository.save(variety);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as unknown as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'A variety with this name already exists for this crop',
        );
      }
      this.logger.error(
        `updateVariety failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to update variety');
    }
  }

  // Soft-deletes the variety. Batches that already reference it keep working
  // (the FK stays valid — soft-delete does not remove the row); the dropdown
  // simply stops offering it.
  async deleteVariety(id: string, deletedById: string): Promise<Variety> {
    const variety = await this.varietyRepository.findOne({ where: { id } });
    if (!variety) {
      throw new NotFoundException(`Variety with ID ${id} not found`);
    }
    if (variety.deletedAt) {
      // Idempotent: return the already-deleted row instead of throwing.
      return variety;
    }

    variety.deletedById = deletedById;
    await this.varietyRepository.save(variety);
    await this.varietyRepository.softDelete(id);
    const reloaded = await this.varietyRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    return reloaded ?? variety;
  }
}
