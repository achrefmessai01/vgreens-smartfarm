'use client';

import * as React from 'react';

import { Input } from '@/components/ui/input';

// Strip everything except digits and separators, keep the first separator only,
// and cap the fraction to `maxDecimals`. A second separator (e.g. "10.0.0",
// "10,0.0") has its digits folded into the fraction rather than starting a new
// one, so the extra separator is rejected without losing what was typed.
// Negative signs are dropped — yields are never negative.
export function sanitizeDecimal(raw: string, maxDecimals: number): string {
  const cleaned = raw.replace(/[^0-9.,]/g, '');
  const firstSep = cleaned.search(/[.,]/);
  if (firstSep === -1) return cleaned;
  const sepChar = cleaned[firstSep];
  const intPart = cleaned.slice(0, firstSep);
  const decPart = cleaned
    .slice(firstSep + 1)
    .replace(/[.,]/g, '')
    .slice(0, maxDecimals);
  return `${intPart}${sepChar}${decPart}`;
}

// Parse the in-progress string to a number for storage/GraphQL. Comma is
// normalized to a dot (the DB/number wants a dot) and blank/partial values
// ("", ".", "10.") collapse to 0 to match the form's "0 = empty" convention.
export function parseDecimal(text: string): number {
  if (text === '') return 0;
  const n = Number.parseFloat(text.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

// Mirror the form's convention where 0 renders as an empty field (placeholder).
function formatValue(value: number): string {
  return value === 0 ? '' : String(value);
}

export interface DecimalInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  'value' | 'onChange' | 'type'
> {
  value: number;
  onChange: (value: number) => void;
  // Max digits allowed after the separator (default 3).
  maxDecimals?: number;
}

// Numeric text input that preserves in-progress decimals while typing. Unlike a
// controlled number input, it holds the raw string in local state and only
// parses to a number on change/blur, so "10.", "10.0" and "9.09" don't collapse
// the moment their fractional digits are all zero. Accepts "." or "," as the
// separator and emits a dot-normalized number upward.
export function DecimalInput({
  value,
  onChange,
  maxDecimals = 3,
  onBlur,
  ...props
}: DecimalInputProps) {
  const [text, setText] = React.useState<string>(() => formatValue(value));

  // Re-sync the display only when the numeric value changes from the outside
  // (load, reset, add/remove class) — never while the user is mid-edit, since
  // then parseDecimal(text) already equals value and "10.0" must stay "10.0".
  // The effect re-runs on each keystroke too, but the guard makes those no-ops.
  React.useEffect(() => {
    if (parseDecimal(text) !== value) {
      setText(formatValue(value));
    }
  }, [value, text]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeDecimal(e.target.value, maxDecimals);
    setText(sanitized);
    onChange(parseDecimal(sanitized));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Drop a dangling separator on blur: "10." -> "10", "," -> "".
    const trimmed = text.replace(/[.,]$/, '');
    if (trimmed !== text) {
      setText(trimmed);
      onChange(parseDecimal(trimmed));
    }
    onBlur?.(e);
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}
