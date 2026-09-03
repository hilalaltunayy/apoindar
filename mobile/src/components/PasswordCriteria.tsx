import React from "react";
import { View, StyleSheet, AccessibilityInfo } from "react-native";
import { PASSWORD_RULES, checkPassword } from "@shared/domain/password-policy";
import { color, space, font } from "@/theme";
import { Text } from "./Text";
import { useI18n } from "@/i18n";

/**
 * Live password-policy checklist (12 §4). Same rules as the server
 * (`@shared/domain/password-policy`) so UI and API never disagree.
 */
export function PasswordCriteria({ value }: { value: string }) {
  const { t } = useI18n();
  const { passed, ok } = checkPassword(value);

  React.useEffect(() => {
    if (ok && value.length > 0) {
      AccessibilityInfo.announceForAccessibility(t("password.label") + " ✓");
    }
  }, [ok, value.length, t]);

  return (
    <View
      style={styles.wrap}
      accessibilityLiveRegion="polite"
      accessible
      accessibilityLabel={`${t("password.label")}: ${PASSWORD_RULES.map(
        (r) => `${t(`password.${r.id}`)} ${passed.includes(r.id) ? "✓" : "✗"}`,
      ).join(", ")}`}
    >
      <Text variant="caption" style={styles.title}>
        {t("password.label")}
      </Text>
      <View style={styles.grid}>
        {PASSWORD_RULES.map((rule) => {
          const done = passed.includes(rule.id);
          return (
            <View key={rule.id} style={styles.item}>
              <Text
                style={{
                  fontFamily: font.sansSemibold,
                  fontSize: 12,
                  color: done ? color.state.success : color.ink.tertiary,
                }}
              >
                {done ? "✓" : "○"}
              </Text>
              <Text
                variant="caption"
                color={done ? color.ink.secondary : color.ink.tertiary}
                style={{ flexShrink: 1 }}
              >
                {t(`password.${rule.id}`)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: color.surface.muted,
    borderRadius: 12,
    padding: space.md,
    gap: space.xs,
  },
  title: { marginBottom: 2 },
  grid: { gap: 4 },
  item: { flexDirection: "row", alignItems: "center", gap: space.sm },
});
