import React, { useState } from "react";
import { View, Image, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Screen,
  Header,
  Text,
  Card,
  Badge,
  Button,
  Chip,
  Row,
  Divider,
  BrandLoader,
  ErrorState,
  Icon,
} from "@/components";
import { useI18n, useDateFormat } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries } from "@/lib/queries";
import { logSignal } from "@/lib/signals";
import { formatMoney } from "@/lib/money";
import { haptic } from "@/lib/haptics";
import { color, space, radius } from "@/theme";
import type { ProfileListing } from "@/lib/types";

export default function ProviderProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const df = useDateFormat();
  const router = useRouter();
  const [fav, setFav] = useState<boolean | null>(null);

  const state = useAsync(() => queries.provider(id), [id]);
  const p = state.data;
  const favorited = fav ?? p?.favorited ?? false;

  const toggleFav = async () => {
    haptic.light();
    setFav(!favorited);
    try {
      const r = await queries.toggleFavorite(id);
      setFav(r.favorited);
    } catch {
      setFav(favorited);
    }
  };

  if (state.loading) {
    return (
      <Screen scroll={false}>
        <Header showBack />
        <BrandLoader />
      </Screen>
    );
  }
  if (state.error || !p) {
    return (
      <Screen scroll={false}>
        <Header showBack />
        <ErrorState kind={state.error ?? "server"} onRetry={state.refetch} />
      </Screen>
    );
  }

  const mode =
    p.deliveryMode === "ONLINE"
      ? t("common.online")
      : p.deliveryMode === "IN_PERSON"
        ? t("common.inPerson")
        : t("common.both");

  return (
    <View style={{ flex: 1 }}>
    <Screen padded={false} footerSpace={80}>
      <View style={styles.hero}>
        {p.photoUrl ? (
          <Image source={{ uri: p.photoUrl }} style={styles.heroImg} accessibilityIgnoresInvertColors />
        ) : (
          <View style={[styles.heroImg, styles.heroFallback]} />
        )}
        <View style={styles.heroBar}>
          <Pressable onPress={() => router.back()} style={styles.circleBtn} accessibilityLabel={t("common.back")}>
            <Icon name="chevron-left" size={20} color={color.ink.primary} />
          </Pressable>
          <Pressable onPress={toggleFav} style={styles.circleBtn} accessibilityLabel={t("provider.favorite")}>
            <Icon name={favorited ? "heart-fill" : "heart"} size={18} color={color.state.danger} />
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        <Row style={{ gap: space.xs }}>
          {p.promoted ? <Badge label={t("common.promoted")} tone="info" /> : null}
          {p.plan === "PREMIUM" ? <Badge label={t("common.premium")} tone="premium" /> : null}
        </Row>
        <Text variant="display">{p.displayName}</Text>
        {p.headline ? <Text variant="bodyLg">{p.headline}</Text> : null}

        <Row gap={space.sm} style={{ flexWrap: "wrap", marginTop: space.sm }}>
          <Text variant="caption">{p.city ?? mode}</Text>
          {p.ratingAvg ? <Text variant="caption">· ★ {p.ratingAvg.toFixed(1)} ({p.ratingCount})</Text> : null}
          {p.yearsExperience ? (
            <Text variant="caption">· {t("provider.yearsTeaching", { years: p.yearsExperience })}</Text>
          ) : null}
        </Row>
        <Text variant="caption">{t("provider.lessonsBooked", { count: p.lessonsBooked })}</Text>

        {p.categories.length > 0 ? (
          <Row gap={space.xs} style={{ flexWrap: "wrap", marginTop: space.sm }}>
            {p.categories.map((c) => (
              <Chip key={c.slug} label={c.name} />
            ))}
          </Row>
        ) : null}

        {p.bio ? (
          <>
            <Divider />
            <Text variant="h2">{t("provider.about")}</Text>
            <Text variant="body" style={{ marginTop: space.xs }}>
              {p.bio}
            </Text>
          </>
        ) : null}

        <Divider />
        <Text variant="h2">{t("provider.lessonsAndPackages")}</Text>
        <View style={{ gap: space.md, marginTop: space.sm }}>
          {p.listings.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              onBook={() => {
                logSignal({ type: "PROFILE_OPEN", providerId: p.id });
                router.push(`/book/${l.id}`);
              }}
            />
          ))}
          {p.listings.length === 0 ? <Text variant="bodyMuted">{t("provider.noSlots")}</Text> : null}
        </View>

        {p.availability.length > 0 ? (
          <>
            <Divider />
            <Text variant="h2">{t("provider.availability")}</Text>
            <Row gap={space.xs} style={{ flexWrap: "wrap", marginTop: space.sm }}>
              {p.availability.slice(0, 8).map((s) => (
                <Chip key={s.id} label={df.short(new Date(s.startsAt))} tone="yellow" />
              ))}
            </Row>
          </>
        ) : null}
      </View>

    </Screen>
      <View style={styles.cta}>
        <Button
          label={p.listings[0]?.kind === "PACKAGE" ? t("provider.buyPackage") : t("provider.bookALesson")}
          onPress={() => p.listings[0] && router.push(`/book/${p.listings[0].id}`)}
          disabled={p.listings.length === 0}
        />
      </View>
    </View>
  );
}

function ListingCard({ listing, onBook }: { listing: ProfileListing; onBook: () => void }) {
  const { t } = useI18n();
  return (
    <Card>
      <Row style={{ justifyContent: "space-between" }}>
        <Text variant="label" style={{ flex: 1 }}>
          {listing.title}
        </Text>
        <Badge
          label={listing.kind === "PACKAGE" ? t("provider.packageLessons", { count: listing.lessonCount ?? 0 }) : t("provider.singleLesson")}
          tone="neutral"
        />
      </Row>
      {listing.description ? (
        <Text variant="caption" numberOfLines={2} style={{ marginTop: space.xs }}>
          {listing.description}
        </Text>
      ) : null}
      <Row style={{ justifyContent: "space-between", marginTop: space.md }}>
        <Text variant="label">{formatMoney(listing.priceAmount, listing.currency)}</Text>
        <Button label={t("provider.book")} size="sm" full={false} onPress={onBook} />
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { height: 240, backgroundColor: color.brand.lavender200 },
  heroImg: { width: "100%", height: "100%" },
  heroFallback: { backgroundColor: color.brand.lavender200 },
  heroBar: {
    position: "absolute",
    top: space.xl,
    left: space.lg,
    right: space.lg,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,253,248,0.94)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    marginTop: -20,
    backgroundColor: color.bg.cream,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: space.lg,
    gap: space.xs,
  },
  cta: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: space.lg,
    backgroundColor: color.surface.raised,
    borderTopWidth: 1,
    borderTopColor: color.line.soft,
  },
});
