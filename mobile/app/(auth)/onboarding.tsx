import React, { useRef, useState } from "react";
import { View, ScrollView, Dimensions, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Button, Text, Card } from "@/components";
import { useI18n } from "@/i18n";
import { color, space, radius, font } from "@/theme";
import { haptic } from "@/lib/haptics";

const { width } = Dimensions.get("window");

export default function Onboarding() {
  const router = useRouter();
  const { t } = useI18n();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const slides = [
    { g: "🎓", title: t("onboarding.slide1Title"), body: t("onboarding.slide1Body") },
    { g: "🔒", title: t("onboarding.slide2Title"), body: t("onboarding.slide2Body") },
    { g: "🪄", title: t("onboarding.slide3Title"), body: t("onboarding.slide3Body") },
  ];

  const goRole = () => router.replace("/(auth)/signup");

  return (
    <Screen motif="public" scroll={false} contentStyle={{ flex: 1 }}>
      <View style={styles.top}>
        <Pressable onPress={goRole} hitSlop={10} accessibilityRole="button">
          <Text variant="label" color={color.brand.purple700}>
            {t("onboarding.skip")}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={{ flex: 1 }}
      >
        {slides.map((s) => (
          <View key={s.title} style={[styles.slide, { width: width - space.lg * 2 }]}>
            <View style={styles.glyph}>
              <Text style={{ fontSize: 44 }}>{s.g}</Text>
            </View>
            <Text style={styles.title}>{s.title}</Text>
            <Text variant="bodyLg" center>
              {s.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      {page === 2 ? (
        <Card style={styles.roleCard}>
          <Text variant="h2">{t("onboarding.roleTitle")}</Text>
          <RoleButton
            title={t("onboarding.roleStudent")}
            body={t("onboarding.roleStudentBody")}
            onPress={() => {
              haptic.select();
              router.replace({ pathname: "/(auth)/signup", params: { role: "STUDENT" } });
            }}
          />
          <RoleButton
            title={t("onboarding.roleTeacher")}
            body={t("onboarding.roleTeacherBody")}
            onPress={() => {
              haptic.select();
              router.replace({ pathname: "/(auth)/signup", params: { role: "PROVIDER" } });
            }}
          />
        </Card>
      ) : (
        <View style={styles.footer}>
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
            ))}
          </View>
          <Button
            label={t("common.continue")}
            onPress={() => scrollRef.current?.scrollTo({ x: width * (page + 1), animated: true })}
          />
        </View>
      )}
    </Screen>
  );
}

function RoleButton({ title, body, onPress }: { title: string; body: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.role} accessibilityRole="button">
      <View style={{ flex: 1 }}>
        <Text variant="label">{title}</Text>
        <Text variant="caption">{body}</Text>
      </View>
      <Text style={{ fontSize: 18, color: color.brand.purple600 }}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: "flex-end", paddingVertical: space.sm },
  slide: { alignItems: "center", justifyContent: "center", gap: space.md, paddingHorizontal: space.md },
  glyph: {
    width: 96,
    height: 96,
    borderRadius: radius.xl,
    backgroundColor: color.brand.lavender100,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: font.serif, fontSize: 26, color: color.ink.primary, textAlign: "center" },
  footer: { gap: space.md, paddingVertical: space.lg },
  dots: { flexDirection: "row", gap: 6, justifyContent: "center" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: color.line.lavender },
  dotActive: { backgroundColor: color.brand.purple600, width: 20 },
  roleCard: { gap: space.md, marginBottom: space.lg },
  role: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.line.lavender,
    backgroundColor: color.surface.raised,
  },
});
