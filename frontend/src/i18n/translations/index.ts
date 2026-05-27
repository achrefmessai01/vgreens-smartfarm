import { en } from './en';
import { de } from './de';
import { fr } from './fr';
import { es } from './es';
import { it } from './it';
import { pt } from './pt';
import { pl } from './pl';
import { ro } from './ro';
import { tr } from './tr';
import { el } from './el';
import { ar } from './ar';
import { defaultLocale, type Locale } from '../config';

export const translations = {
  en,
  de,
  fr,
  es,
  it,
  pt,
  pl,
  ro,
  tr,
  el,
  ar,
} as const;

export type Translations = (typeof translations)['en'];

/**
 * Deep-merge `override` on top of `base`. Any key missing in `override`
 * (or set to `null`/`undefined`) falls through to `base`. Used so that a
 * partially-translated locale still resolves every key — unset keys
 * render the English string instead of `undefined`.
 */
function deepFallback<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base;
  if (
    typeof base !== 'object' ||
    base === null ||
    Array.isArray(base) ||
    typeof override !== 'object' ||
    Array.isArray(override)
  ) {
    return (override as T) ?? base;
  }
  const merged: Record<string, unknown> = {
    ...(base as Record<string, unknown>),
  };
  for (const key of Object.keys(override as Record<string, unknown>)) {
    merged[key] = deepFallback(
      (base as Record<string, unknown>)[key],
      (override as Record<string, unknown>)[key],
    );
  }
  return merged as T;
}

const mergedCache = new Map<Locale, Translations>();

export function getTranslations(locale: Locale): Translations {
  if (locale === defaultLocale) return translations.en;
  const cached = mergedCache.get(locale);
  if (cached) return cached;
  const merged = deepFallback(
    translations.en,
    translations[locale],
  ) as Translations;
  mergedCache.set(locale, merged);
  return merged;
}
