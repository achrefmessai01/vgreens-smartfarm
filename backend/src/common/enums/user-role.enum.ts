import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  TENANT_USER = 'TENANT_USER',
  TENANT_ADMIN = 'TENANT_ADMIN',
  VGREENS_ADMIN = 'VGREENS_ADMIN',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role types',
});
