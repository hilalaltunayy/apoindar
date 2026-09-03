import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Header, Card, Text, Avatar, Button, Row, Divider, Icon, type IconName } from "@/components";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { APP_VERSION } from "@/lib/config";
import { color, space } from "@/theme";

export default function ProviderMore() {
  const { user, provider, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const rows: { icon: IconName; label: string; onPress: () => void }[] = [
    { icon: "user", label: t("onboardingProvider.title"), onPress: () => router.push("/provider-onboarding") },
    { icon: "sparkle", label: t("premium.title"), onPress: () => router.push("/(provider)/premium") },
    { icon: "lock", label: t("security.title"), onPress: () => router.push("/settings/security") },
    { icon: "globe", label: t("settings.languageTitle"), onPress: () => router.push("/settings/language") },
    { icon: "bell", label: t("settings.notificationsTitle"), onPress: () => router.push("/settings") },
  ];

  return (
    <Screen>
      <Header showBack title={t("profile.title")} />
      <Card>
        <Row gap={space.md}>
          <Avatar uri={provider?.photoUrl} name={user?.name} size={56} />
          <View style={{ flex: 1 }}>
            <Text variant="h2">{provider?.displayName ?? user?.name}</Text>
            <Text variant="caption">{user?.email}</Text>
          </View>
        </Row>
      </Card>

      <Card style={{ marginTop: space.lg, paddingVertical: space.xs }}>
        {rows.map((r, i) => (
          <View key={r.label}>
            {i > 0 ? <Divider /> : null}
            <Pressable style={styles.row} onPress={r.onPress} accessibilityRole="button">
              <Icon name={r.icon} size={18} color={color.brand.purple700} />
              <Text style={{ flex: 1 }}>{r.label}</Text>
              <Icon name="chevron-right" size={16} color={color.ink.tertiary} />
            </Pressable>
          </View>
        ))}
      </Card>

      <Button label={t("auth.logOut")} variant="ghost" onPress={() => logout()} style={{ marginTop: space.lg }} />
      <Text variant="caption" center style={{ marginTop: space.sm }}>
        {t("profile.version", { v: APP_VERSION })}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.md, paddingHorizontal: space.sm },
});
