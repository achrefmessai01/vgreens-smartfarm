import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDirection } from '@common/enums';
import { Variety } from './entities/variety.entity';

// Read-only access to the global variety catalog. Varieties are maintained by
// the vGreens Admin team outside this app. Queries only return live
// (non-soft-deleted) rows.
@Injectable()
export class VarietyService {
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
}
