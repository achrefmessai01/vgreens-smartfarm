import * as path from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

export const graphqlConfig: ApolloDriverConfig = {
  playground: false,
  debug: true,
  sortSchema: true,
  introspection: true,
  driver: ApolloDriver,
  context: ({ req }: { req: Request }) => ({ req }),
  autoSchemaFile:
    process.env.NODE_ENV === 'production'
      ? path.join('/app', 'dist', 'graphql.schema.gql')
      : path.join(process.cwd(), 'src', 'graphql.schema.gql'),
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
  formatError(formattedError) {
    return {
      message: formattedError.message,
      code: formattedError.extensions?.code,
    };
  },
};
