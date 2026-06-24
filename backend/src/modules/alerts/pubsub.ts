import { PubSub } from 'graphql-subscriptions';

/** Topic the alert-created subscription listens on (VSL-97). */
export const ALERT_CREATED_EVENT = 'ALERT_CREATED';

/** Nest DI token for the shared GraphQL PubSub instance. */
export const PUB_SUB = 'PUB_SUB';

/**
 * In-memory PubSub provider (graphql-subscriptions).
 *
 * Single-process only — fine for the current single-instance backend. If the
 * backend is ever scaled to multiple instances, an event published on one
 * instance won't reach subscribers connected to another; swap `useValue` for a
 * Redis-backed PubSub (e.g. graphql-redis-subscriptions) to fan out across
 * instances. See VSL-97 notes.
 */
export const pubSubProvider = {
  provide: PUB_SUB,
  useValue: new PubSub(),
};
