/**
 * Harvest Import Mapper Registry
 *
 * Mapper-to-tenant mapping is configured via the HARVEST_IMPORT_MAPPERS env var.
 * No UUIDs hardcoded in source — changes only require a .env update and restart.
 *
 * ─── Setup ────────────────────────────────────────────────────────────────────
 *
 * Add to your .env:
 *
 *   HARVEST_IMPORT_MAPPERS=<tenant-uuid>:knaup
 *
 * Multiple tenants (comma-separated):
 *
 *   HARVEST_IMPORT_MAPPERS=<uuid1>:knaup,<uuid2>:frutania
 *
 * ─── Adding a new mapper ──────────────────────────────────────────────────────
 *
 *   1. Build the parser in scripts/harvest-import/mappers/<name>.ts
 *   2. Add '<name>' to HarvestImportMapperKey below
 *   3. Add the parser function to MAPPER_FNS
 *   4. Add the tenant UUID entry to HARVEST_IMPORT_MAPPERS in .env
 *
 * Zero other code changes needed.
 */

import {
  parseKnaupFile,
  type KnaupParseResult,
} from '../../../scripts/harvest-import/mappers/knaup';
import type { ParsedRow, RowIssue } from '../../../scripts/harvest-import/types';

// ── Types ─────────────────────────────────────────────────────────────────────

export type HarvestImportMapperKey = 'knaup';
// Extend when new mappers are ready: 'knaup' | 'frutania'

export interface MapperResult {
  rows: ParsedRow[];
  issues: RowIssue[];
}

export type MapperFn = (filePath: string) => MapperResult;

// ── Parser functions ──────────────────────────────────────────────────────────

const MAPPER_FNS: Record<HarvestImportMapperKey, MapperFn> = {
  knaup: (filePath: string): KnaupParseResult => parseKnaupFile(filePath),
  // frutania: parseFrutaniaFile,
};

// ── Registry (lazy — built on first access so dotenv has time to load) ────────

let _registry: Record<string, HarvestImportMapperKey> | null = null;

function getRegistry(): Record<string, HarvestImportMapperKey> {
  if (_registry !== null) return _registry;

  const raw = process.env.HARVEST_IMPORT_MAPPERS ?? '';
  const result: Record<string, HarvestImportMapperKey> = {};

  for (const entry of raw.split(',')) {
    const trimmed = entry.trim();
    if (!trimmed) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx < 0) continue;

    const tenantId = trimmed.slice(0, colonIdx).trim();
    const mapperKey = trimmed.slice(colonIdx + 1).trim();

    if (tenantId && mapperKey && isValidMapperKey(mapperKey)) {
      result[tenantId] = mapperKey;
    }
  }

  _registry = result;
  return _registry;
}

function isValidMapperKey(key: string): key is HarvestImportMapperKey {
  return Object.prototype.hasOwnProperty.call(MAPPER_FNS, key);
}

// ── Public API ────────────────────────────────────────────────────────────────

export function hasMapperForTenant(tenantId: string): boolean {
  return tenantId in getRegistry();
}

export function getMapperForTenant(tenantId: string): MapperFn | null {
  const key = getRegistry()[tenantId];
  return key ? MAPPER_FNS[key] : null;
}
