import type { Bay } from '@/lib/farm-types';
import { getParameterAliases } from '@/lib/parameter-status';

export function getAverageParameterValue(
  bay: Bay | null,
  parameter: string,
): number | null {
  if (!bay) return null;
  const aliases = getParameterAliases(parameter);
  const values: number[] = [];
  for (const row of bay.rows) {
    for (const column of row.columns) {
      for (const slot of column.slots) {
        for (const field of aliases) {
          const value = slot.values[field];
          if (typeof value === 'number' && Number.isFinite(value)) {
            values.push(value);
            break;
          }
        }
      }
    }
  }
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
