import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { View, useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';

const STORAGE_KEY = 'vgreens-theme-preference';

export type ThemePreference = 'light' | 'dark' | 'system';

type Ctx = {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => Promise<void>;
  resolvedScheme: 'light' | 'dark';
  hydrated: boolean;
};

const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useRNColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && (raw === 'light' || raw === 'dark' || raw === 'system')) {
          setPreferenceState(raw);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback(async (p: ThemePreference) => {
    setPreferenceState(p);
    await AsyncStorage.setItem(STORAGE_KEY, p);
  }, []);

  const resolvedScheme: 'light' | 'dark' =
    preference === 'system'
      ? system === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  const value = useMemo(
    () => ({ preference, setPreference, resolvedScheme, hydrated }),
    [preference, setPreference, resolvedScheme, hydrated],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  const colors = Colors[ctx.resolvedScheme];
  return { ...ctx, colors };
}

/** Safe fallback when used before hydration (returns system). */
export function useResolvedColorScheme(): 'light' | 'dark' {
  const ctx = useContext(ThemeContext);
  const system = useRNColorScheme();
  if (!ctx?.hydrated) {
    return system === 'dark' ? 'dark' : 'light';
  }
  return ctx.resolvedScheme;
}

export function ThemedRoot({ children }: { children: ReactNode }) {
  const { resolvedScheme } = useAppTheme();
  return (
    <View
      className={`flex-1 ${resolvedScheme === 'dark' ? 'dark' : ''}`}
      style={{ flex: 1 }}
    >
      {children}
    </View>
  );
}
