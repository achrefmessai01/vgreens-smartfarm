export type TimeGate = 'Any' | 'Day' | 'Night' | { start: string; end: string };

const DEFAULT_TZ = 'UTC';

function getLocalMinutesInTz(tz: string): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const hour = parseInt(
      parts.find((p) => p.type === 'hour')?.value ?? '0',
      10,
    );
    const minute = parseInt(
      parts.find((p) => p.type === 'minute')?.value ?? '0',
      10,
    );
    return hour * 60 + minute;
  } catch {
    const d = new Date();
    return d.getUTCHours() * 60 + d.getUTCMinutes();
  }
}

export function isInTimeGate(
  gate: TimeGate,
  tenantTimezone: string | undefined | null,
): boolean {
  if (gate === 'Any') return true;
  const tz = tenantTimezone ?? DEFAULT_TZ;
  const currentMinutes = getLocalMinutesInTz(tz);

  if (gate === 'Day') {
    return currentMinutes >= 6 * 60 && currentMinutes < 18 * 60;
  }
  if (gate === 'Night') {
    return currentMinutes >= 18 * 60 || currentMinutes < 6 * 60;
  }
  const [startH, startM] = gate.start.split(':').map(Number);
  const [endH, endM] = gate.end.split(':').map(Number);
  const startMinutes = startH * 60 + (startM || 0);
  let endMinutes = endH * 60 + (endM || 0);
  if (endMinutes <= startMinutes) endMinutes += 24 * 60;
  let curr = currentMinutes;
  if (curr < startMinutes) curr += 24 * 60;
  return curr >= startMinutes && curr < endMinutes;
}
