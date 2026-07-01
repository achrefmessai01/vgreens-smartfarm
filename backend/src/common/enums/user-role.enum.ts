import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  TENANT_USER = 'TENANT_USER',
  TENANT_ADMIN = 'TENANT_ADMIN',
  VGREENS_ADMIN = 'VGREENS_ADMIN',
  // Internal read-only role. Sees everything a VGREENS_ADMIN sees (all tenants,
  // admin surfaces, tenant surfaces via the tenant picker) but every write
  // action is disabled at the UI and blocked at the resolver level. Exceptions:
  // may acknowledge alerts and trigger CSV exports.
  VGREENS_MEMBER = 'VGREENS_MEMBER',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role types',
});
