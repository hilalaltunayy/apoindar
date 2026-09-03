import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  Header,
  Card,
  Text,
  Avatar,
  Button,
  Row,
  Divider,
  Icon,
  type IconName,
} from "@/components";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { queries } from "@/lib/queries";
import { APP_VERSION } from "@/lib/config";
import { color, space } from "@/theme";

export default function Profile() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [resent, setResent] = useState(false);

  const rows: { icon: IconName; label: string; onPress: () => void }[] = [
    { icon: "heart", label: t("profile.favorites"), onPress: () => router.push("/favorites") },
    { icon: "book", label: t("profile.packages"), onPress: () => router.push("/packages") },
    { icon: "sparkle", label: t("profile.teachOnApoindar"), onPress: () => router.push("/provider-onboarding") },
    { icon: "user", label: t("profile.editProfile"), onPress: () => router.push("/edit-profile") },
    { icon: "lock", label: t("profile.security"), onPress: () => router.push("/settings/security") },
    { icon: "globe", label: t("profile.language"), onPress: () => router.push("/settings/language") },
    { icon: "gear", label: t("profile.settings"), onPress: () => router.push("/settings") },
  ];

  return (
    <Screen>
      <Header title={t("profile.title")} />

      <Card>
        <Row gap={space.md}>
          <Avatar name={user?.name} size={56} />
          <View style={{ flex: 1 }}>
            <Text variant="h2">{user?.name}</Text>
            <Text variant="caption">{user?.email}</Text>
          </View>
        </Row>
      </Card>

      {user && !user.emailVerified ? (
        <Card style={styles.verify}>
          <Text variant="label">{t("auth.verifyBannerTitle")}</Text>
          <Text variant="caption">{resent ? t("auth.verifySent") : t("auth.verifyBannerBody")}</Text>
          {!resent ? (
            <Button
              label={t("auth.verifyResend")}
              size="sm"
              variant="secondary"
              full={false}
              onPress={async () => {
                try {
                  await queries.resendVerification();
                } finally {
                  setResent(true);
                }
              }}
              style={{ marginTop: space.sm }}
            />
          ) : null}
        </Card>
      ) : null}

      <Card style={{ marginTop: space.lg, paddingVertical: space.xs }}>
        {rows.map((r, i) => (
          <View key={r.label}>
            {i > 0 ? <Divider /> : null}
            <Pressable style={styles.row} onPress={r.onPress} accessibilityRole="button">
              <Icon name={r.icon} size={18} color={color.brand.purple700} />
              <Text variant="body" style={{ flex: 1 }}>
                {r.label}
              </Text>
              <Icon name="chevron-right" size={16} color={color.ink.tertiary} />
            </Pressable>
          </View>
        ))}
      </Card>

      <Button
        label={t("auth.logOut")}
        variant="ghost"
        onPress={() => logout()}
        style={{ marginTop: space.lg }}
      />
      <Text variant="caption" center style={{ marginTop: space.sm }}>
        {t("profile.version", { v: APP_VERSION })}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  verify: { marginTop: space.md, backgroundColor: color.brand.yellow100, borderColor: color.brand.yellow200 },
  row: { flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.md, paddingHorizontal: space.sm },
});
