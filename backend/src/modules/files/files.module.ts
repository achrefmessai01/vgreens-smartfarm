import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLUpload } from 'graphql-upload-ts';
import { FilesResolver } from './files.resolver';
import { FilesService } from './files.service';

@Module({
  imports: [ConfigModule],
  providers: [
    FilesResolver,
    FilesService,
    {
      provide: 'GraphQLUpload',
      useValue: GraphQLUpload,
    },
  ],
  exports: [FilesService],
})
export class FilesModule {}
