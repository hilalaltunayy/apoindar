import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/lib/auth";
import { BrandLoader } from "@/components";
import { View } from "react-native";
import { color } from "@/theme";

export default function AuthLayout() {
  const { status, user } = useAuth();

  if (status === "loading") {
    return (
      <View style={{ flex: 1, backgroundColor: color.bg.cream, justifyContent: "center" }}>
        <BrandLoader />
      </View>
    );
  }

  if (status === "authenticated" && user) {
    return <Redirect href={user.role === "PROVIDER" ? "/(provider)/dashboard" : "/(student)/home"} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg.cream } }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="signup" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="forgot-password" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}
