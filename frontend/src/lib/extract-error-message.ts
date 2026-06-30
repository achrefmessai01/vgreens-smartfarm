/**
 * Pull a human-readable message out of an Apollo / mutation error.
 *
 * Apollo errors flatten the backend `{ message, code }` payload into both
 * `error.graphQLErrors[0].message` and `error.message`. Plain `Error` instances
 * (e.g. those we throw manually after inspecting `result.errors`) only have
 * `message`. Cover both shapes and fall back to a generic string so callers
 * always get something printable.
 */
export function extractErrorMessage(
  error: unknown,
  fallback = 'Something went wrong',
): string {
  const e = error as {
    graphQLErrors?: { message?: string }[];
    message?: string;
  };
  return e?.graphQLErrors?.[0]?.message || e?.message || fallback;
}
