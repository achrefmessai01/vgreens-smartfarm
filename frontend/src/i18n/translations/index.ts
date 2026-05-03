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
import type { Locale } from '../config';

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

export type Translations = (typeof translations)[Locale];

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}
