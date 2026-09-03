import React, { useCallback } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  Header,
  Text,
  Card,
  Reveal,
  ProviderCard,
  SkeletonCard,
  Icon,
  Avatar,
} from "@/components";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries } from "@/lib/queries";
import { logSignal } from "@/lib/signals";
import { color, space, radius } from "@/theme";

const CATEGORY_ICONS: Record<string, string> = {
  academic: "📘",
  languages: "🗣️",
  sports: "🏅",
  music: "🎵",
  "art-design": "🎨",
  "exam-prep": "🎯",
};

export default function Home() {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const cats = useAsync(() => queries.categories(), []);
  const featured = useAsync(() => queries.search({ sort: "relevance", pageSize: 6 }), []);
  const bookings = useAsync(() => queries.myBookings(), []);

  const onRefresh = useCallback(() => {
    cats.refetch();
    featured.refetch();
    bookings.refetch();
  }, [cats, featured, bookings]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("home.greetingMorning") : hour < 18 ? t("home.greetingAfternoon") : t("home.greetingEvening");
  const firstName = user?.name?.split(" ")[0] ?? "";

  const upcoming = bookings.data?.bookings.find(
    (b) => b.status === "CONFIRMED" && b.scheduledAt && new Date(b.scheduledAt) > new Date(),
  );

  return (
    <Screen refreshing={featured.reloading} onRefresh={onRefresh} footerSpace={8}>
      <Header
        logo
        right={
          <Pressable onPress={() => router.push("/favorites")} hitSlop={10} accessibilityLabel={t("favorites.title")}>
            <Icon name="heart" color={color.brand.purple700} />
          </Pressable>
        }
      />

      <Reveal>
        <Text variant="display">{`${greeting}${firstName ? `, ${firstName}` : ""}`}</Text>
        <Text variant="bodyLg">{t("home.subtitle")}</Text>
      </Reveal>

      <Reveal delay={100} style={{ marginTop: space.lg }}>
        {upcoming ? (
          <Card onPress={() => router.push("/(student)/bookings")}>
            <View style={styles.rowBetween}>
              <Text variant="caption">{t("home.nextLesson")}</Text>
              <Icon name="chevron-right" size={16} color={color.ink.tertiary} />
            </View>
            <View style={styles.lessonRow}>
              <Avatar uri={upcoming.provider?.photoUrl} name={upcoming.provider?.displayName} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="label">{upcoming.listing.title}</Text>
                <Text variant="caption">
                  {upcoming.provider?.displayName} ·{" "}
                  {upcoming.scheduledAt
                    ? new Date(upcoming.scheduledAt).toLocaleString()
                    : t("booking.toArrange")}
                </Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card onPress={() => router.push("/(student)/search")}>
            <Text variant="label">{t("home.noUpcoming")}</Text>
            <Text variant="caption">{t("home.discover")}</Text>
          </Card>
        )}
      </Reveal>

      <Reveal delay={160} style={{ marginTop: space.xl }}>
        <Text variant="h2">{t("home.popularCategories")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.sm }}>
          <View style={styles.catRow}>
            {(cats.data?.categories ?? []).map((c) => (
              <Pressable
                key={c.slug}
                style={styles.cat}
                onPress={() => {
                  logSignal({ type: "CATEGORY_VIEW", categorySlug: c.slug });
                  router.push({ pathname: "/(student)/search", params: { category: c.slug } });
                }}
              >
                <Text style={{ fontSize: 22 }}>{CATEGORY_ICONS[c.slug] ?? "📚"}</Text>
                <Text variant="caption" center numberOfLines={1}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
            {cats.loading ? <SkeletonCard /> : null}
          </View>
        </ScrollView>
      </Reveal>

      <Reveal delay={220} style={{ marginTop: space.xl }}>
        <View style={styles.rowBetween}>
          <Text variant="h2">{t("home.featured")}</Text>
          <Pressable onPress={() => router.push("/(student)/search")}>
            <Text variant="label" color={color.brand.purple700}>
              {t("home.seeAll")}
            </Text>
          </Pressable>
        </View>
        {featured.loading ? (
          <View style={{ gap: space.md, marginTop: space.sm }}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.sm }}>
            <View style={{ flexDirection: "row", gap: space.md, paddingRight: space.lg }}>
              {(featured.data?.results ?? []).map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  feature
                  onPress={() => router.push(`/providers/${p.id}`)}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  lessonRow: { flexDirection: "row", alignItems: "center", gap: space.md, marginTop: space.sm },
  catRow: { flexDirection: "row", gap: space.sm, paddingRight: space.lg },
  cat: {
    width: 84,
    height: 84,
    borderRadius: radius.md,
    backgroundColor: color.surface.base,
    borderWidth: 1,
    borderColor: color.line.soft,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: space.xs,
  },
});
