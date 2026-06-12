import { Public } from '@common/decorators/public.decorator';
import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import * as http from 'http';
import * as https from 'https';
import {
  StreamTokenPayload,
  verifyStreamToken,
} from './camera-livestream-token';

const CAMERA_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const FILE_NAME_PATTERN =
  /^[A-Za-z0-9_-]{1,128}\.(m3u8|ts|m4s|mp4|m4a|aac|vtt)$/;
const FOLDER_PATTERN = /^[A-Za-z0-9_/-]{1,128}$/;
const UPSTREAM_TIMEOUT_MS = 15_000;
const MAX_PLAYLIST_BYTES = 1_000_000;

const CONTENT_TYPES: Record<string, string> = {
  m3u8: 'application/vnd.apple.mpegurl',
  ts: 'video/mp2t',
  m4s: 'video/mp4',
  mp4: 'video/mp4',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  vtt: 'text/vtt',
};

/**
 * Authenticated HLS proxy for camera live streams.
 *
 * Requests are authorized with stateless signed tokens minted by the
 * GraphQL `cameraLivestreamStreamUrl` query (Clerk-authenticated,
 * tenant-checked). The upstream origin is configured via the
 * LIVESTREAM_UPSTREAM_URL secret and is never exposed to clients.
 *
 * Routes are @Public for the global auth guards because the video element /
 * hls.js cannot send Authorization headers; the signed token in the query
 * string replaces them and is validated on every request.
 */
@Controller('livestream')
export class CameraLivestreamProxyController {
  private readonly logger = new Logger(CameraLivestreamProxyController.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Lightweight chain health for monitoring (gatus). Reports only ok /
   * degraded — no upstream details.
   */
  @Public()
  @Get('health')
  async health(@Res() res: Response): Promise<void> {
    const upstreamBase = this.getUpstreamBase();
    if (!upstreamBase) {
      res
        .status(HttpStatus.SERVICE_UNAVAILABLE)
        .json({ status: 'unconfigured' });
      return;
    }

    try {
      await this.probeUpstream(upstreamBase);
      res.status(HttpStatus.OK).json({ status: 'ok' });
    } catch {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({ status: 'degraded' });
    }
  }

  private probeUpstream(upstreamBase: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = upstreamBase.startsWith('https://') ? https : http;
      const request = client.get(upstreamBase, (upstreamRes) => {
        // Any HTTP response means the tunnel chain is up.
        upstreamRes.resume();
        resolve();
      });
      request.setTimeout(5_000, () => {
        request.destroy(new Error('Upstream timeout'));
      });
      request.on('error', reject);
    });
  }

  @Public()
  @Get(':cameraId/:fileName')
  async proxy(
    @Param('cameraId') cameraId: string,
    @Param('fileName') fileName: string,
    @Query('token') token: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    if (
      !CAMERA_ID_PATTERN.test(cameraId) ||
      !FILE_NAME_PATTERN.test(fileName)
    ) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid request' });
      return;
    }

    const payload = this.authorize(cameraId, token);
    if (!payload) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
      return;
    }

    const upstreamBase = this.getUpstreamBase();
    if (!upstreamBase || !FOLDER_PATTERN.test(payload.f)) {
      this.logger.warn(
        'LIVESTREAM_UPSTREAM_URL is not configured; cannot serve streams',
      );
      res
        .status(HttpStatus.SERVICE_UNAVAILABLE)
        .json({ message: 'Stream unavailable' });
      return;
    }

    const upstreamUrl = `${upstreamBase}/${payload.f}/${cameraId}/${fileName}`;

    if (fileName.endsWith('.m3u8')) {
      await this.servePlaylist(upstreamUrl, token, res);
      return;
    }

    this.serveSegment(upstreamUrl, fileName, res);
  }

  private authorize(
    cameraId: string,
    token: string | undefined,
  ): StreamTokenPayload | null {
    const secret = this.configService.get<string>('LIVESTREAM_STREAM_SECRET');
    if (!secret || !token) {
      return null;
    }

    const payload = verifyStreamToken(token, secret);
    if (!payload || payload.c !== cameraId) {
      return null;
    }

    return payload;
  }

  private getUpstreamBase(): string | null {
    const upstream = this.configService.get<string>('LIVESTREAM_UPSTREAM_URL');
    if (!upstream || !/^https?:\/\//.test(upstream)) {
      return null;
    }

    return upstream.replace(/\/+$/, '');
  }

  /**
   * Fetches the upstream playlist and rewrites every URI line so that
   * segment requests carry the same signed token. Relative URIs are kept
   * relative (they resolve against this proxy's URL); absolute URIs are
   * reduced to their file name so upstream hosts never leak to clients.
   */
  private async servePlaylist(
    upstreamUrl: string,
    token: string,
    res: Response,
  ): Promise<void> {
    let body: string;
    try {
      body = await this.fetchText(upstreamUrl);
    } catch (error) {
      this.logger.warn(
        `Failed to fetch upstream playlist: ${(error as Error).message}`,
      );
      res
        .status(HttpStatus.BAD_GATEWAY)
        .json({ message: 'Stream unavailable' });
      return;
    }

    const tokenSuffix = `token=${encodeURIComponent(token)}`;
    const rewritten = body
      .split('\n')
      .map((line) => this.rewritePlaylistLine(line, tokenSuffix))
      .join('\n');

    res
      .status(HttpStatus.OK)
      .setHeader('Content-Type', CONTENT_TYPES.m3u8)
      .setHeader('Cache-Control', 'no-store')
      .send(rewritten);
  }

  private rewritePlaylistLine(line: string, tokenSuffix: string): string {
    const trimmed = line.trim();
    if (!trimmed) {
      return line;
    }

    if (trimmed.startsWith('#')) {
      // Rewrite URI="..." attributes (e.g. #EXT-X-MAP for fMP4 init segments).
      return line.replace(/URI="([^"]+)"/, (_match, uri: string) => {
        const rewrittenUri = this.appendToken(
          this.toSafeRelativeUri(uri),
          tokenSuffix,
        );
        return `URI="${rewrittenUri}"`;
      });
    }

    return this.appendToken(this.toSafeRelativeUri(trimmed), tokenSuffix);
  }

  private toSafeRelativeUri(uri: string): string {
    // Reduce absolute or path-qualified URIs to their final file name so no
    // upstream host or path structure reaches the client.
    if (/^https?:\/\//.test(uri) || uri.includes('/')) {
      const fileName = uri.split('/').filter(Boolean).pop() ?? uri;
      return fileName;
    }

    return uri;
  }

  private appendToken(uri: string, tokenSuffix: string): string {
    const separator = uri.includes('?') ? '&' : '?';
    return `${uri}${separator}${tokenSuffix}`;
  }

  private fetchText(upstreamUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = upstreamUrl.startsWith('https://') ? https : http;
      const request = client.get(upstreamUrl, (upstreamRes) => {
        if (upstreamRes.statusCode !== 200) {
          upstreamRes.resume();
          reject(new Error(`Upstream status ${upstreamRes.statusCode}`));
          return;
        }

        let size = 0;
        const chunks: Buffer[] = [];
        upstreamRes.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_PLAYLIST_BYTES) {
            request.destroy();
            reject(new Error('Playlist too large'));
            return;
          }
          chunks.push(chunk);
        });
        upstreamRes.on('end', () =>
          resolve(Buffer.concat(chunks).toString('utf8')),
        );
        upstreamRes.on('error', reject);
      });

      request.setTimeout(UPSTREAM_TIMEOUT_MS, () => {
        request.destroy(new Error('Upstream timeout'));
      });
      request.on('error', reject);
    });
  }

  private serveSegment(
    upstreamUrl: string,
    fileName: string,
    res: Response,
  ): void {
    const extension = fileName.split('.').pop();
    const client = upstreamUrl.startsWith('https://') ? https : http;

    const request = client.get(upstreamUrl, (upstreamRes) => {
      if (upstreamRes.statusCode !== 200) {
        upstreamRes.resume();
        if (!res.headersSent) {
          res
            .status(HttpStatus.BAD_GATEWAY)
            .json({ message: 'Stream unavailable' });
        }
        return;
      }

      res
        .status(HttpStatus.OK)
        .setHeader(
          'Content-Type',
          CONTENT_TYPES[extension] ?? 'application/octet-stream',
        )
        .setHeader('Cache-Control', 'no-store');

      const contentLength = upstreamRes.headers['content-length'];
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      upstreamRes.pipe(res);
    });

    request.setTimeout(UPSTREAM_TIMEOUT_MS, () => {
      request.destroy(new Error('Upstream timeout'));
    });

    request.on('error', (error) => {
      this.logger.warn(`Upstream segment error: ${error.message}`);
      if (!res.headersSent) {
        res
          .status(HttpStatus.BAD_GATEWAY)
          .json({ message: 'Stream unavailable' });
      } else {
        res.destroy();
      }
    });

    res.on('close', () => {
      request.destroy();
    });
  }
}
