import { registerEnumType } from '@nestjs/graphql';

export enum ErrorSource {
  FRONTEND = 'FRONTEND',
  BACKEND = 'BACKEND',
  DATABASE = 'DATABASE',
  EXTERNAL_API = 'EXTERNAL_API',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
}

registerEnumType(ErrorSource, {
  name: 'ErrorSource',
  description: 'Source of the error - where it originated',
});