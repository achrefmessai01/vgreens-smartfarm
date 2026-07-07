import type { Translations } from '@/i18n/translations';

/**
 * Minimal shape we need from a greenhouse row to validate sensor positions
 * against its physical footprint. The tenant greenhouses query already
 * exposes both dimensions, so callers can pass their query rows directly.
 */
export interface GreenhouseBounds {
  id: string;
  xDimension?: number | null;
  yDimension?: number | null;
}

export interface PositionBoundsResult {
  /** Localized error string for the x-position, or null when valid. */
  xError: string | null;
  /** Localized error string for the y-position, or null when valid. */
  yError: string | null;
  /** True when either coord failed validation — used to gate the Save button. */
  hasError: boolean;
}

/**
 * Compute inline bounds errors for the sensor-config position inputs. Blank
 * inputs are considered valid (the sensor falls back to its dynamic default),
 * so we only validate when the user has typed a value. Negative and
 * > dimension inputs surface separate localized messages so the reader knows
 * exactly which axis to fix.
 *
 * `greenhouseId` may be empty when the user hasn't picked a greenhouse yet.
 * In that case we still catch negatives, but we can't check the upper bound
 * — we return a prompt asking them to pick a greenhouse first so the input
 * doesn't silently accept a value we can't validate.
 *
 * The `greenhouses` parameter is intentionally typed with a generic
 * constraint so callers can pass GraphQL query rows directly without
 * mapping them into a narrower shape first.
 */
export function validatePositionBounds<G extends GreenhouseBounds>(
  xValue: string,
  yValue: string,
  greenhouseId: string,
  greenhouses: readonly G[],
  t: Translations,
): PositionBoundsResult {
  const sc = t.pages.admin.tenants.sensorConfig as Record<string, string>;
  const negMsg = sc.positionNegative ?? 'Position cannot be negative.';
  const noGreenhouseMsg =
    sc.selectGreenhouseForBounds ??
    'Select a greenhouse to validate position bounds.';
  const xTemplate =
    sc.xPositionOutOfBounds ??
    'Position must be between 0 and {value}m (greenhouse x-dimension).';
  const yTemplate =
    sc.yPositionOutOfBounds ??
    'Position must be between 0 and {value}m (greenhouse y-dimension).';

  const gh = greenhouses.find((g) => g.id === greenhouseId);
  const xMax = gh?.xDimension ?? null;
  const yMax = gh?.yDimension ?? null;

  return {
    xError: validateAxis(xValue, xMax, greenhouseId, {
      negMsg,
      noGreenhouseMsg,
      template: xTemplate,
    }),
    yError: validateAxis(yValue, yMax, greenhouseId, {
      negMsg,
      noGreenhouseMsg,
      template: yTemplate,
    }),
    get hasError() {
      return this.xError !== null || this.yError !== null;
    },
  };
}

function validateAxis(
  raw: string,
  max: number | null,
  greenhouseId: string,
  msgs: { negMsg: string; noGreenhouseMsg: string; template: string },
): string | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return null; // let the number input surface the parse error
  if (num < 0) return msgs.negMsg;
  if (!greenhouseId) return msgs.noGreenhouseMsg;
  if (max == null || max <= 0) return null;
  if (num > max) return msgs.template.replace('{value}', String(max));
  return null;
}
