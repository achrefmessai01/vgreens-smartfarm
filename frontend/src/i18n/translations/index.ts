import { en } from './en';
import { de } from './de';
import type { Locale } from '../config';

export const translations = {
  en,
  de,
} as const;

export type Translations = (typeof translations)[Locale];

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}
