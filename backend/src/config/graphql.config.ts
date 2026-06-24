import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import type { Request } from 'express';

/** Shape of the auth-bearing params the frontend sends over the WS handshake. */
type WsConnectionParams = Record<string, unknown> & {
  authorization?: string;
  Authorization?: string;
  token?: string;
};

/**
 * Normalise WS `connectionParams` into an `Authorization: Bearer <token>`
 * header value, so the existing HTTP ClerkAuthGuard can verify it unchanged.
 */
function authHeaderFromConnectionParams(
  params: WsConnectionParams = {},
): string {
  if (typeof params.authorization === 'string') return params.authorization;
  if (typeof params.Authorization === 'string') return params.Authorization;
  if (typeof params.token === 'string') return `Bearer ${params.token}`;
  return '';
}

/** Context arg: `{ req }` for HTTP, graphql-ws context for subscriptions. */
type GraphqlContextArg = {
  req?: Request;
  connectionParams?: WsConnectionParams;
  extra?: { connectionParams?: WsConnectionParams };
};

export const graphqlConfig: ApolloDriverConfig = {
  playground: false,
  debug: true,
  sortSchema: true,
  introspection: true,
  driver: ApolloDriver,
  autoSchemaFile: true,
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
  // VSL-97: enable GraphQL subscriptions over graphql-ws. Auth is REUSED from
  // the HTTP path — `onConnect` rejects token-less connections early, and the
  // `context` builder surfaces a minimal `req` carrying the Authorization
  // header so the existing ClerkAuthGuard / RolesGuard / @CurrentUser keep
  // working for subscriptions exactly as they do for queries/mutations.
  subscriptions: {
    'graphql-ws': {
      onConnect: (context: { connectionParams?: WsConnectionParams }) => {
        const auth = authHeaderFromConnectionParams(context.connectionParams);
        if (!auth) {
          throw new Error('Missing authentication token');
        }
        return true;
      },
    },
  },
  context: (ctx: GraphqlContextArg) => {
    // HTTP (queries/mutations): Express provides the real request.
    if (ctx?.req) {
      return { req: ctx.req };
    }
    // WebSocket (subscriptions): synthesise a request carrying only the auth
    // header so downstream guards behave identically to the HTTP flow.
    const connectionParams =
      ctx?.connectionParams ?? ctx?.extra?.connectionParams ?? {};
    return {
      req: {
        headers: {
          authorization: authHeaderFromConnectionParams(connectionParams),
        },
      },
    };
  },
  formatError(formattedError) {
    return {
      message: formattedError.message,
      code: formattedError.extensions?.code,
    };
  },
};
