export const HOUR_TICKS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

export function formatHourTick(value: number): string {
  const normalized = Math.max(0, Math.min(24, Math.round(value)));
  const hourLabel = normalized.toString().padStart(2, '0');
  return `${hourLabel}:00`;
}

export function formatTooltipHourLabel(value: number | string): string {
  const numericValue =
    typeof value === 'number' ? value : Number.parseFloat(String(value));
  if (Number.isNaN(numericValue)) return String(value);
  return `${formatHourTick(numericValue)} h`;
}

export function formatTooltipValue(value: number | null): string {
  if (value == null || Number.isNaN(value)) return '--';
  return value.toFixed(1);
}

export function getHourOfDay(date: Date): number {
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}
