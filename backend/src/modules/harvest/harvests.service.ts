import {
  Logger,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BaseService } from '@common/services';
import { Harvest } from './entities/harvest.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHarvestInput } from './dto/create-harvest.input';
import { UpdateHarvestInput } from './dto/update-harvest.input';
import { HarvestFilterInput } from './dto/harvest-filter.input';
import { DashboardFilterInput } from './dto/dashboard-filter.input';
import {
  HarvestDashboardMetrics,
  YieldOverTimeData,
  ClassDistributionData,
  BrixTrendData,
  CumulativeYieldData,
} from './dto/dashboard-metrics.dto';
import { HarvestStatus } from '@/common/enums/harvest-status.enum';
import { OrderDirection } from '@/common/enums/order-direction.enum';

@Injectable()
export class HarvestsService extends BaseService<Harvest> {
  private readonly logger = new Logger(HarvestsService.name);

  constructor(
    @InjectRepository(Harvest)
    private readonly harvestRepository: Repository<Harvest>,
  ) {
    super(harvestRepository);
  }

  private readonly harvestRelations = ['tenant', 'createdBy'] as const;

  private computeRowSpacing(
    cultivationArea: number,
    numberOfRows: number,
    rowLength: number,
  ): number {
    const denominator = numberOfRows * rowLength;
    if (denominator <= 0) return 0;
    return cultivationArea / denominator;
  }

  private isDashboardPlaceholder(harvest: Harvest): boolean {
    return (
      harvest.status === HarvestStatus.DRAFT &&
      harvest.parentBatchId == null &&
      harvest.classA === 0 &&
      harvest.classB === 0 &&
      harvest.waste === 0 &&
      harvest.avgBrix === 0 &&
      harvest.rowX === 0 &&
      harvest.rowY === 0 &&
      harvest.photos === 0
    );
  }

  async findAllFiltered(
    tenantId: string | undefined,
    filter?: HarvestFilterInput | null,
  ): Promise<Harvest[]> {
    try {
      const qb = this.harvestRepository
        .createQueryBuilder('harvest')
        .leftJoinAndSelect('harvest.tenant', 'tenant')
        .leftJoinAndSelect('harvest.createdBy', 'createdBy')
        .orderBy('harvest.date', OrderDirection.DESC)
        .addOrderBy('harvest.createdAt', OrderDirection.DESC);

      if (tenantId !== undefined) {
        qb.andWhere('harvest.tenantId = :tenantId', { tenantId });
      }

      if (!filter) {
        return qb.getMany();
      }

      if (filter.tenantId) {
        qb.andWhere('harvest.tenantId = :filterTenantId', {
          filterTenantId: filter.tenantId,
        });
      }

      if (filter.createdById) {
        qb.andWhere('harvest.createdById = :createdById', {
          createdById: filter.createdById,
        });
      }

      if (filter.search?.trim()) {
        const term = `%${filter.search.trim()}%`;
        qb.andWhere(
          '(harvest.batch ILIKE :term OR harvest.species ILIKE :term OR harvest.variety ILIKE :term)',
          { term },
        );
      }

      if (filter.dateFrom) {
        qb.andWhere('harvest.date >= :dateFrom', {
          dateFrom: filter.dateFrom,
        });
      }
      if (filter.dateTo) {
        qb.andWhere('harvest.date <= :dateTo', { dateTo: filter.dateTo });
      }

      if (filter.status) {
        qb.andWhere('harvest.status = :status', { status: filter.status });
      }

      if (filter.greenhouse) {
        qb.andWhere('harvest.greenhouse = :greenhouse', {
          greenhouse: filter.greenhouse,
        });
      }

      return qb.getMany();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `findAllFiltered failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to fetch harvests');
    }
  }

  async findOneById(id: string, tenantId?: string): Promise<Harvest> {
    try {
      const harvest = await this.findOne(id, tenantId);
      if (!harvest) {
        throw new NotFoundException(`Harvest with ID ${id} not found`);
      }
      return harvest;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `findOneById failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to fetch harvest');
    }
  }

  async findOneWithRelations(
    id: string,
    tenantId?: string,
  ): Promise<Harvest | null> {
    const qb = this.harvestRepository
      .createQueryBuilder('harvest')
      .leftJoinAndSelect('harvest.tenant', 'tenant')
      .leftJoinAndSelect('harvest.createdBy', 'createdBy')
      .where('harvest.id = :id', { id });

    if (tenantId !== undefined) {
      qb.andWhere('harvest.tenantId = :tenantId', { tenantId });
    }

    return qb.getOne();
  }

  async createHarvest(
    input: CreateHarvestInput,
    tenantId: string,
    createdById: string,
  ): Promise<Harvest> {
    try {
      const batchName = input.batch ?? `${input.species} - ${input.variety}`;

      const harvest = this.harvestRepository.create({
        tenantId,
        parentBatchId: input.parentBatchId ?? null,
        createdById,
        species: input.species,
        variety: input.variety,
        batch: batchName,
        greenhouse: input.greenhouse ?? undefined,
        plantingDate: new Date(input.plantingDate),
        cultivationArea: input.cultivationArea,
        numberOfRows: input.numberOfRows,
        rowLength: input.rowLength,
        plantsPerMeter: input.plantsPerMeter,
        rowSpacing:
          input.rowSpacing ??
          this.computeRowSpacing(
            input.cultivationArea,
            input.numberOfRows,
            input.rowLength,
          ),
        status: input.status ?? HarvestStatus.ACTIVE,
        date: new Date(input.date),
        classA: input.classA ?? 0,
        classB: input.classB ?? 0,
        waste: input.waste ?? 0,
        avgBrix: input.avgBrix ?? 0,
        rowX:
          input.rowX ??
          (input.numberOfRowsHarvested && input.numberOfRowsHarvested > 0
            ? 1
            : 0),
        rowY:
          input.rowY ??
          (input.numberOfRowsHarvested && input.numberOfRowsHarvested > 0
            ? input.numberOfRowsHarvested
            : 0),
        brixReadings: input.brixReadings ?? [],
        photos: input.photos ?? 0,
        photoUrls: input.photoUrls ?? [],
      });

      const saved = await this.harvestRepository.save(harvest);
      const result = await this.harvestRepository.findOne({
        where: { id: saved.id },
        relations: [...this.harvestRelations],
      });

      if (!result) {
        throw new NotFoundException(
          `Failed to reload harvest with ID ${saved.id}`,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `createHarvest failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to create harvest');
    }
  }

  async updateHarvest(
    id: string,
    input: UpdateHarvestInput,
    tenantId?: string,
  ): Promise<Harvest> {
    try {
      const harvest = await this.findOneById(id, tenantId);

      if (input.species !== undefined) harvest.species = input.species;
      if (input.variety !== undefined) harvest.variety = input.variety;
      if (input.batch !== undefined) harvest.batch = input.batch;
      if (input.parentBatchId !== undefined) {
        harvest.parentBatchId = input.parentBatchId;
      }
      if (input.greenhouse !== undefined) harvest.greenhouse = input.greenhouse;
      if (input.plantingDate !== undefined) {
        harvest.plantingDate = new Date(input.plantingDate);
      }
      if (input.cultivationArea !== undefined)
        harvest.cultivationArea = input.cultivationArea;
      if (input.numberOfRows !== undefined)
        harvest.numberOfRows = input.numberOfRows;
      if (input.rowLength !== undefined) harvest.rowLength = input.rowLength;
      if (input.plantsPerMeter !== undefined) {
        harvest.plantsPerMeter = input.plantsPerMeter;
      }
      if (input.rowSpacing !== undefined) {
        harvest.rowSpacing = input.rowSpacing;
      } else if (
        input.cultivationArea !== undefined ||
        input.numberOfRows !== undefined ||
        input.rowLength !== undefined
      ) {
        harvest.rowSpacing = this.computeRowSpacing(
          harvest.cultivationArea,
          harvest.numberOfRows,
          harvest.rowLength,
        );
      }
      if (input.status !== undefined) harvest.status = input.status;
      if (input.date !== undefined) harvest.date = new Date(input.date);
      if (input.classA !== undefined) harvest.classA = input.classA;
      if (input.classB !== undefined) harvest.classB = input.classB;
      if (input.waste !== undefined) harvest.waste = input.waste;
      if (input.avgBrix !== undefined) harvest.avgBrix = input.avgBrix;
      if (input.rowX !== undefined) harvest.rowX = input.rowX;
      if (input.rowY !== undefined) harvest.rowY = input.rowY;
      if (
        input.numberOfRowsHarvested !== undefined &&
        input.rowX === undefined &&
        input.rowY === undefined
      ) {
        harvest.rowX = input.numberOfRowsHarvested > 0 ? 1 : 0;
        harvest.rowY =
          input.numberOfRowsHarvested > 0 ? input.numberOfRowsHarvested : 0;
      }
      if (input.brixReadings !== undefined) {
        harvest.brixReadings = input.brixReadings;
      }
      if (input.photos !== undefined) harvest.photos = input.photos;
      if (input.photoUrls !== undefined) harvest.photoUrls = input.photoUrls;

      const saved = await this.harvestRepository.save(harvest);
      const result = await this.harvestRepository.findOne({
        where: { id: saved.id },
        relations: [...this.harvestRelations],
      });

      if (!result) {
        throw new NotFoundException(
          `Failed to reload harvest with ID ${saved.id}`,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `updateHarvest failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to update harvest');
    }
  }

  async deleteHarvest(id: string, tenantId?: string): Promise<void> {
    try {
      await this.findOneById(id, tenantId);
      await this.delete(id, tenantId);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `deleteHarvest failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to delete harvest');
    }
  }

  async getDashboardMetrics(
    tenantId: string | undefined,
    filter?: DashboardFilterInput | null,
  ): Promise<HarvestDashboardMetrics> {
    try {
      const qb = this.harvestRepository.createQueryBuilder('harvest');

      if (tenantId !== undefined) {
        qb.andWhere('harvest.tenantId = :tenantId', { tenantId });
      }

      if (filter) {
        if (filter.tenantId) {
          qb.andWhere('harvest.tenantId = :filterTenantId', {
            filterTenantId: filter.tenantId,
          });
        }
        if (filter.species) {
          qb.andWhere('harvest.species ILIKE :species', {
            species: `%${filter.species}%`,
          });
        }
        if (filter.variety) {
          qb.andWhere('harvest.variety ILIKE :variety', {
            variety: `%${filter.variety}%`,
          });
        }
        if (filter.batch) {
          qb.andWhere('harvest.batch ILIKE :batch', {
            batch: `%${filter.batch}%`,
          });
        }
        if (filter.dateFrom) {
          qb.andWhere('harvest.date >= :dateFrom', {
            dateFrom: filter.dateFrom,
          });
        }
        if (filter.dateTo) {
          qb.andWhere('harvest.date <= :dateTo', {
            dateTo: filter.dateTo,
          });
        }
        if (filter.greenhouse) {
          qb.andWhere('harvest.greenhouse = :greenhouse', {
            greenhouse: filter.greenhouse,
          });
        }
      }

      qb.orderBy('harvest.date', OrderDirection.ASC);
      const harvests = await qb.getMany();
      const metricsHarvests = harvests.filter(
        (harvest) => !this.isDashboardPlaceholder(harvest),
      );

      if (metricsHarvests.length === 0) {
        return this.getEmptyDashboardMetrics();
      }

      // Get primary species and variety (most common)
      const speciesMap = new Map<string, number>();
      const varietyMap = new Map<string, number>();

      metricsHarvests.forEach((h) => {
        speciesMap.set(h.species, (speciesMap.get(h.species) || 0) + 1);
        varietyMap.set(h.variety, (varietyMap.get(h.variety) || 0) + 1);
      });

      const primarySpecies = [...speciesMap.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0][0];
      const primaryVariety = [...varietyMap.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0][0];

      // Calculate metrics
      const totalMarketable = metricsHarvests.reduce(
        (sum, h) => sum + h.classA,
        0,
      );
      const totalWaste = metricsHarvests.reduce((sum, h) => sum + h.waste, 0);
      const totalYield = totalMarketable + totalWaste;

      const marketablePercent =
        totalYield > 0 ? (totalMarketable / totalYield) * 100 : 0;
      const wastePercent = totalYield > 0 ? (totalWaste / totalYield) * 100 : 0;

      // Calculate average brix
      const validBrixHarvests = metricsHarvests.filter((h) => h.avgBrix > 0);
      const averageBrix =
        validBrixHarvests.length > 0
          ? validBrixHarvests.reduce((sum, h) => sum + h.avgBrix, 0) /
            validBrixHarvests.length
          : 0;

      // Calculate days active (from earliest planting date to latest harvest date)
      const plantingDates = metricsHarvests.map(
        (h) => new Date(h.plantingDate),
      );
      const harvestDates = metricsHarvests.map((h) => new Date(h.date));
      const earliestPlanting = new Date(
        Math.min(...plantingDates.map((d) => d.getTime())),
      );
      const latestHarvest = new Date(
        Math.max(...harvestDates.map((d) => d.getTime())),
      );
      const daysActive = Math.ceil(
        (latestHarvest.getTime() - earliestPlanting.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Critical alerts (harvests with low brix or high waste percentage)
      const criticalAlerts = metricsHarvests.filter(
        (h) => h.avgBrix < 6.0 || h.waste / (h.classA + h.waste) > 0.15,
      ).length;

      // Generate time series data
      const yieldOverTime = this.generateYieldOverTimeData(metricsHarvests);
      const classDistribution =
        this.generateClassDistributionData(metricsHarvests);
      const brixTrend = this.generateBrixTrendData(metricsHarvests);
      const cumulativeYield = this.generateCumulativeYieldData(metricsHarvests);

      return {
        species: primarySpecies,
        variety: primaryVariety,
        harvestCount: metricsHarvests.length,
        totalYield: Math.round(totalYield * 10) / 10,
        averageBrix: Math.round(averageBrix * 10) / 10,
        marketablePercent: Math.round(marketablePercent * 10) / 10,
        wastePercent: Math.round(wastePercent * 10) / 10,
        wasteTotal: Math.round(totalWaste * 10) / 10,
        criticalAlerts,
        daysActive,
        yieldOverTime,
        classDistribution,
        brixTrend,
        cumulativeYield,
      };
    } catch (error) {
      this.logger.error(
        `getDashboardMetrics failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Failed to fetch dashboard metrics',
      );
    }
  }

  private getEmptyDashboardMetrics(): HarvestDashboardMetrics {
    return {
      species: 'N/A',
      variety: 'N/A',
      harvestCount: 0,
      totalYield: 0,
      averageBrix: 0,
      marketablePercent: 0,
      wastePercent: 0,
      wasteTotal: 0,
      criticalAlerts: 0,
      daysActive: 0,
      yieldOverTime: [],
      classDistribution: [],
      brixTrend: [],
      cumulativeYield: [],
    };
  }

  private generateYieldOverTimeData(harvests: Harvest[]): YieldOverTimeData[] {
    const dailyYield = new Map<string, number>();

    harvests.forEach((harvest) => {
      const dateStr = harvest.date.toISOString().split('T')[0];
      const currentYield = dailyYield.get(dateStr) || 0;
      dailyYield.set(dateStr, currentYield + harvest.classA);
    });

    return Array.from(dailyYield.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, yieldAmount]) => ({
        date,
        yield: Math.round(yieldAmount * 10) / 10,
      }));
  }

  private generateClassDistributionData(
    harvests: Harvest[],
  ): ClassDistributionData[] {
    const dailyData = new Map<string, { marketable: number; waste: number }>();

    harvests.forEach((harvest) => {
      const dateStr = harvest.date.toISOString().split('T')[0];
      const current = dailyData.get(dateStr) || { marketable: 0, waste: 0 };
      dailyData.set(dateStr, {
        marketable: current.marketable + harvest.classA,
        waste: current.waste + harvest.waste,
      });
    });

    return Array.from(dailyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        marketable: Math.round(data.marketable * 10) / 10,
        waste: Math.round(data.waste * 10) / 10,
      }));
  }

  private generateBrixTrendData(harvests: Harvest[]): BrixTrendData[] {
    const dailyBrix = new Map<string, { total: number; count: number }>();

    harvests.forEach((harvest) => {
      if (harvest.avgBrix > 0) {
        const dateStr = harvest.date.toISOString().split('T')[0];
        const current = dailyBrix.get(dateStr) || { total: 0, count: 0 };
        dailyBrix.set(dateStr, {
          total: current.total + harvest.avgBrix,
          count: current.count + 1,
        });
      }
    });

    return Array.from(dailyBrix.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        brix: Math.round((data.total / data.count) * 10) / 10,
      }));
  }

  private generateCumulativeYieldData(
    harvests: Harvest[],
  ): CumulativeYieldData[] {
    const dailyData = new Map<string, { marketable: number; waste: number }>();

    harvests.forEach((harvest) => {
      const dateStr = harvest.date.toISOString().split('T')[0];
      const current = dailyData.get(dateStr) || { marketable: 0, waste: 0 };
      dailyData.set(dateStr, {
        marketable: current.marketable + harvest.classA,
        waste: current.waste + harvest.waste,
      });
    });

    const sortedEntries = Array.from(dailyData.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    let cumulative = 0;
    let cumulativeWaste = 0;

    return sortedEntries.map(([date, data]) => {
      cumulative += data.marketable;
      cumulativeWaste += data.waste;
      return {
        date,
        cumulative: Math.round(cumulative * 10) / 10,
        cumulativeWaste: Math.round(cumulativeWaste * 10) / 10,
      };
    });
  }
}
