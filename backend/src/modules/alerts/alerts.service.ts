import { Repository } from 'typeorm';
import { BaseService } from '@common/services';
import { Alert } from './entities/alert.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAlertInput, UpdateAlertInput } from './dto';
import { AlertStatus } from '@/common/enums/alert-status.enum';
import { AlertSeverity } from '@/common/enums/alert-severity.enum';
import { Injectable, NotFoundException, Logger } from '@nestjs/common';

@Injectable()
export class AlertsService extends BaseService<Alert> {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
  ) {
    super(alertRepository);
  }

  async findAllByTenant(tenantId: string): Promise<Alert[]> {
    return this.alertRepository.find({
      where: { tenantId },
      order: { timestamp: 'DESC' },
      relations: ['tenant'],
    });
  }

  async findOneById(id: string, tenantId?: string): Promise<Alert> {
    const alert = await this.findOne(id, tenantId);
    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }
    return alert;
  }

  async createAlert(input: CreateAlertInput, tenantId: string): Promise<Alert> {
    const alert = this.alertRepository.create({
      ...input,
      tenantId,
      severity: (input.severity ?? AlertSeverity.CRITICAL) as AlertSeverity,
      status: AlertStatus.OPEN as AlertStatus,
      timestamp: new Date(),
    });

    const saved = await this.alertRepository.save(alert);
    const result = await this.alertRepository.findOne({
      where: { id: saved.id },
      relations: ['tenant'],
    });

    if (!result) {
      throw new NotFoundException(`Failed to reload alert with ID ${saved.id}`);
    }

    return result;
  }

  async updateAlert(
    id: string,
    input: UpdateAlertInput,
    tenantId?: string,
  ): Promise<Alert> {
    const alert = await this.findOneById(id, tenantId);

    Object.assign(alert, input);
    const saved = await this.alertRepository.save(alert);

    const result = await this.alertRepository.findOne({
      where: { id: saved.id },
      relations: ['tenant'],
    });

    if (!result) {
      throw new NotFoundException(`Failed to reload alert with ID ${saved.id}`);
    }

    return result;
  }

  async acknowledgeAlert(id: string, tenantId?: string): Promise<Alert> {
    return this.updateAlert(id, { status: AlertStatus.ACKNOWLEDGED }, tenantId);
  }

  async resolveAlert(id: string, tenantId?: string): Promise<Alert> {
    return this.updateAlert(id, { status: AlertStatus.RESOLVED }, tenantId);
  }

  async deleteAlert(id: string, tenantId?: string): Promise<void> {
    await this.findOneById(id, tenantId);
    await this.delete(id, tenantId);
  }
}
