import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTenantInput, UpdateTenantInput } from './dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InfluxDBService } from '@modules/influxdb/influxdb.service';
import { OrderDirection } from '@/common/enums/order-direction.enum';
import {
  composeTenantSettings,
  TenantSettings,
} from './entities/tenant-settings';
import { isAllowedSensorField } from './sensor-fields.constants';
import { DEFAULT_HIDDEN_HARVEST_DASHBOARD_ITEMS } from './dashboard-defaults.constants';
import { sanitizeAllowedDomains } from '@modules/users/utils/tenant-allowed-domains';

const DEFAULT_BUCKET_RETENTION_SECONDS = 60 * 60 * 24 * 30;

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly influxDBService: InfluxDBService,
  ) {}

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      relations: ['users'],
      order: { createdAt: OrderDirection.DESC },
    });
  }

  async findOne(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  /**
   * Expand-phase dual-write (VSL-279): patch one key of the consolidated
   * `settings` blob AND its deprecated flat column in the same save, keeping
   * the two representations byte-identical so the migration's down path stays
   * lossless. Patching on top of composeTenantSettings (blob-first) preserves
   * blob-only state — e.g. legacy ids normalized by the backfill — instead of
   * resurrecting stale flat-column values.
   */
  private applySetting<K extends keyof TenantSettings>(
    tenant: Tenant,
    key: K,
    value: TenantSettings[K],
  ): void {
    tenant.settings = { ...composeTenantSettings(tenant), [key]: value };
    tenant[key] = value;
  }

  async create(createTenantInput: CreateTenantInput): Promise<Tenant> {
    // Seed metrics that ship "off by default" into the hidden set.
    const hiddenHarvestDashboardItems = [
      ...DEFAULT_HIDDEN_HARVEST_DASHBOARD_ITEMS,
    ];
    const tenant = this.tenantRepository.create({
      ...createTenantInput,
      isActive: createTenantInput.isActive ?? true,
      hiddenHarvestDashboardItems,
      settings: composeTenantSettings({ hiddenHarvestDashboardItems }),
      // Drop empties + duplicates and normalize to bare lowercase so the column
      // never holds two equivalent rows ("@v-greens.com" vs "v-greens.com").
      allowedDomains: sanitizeAllowedDomains(
        createTenantInput.allowedDomains ?? [],
      ),
    });

    const savedTenant = await this.tenantRepository.save(tenant);

    const bucketName = this.buildBucketName(savedTenant);
    savedTenant.influxBucketName = bucketName;

    void this.influxDBService.createBucket(bucketName, {
      retentionSeconds: DEFAULT_BUCKET_RETENTION_SECONDS,
    });

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
    // Same normalization as create: only touch the column when the caller is
    // actually changing it (undefined = leave the existing list alone).
    if (updateTenantInput.allowedDomains !== undefined) {
      tenant.allowedDomains = sanitizeAllowedDomains(
        updateTenantInput.allowedDomains,
      );
    }
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

  async setDisabledSensorFields(id: string, fields: string[]): Promise<Tenant> {
    const unknown = fields.filter((f) => !isAllowedSensorField(f));
    if (unknown.length > 0) {
      throw new BadRequestException(
        `Unknown sensor field(s): ${unknown.join(', ')}`,
      );
    }
    const tenant = await this.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }
    this.applySetting(tenant, 'disabledSensorFields', [...new Set(fields)]);
    return this.tenantRepository.save(tenant);
  }

  async setHiddenHarvestDashboardItems(
    id: string,
    items: string[],
  ): Promise<Tenant> {
    const tenant = await this.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }
    this.applySetting(tenant, 'hiddenHarvestDashboardItems', [
      ...new Set(items),
    ]);
    return this.tenantRepository.save(tenant);
  }

  async setHarvestDashboardOrder(
    id: string,
    orderedIds: string[],
  ): Promise<Tenant> {
    const tenant = await this.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }
    // De-dupe while preserving first-seen order — the array is the ordering, so
    // a duplicated id would otherwise pin the item to its earlier slot.
    this.applySetting(tenant, 'harvestDashboardOrder', [...new Set(orderedIds)]);
    return this.tenantRepository.save(tenant);
  }

  private buildBucketName(
    tenant: Pick<Tenant, 'id' | 'companyName' | 'name'>,
  ): string {
    const rawName = tenant.companyName || tenant.name || 'tenant';

    const slug = rawName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    return `${slug}_${tenant.id}`;
  }
}
