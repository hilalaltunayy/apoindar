import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Screen, Header, Card, Text, Icon } from "@/components";
import { useI18n } from "@/i18n";
import { haptic } from "@/lib/haptics";
import { color, space } from "@/theme";

export default function LanguageSettings() {
  const { t, locale, setLocale } = useI18n();

  const options: { value: "tr" | "en"; label: string }[] = [
    { value: "tr", label: t("settings.turkish") },
    { value: "en", label: t("settings.english") },
  ];

  return (
    <Screen>
      <Header showBack title={t("settings.languageTitle")} subtitle={t("settings.languageBody")} />
      <Card style={{ paddingVertical: space.xs }}>
        {options.map((o, i) => (
          <View key={o.value}>
            {i > 0 ? <View style={styles.sep} /> : null}
            <Pressable
              style={styles.row}
              accessibilityRole="radio"
              accessibilityState={{ selected: locale === o.value }}
              onPress={() => {
                haptic.select();
                void setLocale(o.value);
              }}
            >
              <Text style={{ flex: 1 }}>{o.label}</Text>
              {locale === o.value ? <Icon name="check" size={18} color={color.brand.purple700} /> : null}
            </Pressable>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: space.md, paddingHorizontal: space.sm },
  sep: { height: 1, backgroundColor: color.line.soft },
});
