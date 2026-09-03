import React from "react";
import { View, Image, Pressable, StyleSheet } from "react-native";
import { color, radius, space, font, shadow } from "@/theme";
import { Text } from "./Text";
import { Badge } from "./primitives";
import { formatMoney } from "@/lib/money";
import { useI18n } from "@/i18n";
import { haptic } from "@/lib/haptics";
import type { ProviderCard as ProviderCardData } from "@/lib/types";

interface Props {
  provider: ProviderCardData;
  onPress: () => void;
  onToggleFavorite?: () => void;
  /** Editorial layered treatment for the featured rail (07 §11). */
  feature?: boolean;
}

/**
 * Branded provider card (07 §11, 12 §2) — layered editorial treatment, never a
 * flat stock tile. Promoted cards carry a visible label (12 §9).
 */
export function ProviderCard({ provider, onPress, onToggleFavorite, feature = false }: Props) {
  const { t } = useI18n();
  const cats = provider.categories
    .slice(0, 2)
    .map((c) => c.name)
    .join(" · ");
  const mode =
    provider.deliveryMode === "ONLINE"
      ? t("common.online")
      : provider.deliveryMode === "IN_PERSON"
        ? t("common.inPerson")
        : t("common.both");
  const location = provider.city ? `${provider.city}` : mode;

  return (
    <Pressable
      onPress={() => {
        haptic.select();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${provider.displayName}, ${provider.headline ?? cats}`}
      style={[styles.card, feature && styles.feature]}
    >
      <View style={styles.photoWrap}>
        {provider.photoUrl ? (
          <Image source={{ uri: provider.photoUrl }} style={styles.photo} accessibilityIgnoresInvertColors />
        ) : (
          <View style={[styles.photo, styles.photoFallback]}>
            <Text style={{ fontFamily: font.serif, fontSize: 28, color: color.brand.purple600 }}>
              {provider.displayName.slice(0, 1)}
            </Text>
          </View>
        )}
        <View style={styles.photoTint} />
        <View style={styles.badgeRow}>
          {provider.promoted ? <Badge label={t("common.promoted")} tone="info" /> : null}
          {provider.plan === "PREMIUM" ? <Badge label={t("common.premium")} tone="premium" /> : null}
        </View>
        {onToggleFavorite ? (
          <Pressable
            onPress={() => {
              haptic.light();
              onToggleFavorite();
            }}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={provider.favorited ? t("provider.favorited") : t("provider.favorite")}
            style={styles.heart}
          >
            <Text style={{ fontSize: 16 }}>{provider.favorited ? "♥" : "♡"}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text variant="h2" numberOfLines={1}>
          {provider.displayName}
        </Text>
        {provider.headline ? (
          <Text variant="bodyMuted" numberOfLines={2}>
            {provider.headline}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text variant="caption">{cats || location}</Text>
          <Text variant="caption">·</Text>
          <Text variant="caption">{location}</Text>
          {provider.ratingAvg ? (
            <>
              <Text variant="caption">·</Text>
              <Text variant="caption">★ {provider.ratingAvg.toFixed(1)}</Text>
            </>
          ) : null}
        </View>
        {provider.startingPrice != null ? (
          <Text variant="label" style={{ marginTop: space.xs }}>
            {t("common.from")} {formatMoney(provider.startingPrice, provider.currency)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line.soft,
    overflow: "hidden",
    ...shadow.soft,
  },
  feature: { width: 260, ...shadow.raised },
  photoWrap: { height: 150, backgroundColor: color.brand.lavender200 },
  photo: { width: "100%", height: "100%" },
  photoFallback: { alignItems: "center", justifyContent: "center", backgroundColor: color.brand.lavender100 },
  photoTint: {
    ...StyleSheet.absoluteFillObject,
    borderBottomWidth: 3,
    borderBottomColor: color.brand.yellow400,
  },
  badgeRow: { position: "absolute", top: space.sm, left: space.sm, flexDirection: "row", gap: space.xs },
  heart: {
    position: "absolute",
    top: space.sm,
    right: space.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,253,248,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: space.lg, gap: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: space.xs, flexWrap: "wrap", marginTop: space.xs },
});
