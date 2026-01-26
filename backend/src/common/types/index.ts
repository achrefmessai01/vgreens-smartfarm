export interface TenantContext {
  role: string;
  userId: string;
  tenantId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  total: number;
  limit: number;
}
