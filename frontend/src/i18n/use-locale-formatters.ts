'use client';

import * as React from 'react';
import { intlTags } from './config';
import { useI18n } from './context';

/**
 * Locale-aware formatting helpers. Use these instead of hard-coding
 * `'en-US'` in `toLocaleDateString` / `toLocaleString` / `Intl.*` calls so
 * dates and numbers follow the user's chosen language.
 *
 * Each helper returns a stable, memoised function so consumers can hand them
 * to `useMemo` deps or pass them into child components without re-renders.
 */
export function useLocaleFormatters() {
  const { locale } = useI18n();
  const tag = intlTags[locale];

  const formatDate = React.useCallback(
    (
      input: Date | string | number | null | undefined,
      options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
    ) => {
      if (input == null) return '';
      const date = input instanceof Date ? input : new Date(input);
      if (Number.isNaN(date.getTime())) return '';
      return new Intl.DateTimeFormat(tag, options).format(date);
    },
    [tag],
  );

  const formatTime = React.useCallback(
    (
      input: Date | string | number | null | undefined,
      options: Intl.DateTimeFormatOptions = { timeStyle: 'short' },
    ) => formatDate(input, options),
    [formatDate],
  );

  const formatDateTime = React.useCallback(
    (
      input: Date | string | number | null | undefined,
      options: Intl.DateTimeFormatOptions = {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    ) => formatDate(input, options),
    [formatDate],
  );

  const formatNumber = React.useCallback(
    (
      value: number | null | undefined,
      options: Intl.NumberFormatOptions = {},
    ) => {
      if (value == null || Number.isNaN(value)) return '';
      return new Intl.NumberFormat(tag, options).format(value);
    },
    [tag],
  );

  const formatCurrency = React.useCallback(
    (value: number | null | undefined, currency: string = 'EUR') =>
      formatNumber(value, { style: 'currency', currency }),
    [formatNumber],
  );

  const formatRelativeTime = React.useCallback(
    (input: Date | string | number | null | undefined) => {
      if (input == null) return '';
      const date = input instanceof Date ? input : new Date(input);
      if (Number.isNaN(date.getTime())) return '';
      const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
      const rtf = new Intl.RelativeTimeFormat(tag, { numeric: 'auto' });
      const absSec = Math.abs(diffSeconds);
      if (absSec < 60) return rtf.format(diffSeconds, 'second');
      if (absSec < 3600)
        return rtf.format(Math.round(diffSeconds / 60), 'minute');
      if (absSec < 86400)
        return rtf.format(Math.round(diffSeconds / 3600), 'hour');
      if (absSec < 2_592_000)
        return rtf.format(Math.round(diffSeconds / 86400), 'day');
      if (absSec < 31_536_000)
        return rtf.format(Math.round(diffSeconds / 2_592_000), 'month');
      return rtf.format(Math.round(diffSeconds / 31_536_000), 'year');
    },
    [tag],
  );

  return {
    locale,
    tag,
    formatDate,
    formatTime,
    formatDateTime,
    formatNumber,
    formatCurrency,
    formatRelativeTime,
  };
}
