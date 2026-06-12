/**
 * Resolves a backend-relative livestream path (e.g. `/livestream/...`)
 * against the backend origin derived from the GraphQL endpoint, so the
 * stream origin is never hard-coded in the frontend.
 */
export function resolveLivestreamUrl(
  relativeUrl?: string | null,
): string | null {
  if (!relativeUrl) {
    return null;
  }

  if (/^https?:\/\//.test(relativeUrl)) {
    return relativeUrl;
  }

  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
  if (!endpoint) {
    return null;
  }

  const base = endpoint.replace(/\/graphql\/?$/, '').replace(/\/+$/, '');
  return `${base}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
}
