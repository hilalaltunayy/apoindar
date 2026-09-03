import React from "react";
import { Redirect, Tabs } from "expo-router";
import { View } from "react-native";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { BrandLoader, Icon } from "@/components";
import { color, font } from "@/theme";

export default function ProviderLayout() {
  const { status, user } = useAuth();
  const { t } = useI18n();

  if (status === "loading") {
    return (
      <View style={{ flex: 1, backgroundColor: color.bg.cream, justifyContent: "center" }}>
        <BrandLoader />
      </View>
    );
  }
  if (status === "unauthenticated" || !user) return <Redirect href="/(auth)/welcome" />;
  if (user.role !== "PROVIDER") return <Redirect href="/(student)/home" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.brand.purple700,
        tabBarInactiveTintColor: color.ink.tertiary,
        tabBarStyle: {
          backgroundColor: color.surface.raised,
          borderTopColor: color.line.soft,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: font.sansMedium, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("tabs.dashboard"),
          tabBarIcon: ({ color: c, size }) => <Icon name="home" color={c} size={size} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t("tabs.calendar"),
          tabBarIcon: ({ color: c, size }) => <Icon name="calendar" color={c} size={size} />,
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: t("tabs.students"),
          tabBarIcon: ({ color: c, size }) => <Icon name="users" color={c} size={size} />,
        }}
      />
      <Tabs.Screen
        name="listings"
        options={{
          title: t("listings.title"),
          tabBarIcon: ({ color: c, size }) => <Icon name="list" color={c} size={size} />,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: t("earnings.title"),
          tabBarIcon: ({ color: c, size }) => <Icon name="wallet" color={c} size={size} />,
        }}
      />
      <Tabs.Screen name="premium" options={{ href: null }} />
      <Tabs.Screen name="more" options={{ href: null }} />
    </Tabs>
  );
}
