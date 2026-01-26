import { registerEnumType } from '@nestjs/graphql';

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'User invitation and activation status',
});
