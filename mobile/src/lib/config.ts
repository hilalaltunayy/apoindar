import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * API base URL. On a device/emulator "localhost" is the device itself, so:
 * - Android emulator → 10.0.2.2
 * - iOS simulator → localhost works
 * - Real device → set EXPO_PUBLIC_API_URL to your machine's LAN IP or a tunnel
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const configured = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;
  const base = configured ?? "http://localhost:3000";

  if (base.includes("localhost") && Platform.OS === "android") {
    return base.replace("localhost", "10.0.2.2");
  }
  return base;
}

export const API_BASE_URL = resolveBaseUrl();
export const APP_VERSION = Constants.expoConfig?.version ?? "0.1.0";
