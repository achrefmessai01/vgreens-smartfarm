import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Stateless signed tokens for the HLS stream proxy.
 *
 * The token embeds everything the proxy needs (upstream folder, camera id,
 * expiry) so playlist/segment requests require no database access. The
 * payload is signed with HMAC-SHA256 using LIVESTREAM_STREAM_SECRET; the
 * folder value is server-controlled (resolved from tenant config at mint
 * time), never taken from client input.
 */
export interface StreamTokenPayload {
  /** Upstream HLS folder (e.g. tenant stream folder). */
  f: string;
  /** Camera id the token is valid for. */
  c: string;
  /** Expiry as unix epoch seconds. */
  e: number;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string): string | null {
  try {
    return Buffer.from(value, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}

function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('hex');
}

export function createStreamToken(
  payload: StreamTokenPayload,
  secret: string,
): string {
  const data = base64UrlEncode(JSON.stringify(payload));
  return `${data}.${sign(data, secret)}`;
}

export function verifyStreamToken(
  token: string,
  secret: string,
): StreamTokenPayload | null {
  if (!token || token.length > 2048) {
    return null;
  }

  const separatorIndex = token.lastIndexOf('.');
  if (separatorIndex <= 0) {
    return null;
  }

  const data = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expected = sign(data, secret);

  if (signature.length !== expected.length) {
    return null;
  }

  try {
    if (
      !timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expected, 'utf8'),
      )
    ) {
      return null;
    }
  } catch {
    return null;
  }

  const decoded = base64UrlDecode(data);
  if (!decoded) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(decoded);
  } catch {
    return null;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as Record<string, unknown>;
  if (
    typeof candidate.f !== 'string' ||
    typeof candidate.c !== 'string' ||
    typeof candidate.e !== 'number'
  ) {
    return null;
  }

  if (candidate.e * 1000 <= Date.now()) {
    return null;
  }

  return { f: candidate.f, c: candidate.c, e: candidate.e };
}
