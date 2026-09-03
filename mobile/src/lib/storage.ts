import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "apoindar.session.token";

/** Session token lives in the OS keychain/keystore (12 §23). */
export const tokenStore = {
  async get(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  async set(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch {
      /* non-fatal */
    }
  },
  async clear(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      /* non-fatal */
    }
  },
};

/** Non-sensitive per-device prefs. */
export const prefs = {
  async getBool(key: string, fallback = false): Promise<boolean> {
    try {
      const v = await AsyncStorage.getItem(key);
      return v == null ? fallback : v === "1";
    } catch {
      return fallback;
    }
  },
  async setBool(key: string, value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value ? "1" : "0");
    } catch {
      /* non-fatal */
    }
  },
  async getString(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setString(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      /* non-fatal */
    }
  },
};
