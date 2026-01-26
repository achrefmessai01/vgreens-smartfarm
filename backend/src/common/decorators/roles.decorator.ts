import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => {
  console.log('Roles decorator called with roles:', roles);
  return SetMetadata(ROLES_KEY, roles);
};
