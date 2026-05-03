'use client';

import * as React from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { locales, type Locale } from './config';
import { useI18n } from './context';

/**
 * Talking to GraphQL via raw Apollo hooks (instead of the codegen'd
 * `useMeQuery` / `useSetMyLanguageMutation`) keeps this file compilable
 * even before `npm run codegen` re-runs against the new schema. Once
 * codegen is refreshed, these documents can be swapped 1-for-1 for the
 * generated hooks.
 */
const ME_LANGUAGE_QUERY = gql`
  query MeLanguage {
    me {
      id
      preferredLanguage
    }
  }
`;

const SET_MY_LANGUAGE = gql`
  mutation SetMyLanguageInline($language: String!) {
    setMyLanguage(language: $language) {
      id
      preferredLanguage
    }
  }
`;

interface MeLanguageResult {
  me: { id: string; preferredLanguage: string | null } | null;
}

interface SetMyLanguageVars {
  language: string;
}

function isSupportedLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && (locales as readonly string[]).includes(value)
  );
}

/**
 * Bridges the i18n context with the signed-in user's persisted language
 * preference. Mounted once near the top of the app.
 *
 * Behaviour:
 *   1. When `me.preferredLanguage` first loads and differs from the active
 *      locale, switch the UI to the saved value.
 *   2. When the user changes language via the switcher, fire
 *      `setMyLanguage` so the choice follows them across browsers /
 *      devices. Falls back silently to localStorage-only if the mutation
 *      fails (offline, unauthenticated, etc.).
 */
export function I18nUserSync() {
  const { locale, setLocale } = useI18n();
  const { data } = useQuery<MeLanguageResult>(ME_LANGUAGE_QUERY, {
    fetchPolicy: 'cache-first',
  });
  const [setMyLanguage] = useMutation<unknown, SetMyLanguageVars>(
    SET_MY_LANGUAGE,
  );

  const userId = data?.me?.id ?? null;
  const persistedLanguage = data?.me?.preferredLanguage ?? null;

  // 1. One-shot pull from `me` after login. We track the user id we've
  //    already synced for so a tab refresh doesn't keep overwriting the
  //    user's mid-session changes.
  const lastSyncedUserRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!userId) return;
    if (lastSyncedUserRef.current === userId) return;
    lastSyncedUserRef.current = userId;
    if (isSupportedLocale(persistedLanguage) && persistedLanguage !== locale) {
      setLocale(persistedLanguage);
    }
  }, [userId, persistedLanguage, locale, setLocale]);

  // 2. Push every locale change back to the server. Skip the very first
  //    render so we don't fire a write before we've read.
  const lastPushedRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!userId) return;
    if (lastPushedRef.current === locale) return;
    if (lastPushedRef.current === null) {
      // First effect run after sync — adopt without writing.
      lastPushedRef.current = locale;
      return;
    }
    lastPushedRef.current = locale;
    setMyLanguage({ variables: { language: locale } }).catch((error) => {
      console.warn('[i18n] setMyLanguage failed; keeping local choice', error);
    });
  }, [userId, locale, setMyLanguage]);

  return null;
}
