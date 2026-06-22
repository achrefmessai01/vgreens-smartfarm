import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDirection } from '@common/enums';
import { Crop } from './entities/crop.entity';

// Read-only access to the global crop catalog. Crops are maintained by the
// vGreens Admin team outside this app, so there are no create/update/delete
// methods here. Queries only ever return live (non-soft-deleted) rows.
@Injectable()
export class CropService {
  constructor(
    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,
  ) {}

  // All live crops, or — when a greenhouseId is given — only the crops that
  // greenhouse may grow (via greenhouse_crops). Drives both the batch crop
  // selector and the greenhouse crop-assignment UI.
  async findAll(greenhouseId?: string): Promise<Crop[]> {
    const qb = this.cropRepository
      .createQueryBuilder('crop')
      .orderBy('crop.name', OrderDirection.ASC);

    if (greenhouseId !== undefined) {
      qb.innerJoin(
        'greenhouse_crops',
        'gc',
        'gc."cropId" = crop.id AND gc."greenhouseId" = :greenhouseId',
        { greenhouseId },
      );
    }

    return qb.getMany();
  }
}
