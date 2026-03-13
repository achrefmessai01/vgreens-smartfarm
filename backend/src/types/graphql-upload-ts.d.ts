declare module 'graphql-upload-ts' {
  import type { RequestHandler } from 'express';
  import type { GraphQLScalarType } from 'graphql';

  export interface FileUpload {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: () => NodeJS.ReadableStream;
  }

  export function graphqlUploadExpress(options?: {
    maxFileSize?: number;
    maxFiles?: number;
  }): RequestHandler;

  export const GraphQLUpload: GraphQLScalarType<
    FileUpload,
    Promise<FileUpload>
  >;
}
