// Re-export Apollo links for use in Apollo Client setup
export { apolloErrorLink, apolloRequestLoggingLink } from '@/lib/apollo-error-handling';

/**
 * Initialize error monitoring on app startup.
 * Only global crash listeners are active — see error-enrichment.ts.
 * Apollo and fetch noise logging has been intentionally removed.
 */
export function initializeErrorMonitoring() {
  // Global crash listeners (window.error + unhandledrejection) are set up
  // automatically when ErrorLoggingService is instantiated as a singleton.
  // Nothing additional to initialize here.
  return () => {};
}
