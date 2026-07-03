/**
 * Shared parsing utilities for the harvest import pipeline.
 */

/**
 * Parse German date format "DD.MM.YYYY" → "YYYY-MM-DD", or null if invalid.
 * Example: "12.05.2026" → "2026-05-12"
 */
export function parseGermanDate(s: unknown): string | null {
  const m = String(s ?? '').trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/**
 * Parse short date "DD.MM." with an explicit year → "YYYY-MM-DD", or null.
 * Also handles JS Date objects (from xlsx cellDates parsing).
 * Example: ("18.05.", 2026) → "2026-05-18"
 */
export function parseShortDate(v: unknown, year: number): string | null {
  if (v instanceof Date) {
    const iso = v.toISOString().split('T')[0];
    return iso;
  }
  const m = String(v ?? '').trim().match(/^(\d{1,2})\.(\d{1,2})\.?$/);
  if (!m) return null;
  const [, d, mo] = m;
  return `${year}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/**
 * Parse a German-formatted number string → float, or null if unparseable.
 * German format: period = thousands separator, comma = decimal.
 * Example: "1.199,500" → 1199.5
 * Also handles plain numbers passed as JS number.
 */
export function parseGermanNumber(v: unknown): number | null {
  if (typeof v === 'number') return isFinite(v) ? v : null;
  const s = String(v ?? '').trim();
  if (!s) return null;
  // Remove thousands separators (period), convert decimal comma to period
  const cleaned = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

/**
 * Strip a leading index number from a variety name.
 * Example: "1 Eves Delight 2" → "Eves Delight 2"
 */
export function stripLeadingIndex(name: string): string {
  return name.trim().replace(/^\d+\s+/, '').trim();
}
