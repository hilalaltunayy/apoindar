import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Logo, Button, Text, Reveal } from "@/components";
import { useI18n } from "@/i18n";
import { color, space, font } from "@/theme";

export default function Welcome() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <Screen motif="public" scroll={false} contentStyle={styles.wrap}>
      <View style={styles.hero}>
        <Reveal>
          <Logo size={34} />
        </Reveal>
        <Reveal delay={120}>
          <Text style={styles.headline}>{t("onboarding.slide1Title")}</Text>
        </Reveal>
        <Reveal delay={220}>
          <Text variant="bodyLg">{t("onboarding.slide1Body")}</Text>
        </Reveal>
      </View>

      <Reveal delay={320} style={styles.actions}>
        <Button label={t("onboarding.getStarted")} onPress={() => router.push("/(auth)/onboarding")} />
        <Button
          label={t("onboarding.haveAccount")}
          variant="ghost"
          onPress={() => router.push("/(auth)/login")}
        />
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "space-between", paddingBottom: space.xl },
  hero: { flex: 1, justifyContent: "center", gap: space.lg },
  headline: { fontFamily: font.serif, fontSize: 34, lineHeight: 40, color: color.ink.primary },
  actions: { gap: space.sm },
});
