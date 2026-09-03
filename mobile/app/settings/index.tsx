import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Header, Card, Text, Divider, Icon } from "@/components";
import { useI18n } from "@/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { color, space } from "@/theme";

export default function Settings() {
  const { t } = useI18n();
  const router = useRouter();
  const reduced = useReducedMotion();
  const [motionNote, setMotionNote] = useState("");

  useEffect(() => {
    setMotionNote(reduced ? "✓" : "");
  }, [reduced]);

  return (
    <Screen>
      <Header showBack title={t("settings.title")} />
      <Card style={{ paddingVertical: space.xs }}>
        <Pressable style={styles.row} onPress={() => router.push("/settings/language")}>
          <Icon name="globe" size={18} color={color.brand.purple700} />
          <Text style={{ flex: 1 }}>{t("settings.languageTitle")}</Text>
          <Icon name="chevron-right" size={16} color={color.ink.tertiary} />
        </Pressable>
        <Divider />
        <Pressable style={styles.row} onPress={() => router.push("/settings/security")}>
          <Icon name="lock" size={18} color={color.brand.purple700} />
          <Text style={{ flex: 1 }}>{t("security.title")}</Text>
          <Icon name="chevron-right" size={16} color={color.ink.tertiary} />
        </Pressable>
      </Card>

      <Card style={{ marginTop: space.lg }}>
        <Text variant="label">{t("settings.reducedMotion")}</Text>
        <Text variant="caption" style={{ marginTop: space.xs }}>
          {t("settings.reducedMotionBody")} {motionNote}
        </Text>
      </Card>

      <Card style={{ marginTop: space.lg }}>
        <Text variant="label">{t("settings.notificationsTitle")}</Text>
        <Text variant="caption" style={{ marginTop: space.xs }}>
          {t("settings.notificationsBody")}
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.md, paddingHorizontal: space.sm },
});
