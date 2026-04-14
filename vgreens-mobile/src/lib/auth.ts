import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { type TokenCache } from '@clerk/clerk-expo';

const createTokenCache = (): TokenCache => {
  return {
    getToken: async (key: string) => {
      try {
        const item = await SecureStore.getItemAsync(key);
        if (item) {
          console.log(`[TokenCache] Retrieved key: ${key.substring(0, 10)}...`);
        }
        return item;
      } catch (error) {
        console.error('[TokenCache] getToken error:', error);
        await SecureStore.deleteItemAsync(key);
        return null;
      }
    },
    saveToken: async (key: string, token: string) => {
      try {
        await SecureStore.setItemAsync(key, token);
      } catch (error) {
        console.error('[TokenCache] saveToken error:', error);
      }
    },
    clearToken: async (key: string) => {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error('[TokenCache] clearToken error:', error);
      }
    },
  };
};

export const tokenCache = Platform.OS !== 'web' ? createTokenCache() : undefined;
