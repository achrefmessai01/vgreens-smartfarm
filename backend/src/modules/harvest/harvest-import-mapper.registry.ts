/**
 * Harvest Import Mapper Registry
 *
 * Each mapper declares which tenant UUIDs it belongs to.
 * No env vars, no display name guessing — the UUID is the stable identifier.
 *
 * ─── Adding a new mapper ──────────────────────────────────────────────────────
 *
 *   1. Build the parser in scripts/harvest-import/mappers/<name>.ts
 *   2. Add an entry to MAPPER_REGISTRY below with the tenant UUID(s).
 *
 * Zero other code changes.
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

interface MapperDefinition {
  /** Tenant UUIDs that should use this mapper. */
  tenantIds: string[];
  parse: MapperFn;
}

// ── Registry ──────────────────────────────────────────────────────────────────
//
// To add a new mapper: add an entry here with the tenant UUID(s) and parser.

const MAPPER_REGISTRY: Record<HarvestImportMapperKey, MapperDefinition> = {
  knaup: {
    tenantIds: ['ed458942-f834-4f06-aa21-8d46b5ed8829'],
    parse: (filePath: string): KnaupParseResult => parseKnaupFile(filePath),
  },
  // frutania: {
  //   tenantIds: ['<frutania-tenant-uuid>'],
  //   parse: parseFrutaniaFile,
  // },
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns true if this tenant has a mapper configured.
 */
export function hasMapperForTenant(tenantId: string): boolean {
  return Object.values(MAPPER_REGISTRY).some((m) =>
    m.tenantIds.includes(tenantId),
  );
}

/**
 * Returns the parse function for a tenant, or null if none configured.
 */
export function getMapperForTenant(tenantId: string): MapperFn | null {
  for (const def of Object.values(MAPPER_REGISTRY)) {
    if (def.tenantIds.includes(tenantId)) return def.parse;
  }
  return null;
}
