import { registerEnumType } from '@nestjs/graphql';

export enum ReportStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS', 
  RESOLVED = 'RESOLVED',
}

registerEnumType(ReportStatus, {
  name: 'ReportStatus',
  description: 'Error report status levels',
});