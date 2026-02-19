import {
  Logger,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BaseService } from '@common/services';
import { Alert } from './entities/alert.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { CreateAlertInput, UpdateAlertInput } from './dto';
import { AlertStatus } from '@/common/enums/alert-status.enum';
import { AlertSeverity } from '@/common/enums/alert-severity.enum';
import { OrderDirection } from '@/common/enums/order-direction.enum';

@Injectable()
export class AlertsService extends BaseService<Alert> {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
  ) {
    super(alertRepository);
  }

  private readonly alertRelations = [
    'tenant',
    'acknowledgedBy',
    'resolvedBy',
  ] as const;

  async findAllByTenant(tenantId: string): Promise<Alert[]> {
    try {
      return await this.alertRepository.find({
        where: { tenantId: 'd734c818-ae58-404a-95c9-14fcf907a9ac' },
        order: { timestamp: OrderDirection.DESC },
        relations: [...this.alertRelations],
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `findAllByTenant failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to fetch alerts');
    }
  }

  async findOneById(id: string, tenantId?: string): Promise<Alert> {
    try {
      const alert = await this.findOne(id);
      if (!alert) {
        throw new NotFoundException(`Alert with ID ${id} not found`);
      }
      return alert;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `findOneById failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to fetch alert');
    }
  }

  async createAlert(input: CreateAlertInput, tenantId: string): Promise<Alert> {
    try {
      const alertTime: Date =
        typeof input.timestamp === 'string'
          ? new Date(input.timestamp as string)
          : new Date();
      const alert = this.alertRepository.create({
        ...input,
        tenantId,
        severity: (input.severity ?? AlertSeverity.CRITICAL) as AlertSeverity,
        status: AlertStatus.OPEN as AlertStatus,
        timestamp: alertTime,
      });

      const saved = await this.alertRepository.save(alert);
      const result = await this.alertRepository.findOne({
        where: { id: saved.id },
        relations: [...this.alertRelations],
      });

      if (!result) {
        throw new NotFoundException(
          `Failed to reload alert with ID ${saved.id}`,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `createAlert failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to create alert');
    }
  }

  async updateAlert(
    id: string,
    input: UpdateAlertInput,
    tenantId?: string,
  ): Promise<Alert> {
    try {
      const alert = await this.findOneById(id, tenantId);

      Object.assign(alert, input);
      const saved = await this.alertRepository.save(alert);

      const result = await this.alertRepository.findOne({
        where: { id: saved.id },
        relations: [...this.alertRelations],
      });

      if (!result) {
        throw new NotFoundException(
          `Failed to reload alert with ID ${saved.id}`,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `updateAlert failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to update alert');
    }
  }

  async acknowledgeAlert(
    id: string,
    userId: string,
    tenantId?: string,
  ): Promise<Alert> {
    try {
      const alert = await this.findOneById(id, tenantId);
      alert.status = AlertStatus.ACKNOWLEDGED;
      alert.acknowledgedById = userId;
      alert.acknowledgedTime = new Date();
      const saved = await this.alertRepository.save(alert);
      const result = await this.alertRepository.findOne({
        where: { id: saved.id },
        relations: [...this.alertRelations],
      });
      if (!result) {
        throw new NotFoundException(
          `Failed to reload alert with ID ${saved.id}`,
        );
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `acknowledgeAlert failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to acknowledge alert');
    }
  }

  async resolveAlert(
    id: string,
    userId: string,
    tenantId?: string,
  ): Promise<Alert> {
    try {
      const alert = await this.findOneById(id, tenantId);
      alert.status = AlertStatus.RESOLVED;
      alert.resolvedById = userId;
      alert.resolvedTime = new Date();
      const saved = await this.alertRepository.save(alert);
      const result = await this.alertRepository.findOne({
        where: { id: saved.id },
        relations: [...this.alertRelations],
      });
      if (!result) {
        throw new NotFoundException(
          `Failed to reload alert with ID ${saved.id}`,
        );
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `resolveAlert failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to resolve alert');
    }
  }

  async findOpenAlertForSensor(
    tenantId: string,
    sensorName: string,
    since: Date,
  ): Promise<Alert | null> {
    return this.alertRepository.findOne({
      where: {
        tenantId,
        sensorName,
        status: AlertStatus.OPEN,
        createdAt: MoreThanOrEqual(since),
      },
      order: { createdAt: OrderDirection.DESC },
    });
  }

  async findOpenAlertForSensorWithValue(
    tenantId: string,
    sensorName: string,
    value: string,
  ): Promise<Alert | null> {
    return this.alertRepository.findOne({
      where: {
        tenantId,
        sensorName,
        value,
        status: AlertStatus.OPEN,
      },
      order: { createdAt: OrderDirection.DESC },
    });
  }

  async deleteAlert(id: string, tenantId?: string): Promise<void> {
    try {
      await this.findOneById(id, tenantId);
      await this.delete(id, tenantId);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `deleteAlert failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to delete alert');
    }
  }
}
