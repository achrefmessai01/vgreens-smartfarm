import { SelectQueryBuilder } from 'typeorm';

export function applyTenantFilter<T>(
  queryBuilder: SelectQueryBuilder<T>,
  tenantId: string,
  alias: string = 'entity',
): SelectQueryBuilder<T> {
  return queryBuilder.andWhere(`${alias}.tenantId = :tenantId`, { tenantId });
}
