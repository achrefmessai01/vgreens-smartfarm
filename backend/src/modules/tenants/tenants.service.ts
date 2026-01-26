import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTenantInput, UpdateTenantInput } from './dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InfluxTenantService } from '@modules/influxdb/influx-tenant.service';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly influxTenantService: InfluxTenantService,
  ) { }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      relations: ['users'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  async create(createTenantInput: CreateTenantInput): Promise<Tenant> {
    const tenant = this.tenantRepository.create({
      ...createTenantInput,
      isActive: createTenantInput.isActive ?? true,
    });

    // First save the tenant to get a stable ID
    const savedTenant = await this.tenantRepository.save(tenant);

    // Derive and persist a bucket name for this tenant
    const bucketName = this.influxTenantService.buildBucketName(savedTenant);
    savedTenant.influxBucketName = bucketName;

    // Fire-and-forget bucket creation in InfluxDB (no need to block tenant creation)
    void this.influxTenantService.ensureBucketForTenant(
      savedTenant,
      bucketName,
    );

    return this.tenantRepository.save(savedTenant);
  }

  async update(
    id: string,
    updateTenantInput: UpdateTenantInput,
  ): Promise<Tenant> {
    const tenant = await this.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }

    Object.assign(tenant, updateTenantInput);
    return this.tenantRepository.save(tenant);
  }

  async delete(id: string): Promise<boolean> {
    const tenant = await this.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }

    await this.tenantRepository.remove(tenant);
    return true;
  }
}
