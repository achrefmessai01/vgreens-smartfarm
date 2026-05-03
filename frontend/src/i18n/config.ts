/**
 * Supported locales.
 *
 * Each locale entry below maps to a translation file under
 * `src/i18n/translations/{locale}.ts` and a flag emoji in `flag-icon.tsx`.
 *
 * NOTE on translation status (Apr 2026):
 *  - `en` / `de` — fully translated.
 *  - `pl` / `es` / `ro` / `it` / `tr` / `ar` / `fr` / `el` / `pt` — scaffolded
 *    as English fallbacks so the app stays usable while translators fill in
 *    the dictionaries. See each locale file's header.
 */
export const locales = [
  'en',
  'de',
  'fr',
  'es',
  'it',
  'pt',
  'pl',
  'ro',
  'tr',
  'el',
  'ar',
] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** English-language label for the locale (used in admin / debug surfaces). */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
  pl: 'Polish',
  ro: 'Romanian',
  tr: 'Turkish',
  el: 'Greek',
  ar: 'Arabic',
};

/** Native label (rendered in the language switcher). */
export const localeNativeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  pt: 'Português',
  pl: 'Polski',
  ro: 'Română',
  tr: 'Türkçe',
  el: 'Ελληνικά',
  ar: 'العربية',
};

/** Locales that render right-to-left. */
export const rtlLocales: ReadonlySet<Locale> = new Set<Locale>(['ar']);

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.has(locale);
}

/** BCP 47 tag passed to `Intl.*` APIs. Falls back to the locale itself. */
export const intlTags: Record<Locale, string> = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT',
  pt: 'pt-PT',
  pl: 'pl-PL',
  ro: 'ro-RO',
  tr: 'tr-TR',
  el: 'el-GR',
  ar: 'ar', // ar-EG / ar-SA differ on numerals; keep neutral.
};
