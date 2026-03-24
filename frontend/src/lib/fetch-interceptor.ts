/**
 * Fetch interceptor — reserved for future use (e.g. auth token injection,
 * request tracing). DB error logging has been removed; network failures are
 * not app crashes and should not pollute the error reports table.
 */
export function createFetchInterceptor() {
  // No-op — returns cleanup function for API compatibility.
  return () => {};
}

export function createAdvancedFetchInterceptor(_maxRetries: number = 3) {
  // No-op — returns cleanup function for API compatibility.
  return () => {};
}
