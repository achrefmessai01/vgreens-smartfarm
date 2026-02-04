import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

export const graphqlConfig: ApolloDriverConfig = {
  playground: false,
  debug: true,
  sortSchema: true,
  introspection: true,
  driver: ApolloDriver,
  context: ({ req }: { req: Request }) => ({ req }),
  autoSchemaFile: true,
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
  formatError(formattedError) {
    return {
      message: formattedError.message,
      code: formattedError.extensions?.code,
    };
  },
};
