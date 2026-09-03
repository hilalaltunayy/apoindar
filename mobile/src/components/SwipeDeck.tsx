import React, { useCallback, useState } from "react";
import { View, StyleSheet, Dimensions, Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { color, radius, space, font, shadow } from "@/theme";
import { Text } from "./Text";
import { haptic } from "@/lib/haptics";
import { useI18n } from "@/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";

const { width: SCREEN_W } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_W * 0.28;

export interface SwipeDeckHandlers<T> {
  /** Swipe LEFT — the user is interested; open the additional-info path (12 §7). */
  onInterested: (item: T) => void;
  /** Swipe RIGHT — skip to the next card (12 §7). Directions must not be reversed. */
  onSkip: (item: T) => void;
  onExhausted?: () => void;
}

interface Props<T> extends SwipeDeckHandlers<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
}

/**
 * Card deck with the Apoindar swipe grammar (12 §7):
 *   • swipe LEFT  → interested / open more info
 *   • swipe RIGHT → skip / next
 * Tappable equivalents are always shown below the deck.
 */
export function SwipeDeck<T>({
  data,
  keyExtractor,
  renderCard,
  onInterested,
  onSkip,
  onExhausted,
}: Props<T>) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const current = data[index];
  const next = data[index + 1];

  const advance = useCallback(
    (dir: "left" | "right") => {
      const item = data[index];
      if (item) {
        if (dir === "left") onInterested(item);
        else onSkip(item);
      }
      translateX.value = 0;
      translateY.value = 0;
      setIndex((i) => {
        const ni = i + 1;
        if (ni >= data.length) onExhausted?.();
        return ni;
      });
    },
    [data, index, onInterested, onSkip, onExhausted, translateX, translateY],
  );

  const fling = useCallback(
    (dir: "left" | "right") => {
      haptic.light();
      if (reduced) {
        advance(dir);
        return;
      }
      translateX.value = withTiming(
        dir === "left" ? -SCREEN_W * 1.3 : SCREEN_W * 1.3,
        { duration: 240 },
        (done) => {
          if (done) runOnJS(advance)(dir);
        },
      );
    },
    [advance, reduced, translateX],
  );

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.25;
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        runOnJS(fling)("left");
      } else if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(fling)("right");
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-SCREEN_W, 0, SCREEN_W],
          [-9, 0, 9],
          Extrapolation.CLAMP,
        )}deg`,
      },
    ],
  }));

  const interestedBadge = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));
  const skipBadge = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));
  const nextScale = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          Math.abs(translateX.value),
          [0, SCREEN_W],
          [0.94, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(Math.abs(translateX.value), [0, SCREEN_W], [0.7, 1], Extrapolation.CLAMP),
  }));

  if (!current) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 30 }}>🍃</Text>
        <Text variant="h2" center>
          {t("discover.empty")}
        </Text>
        <Text variant="bodyMuted" center>
          {t("discover.emptyBody")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.deck}>
        {next ? (
          <Animated.View key={keyExtractor(next)} style={[styles.card, styles.cardBehind, nextScale]}>
            {renderCard(next)}
          </Animated.View>
        ) : null}

        <GestureDetector gesture={pan}>
          <Animated.View key={keyExtractor(current)} style={[styles.card, cardStyle]}>
            {renderCard(current)}
            <Animated.View style={[styles.tag, styles.tagLeft, interestedBadge]}>
              <Text style={styles.tagText}>{t("discover.interested").toUpperCase()}</Text>
            </Animated.View>
            <Animated.View style={[styles.tag, styles.tagRight, skipBadge]}>
              <Text style={styles.tagText}>{t("discover.skip").toUpperCase()}</Text>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Tappable equivalents — required (12 §7) */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => fling("right")}
          accessibilityRole="button"
          accessibilityLabel={t("discover.skip")}
          style={[styles.actionBtn, styles.skipBtn]}
        >
          <Text style={{ fontSize: 20 }}>→</Text>
          <Text variant="caption">{t("discover.skip")}</Text>
        </Pressable>
        <Pressable
          onPress={() => data[index] && onInterested(data[index] as T)}
          accessibilityRole="button"
          accessibilityLabel={t("discover.moreInfo")}
          style={[styles.actionBtn, styles.infoBtn]}
        >
          <Text style={{ fontSize: 18 }}>ⓘ</Text>
          <Text variant="caption">{t("discover.moreInfo")}</Text>
        </Pressable>
        <Pressable
          onPress={() => fling("left")}
          accessibilityRole="button"
          accessibilityLabel={t("discover.interested")}
          style={[styles.actionBtn, styles.interestedBtn]}
        >
          <Text style={{ fontSize: 20 }}>♥</Text>
          <Text variant="caption">{t("discover.interested")}</Text>
        </Pressable>
      </View>

      <Text variant="caption" center style={{ marginTop: space.sm }}>
        {`← ${t("discover.hintLeft")}   ·   ${t("discover.hintRight")} →`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  deck: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    position: "absolute",
    width: "100%",
    borderRadius: radius.xl,
    backgroundColor: color.surface.base,
    ...shadow.raised,
  },
  cardBehind: {},
  tag: {
    position: "absolute",
    top: space.xl,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.sm,
    borderWidth: 2,
  },
  tagLeft: { left: space.xl, borderColor: color.state.success, backgroundColor: color.state.successSoft },
  tagRight: { right: space.xl, borderColor: color.ink.tertiary, backgroundColor: color.surface.muted },
  tagText: { fontFamily: font.sansSemibold, fontSize: 13, letterSpacing: 1 },
  actions: { flexDirection: "row", justifyContent: "center", gap: space.lg, marginTop: space.lg },
  actionBtn: {
    alignItems: "center",
    gap: 2,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: color.surface.raised,
    borderWidth: 1,
    borderColor: color.line.soft,
    minWidth: 84,
  },
  skipBtn: {},
  infoBtn: { borderColor: color.line.lavender },
  interestedBtn: { borderColor: color.state.success },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.sm, padding: space.xl },
});
