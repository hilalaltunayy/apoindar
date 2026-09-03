import "react-native-gesture-handler";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import {
  useFonts,
  Fraunces_400Regular,
  Fraunces_600SemiBold,
} from "@expo-google-fonts/fraunces";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { I18nProvider } from "@/i18n";
import { AuthProvider } from "@/lib/auth";
import { color } from "@/theme";

void SplashScreen.preventAutoHideAsync();
void SystemUI.setBackgroundColorAsync(color.bg.cream);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) setReady(true);
  }, [fontsLoaded, fontError]);

  const onLayout = useCallback(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <SafeAreaProvider>
        <I18nProvider>
          <AuthProvider>
            <View style={{ flex: 1, backgroundColor: color.bg.cream }}>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: color.bg.cream },
                  animation: "fade",
                  animationDuration: 240,
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(student)" />
                <Stack.Screen name="(provider)" />
                <Stack.Screen name="auth/confirm" />
                <Stack.Screen name="auth/reset" />
                <Stack.Screen name="providers/[id]" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="book/[listingId]" options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="workspaces/[id]" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="favorites" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="packages" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="provider-onboarding" />
                <Stack.Screen name="edit-profile" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="settings/index" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="settings/security" options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="settings/language" options={{ animation: "slide_from_right" }} />
              </Stack>
            </View>
          </AuthProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
