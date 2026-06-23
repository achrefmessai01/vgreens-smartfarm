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
import { CreateVarietyInput } from './dto';

// Read-only access to the global variety catalog. Varieties are maintained by
// the vGreens Admin team outside this app. Queries only return live
// (non-soft-deleted) rows.
@Injectable()
export class VarietyService {
  private readonly logger = new Logger(VarietyService.name);

  constructor(
    @InjectRepository(Variety)
    private readonly varietyRepository: Repository<Variety>,
  ) {}

  // Live varieties belonging to a crop (cascading selector: crop -> varieties).
  async findByCrop(cropId: string): Promise<Variety[]> {
    return this.varietyRepository
      .createQueryBuilder('variety')
      .where('variety.cropId = :cropId', { cropId })
      .orderBy('variety.name', OrderDirection.ASC)
      .getMany();
  }

  // Adds a new variety to the global catalog, attached to the given crop. The
  // (cropId, name) pair is unique among live rows; if a soft-deleted row exists
  // with the same name we restore it instead of creating a duplicate.
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

    // If a row with the same (cropId, name) was soft-deleted, revive it instead
    // of inserting a second row that would collide with the unique index.
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
}
