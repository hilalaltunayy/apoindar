import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, type ViewStyle } from "react-native";
import { color, radius, space } from "@/theme";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Branded skeleton — warm lavender tint, gentle pulse (07 §15.1, 11 §16). */
export function Skeleton({
  width = "100%",
  height = 16,
  rounded = radius.sm,
  style,
}: {
  width?: number | `${number}%` | "100%";
  height?: number;
  rounded?: number;
  style?: ViewStyle;
}) {
  const reduced = useReducedMotion();
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (reduced) {
      pulse.setValue(0.85);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduced]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: rounded, backgroundColor: color.brand.lavender200, opacity: pulse },
        style,
      ]}
    />
  );
}

/** Common card-shaped placeholder used across list screens. */
export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton width="60%" height={18} />
      <Skeleton width="90%" height={12} />
      <Skeleton width="40%" height={12} />
      <View style={styles.row}>
        <Skeleton width={72} height={28} rounded={radius.pill} />
        <Skeleton width={72} height={28} rounded={radius.pill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line.soft,
    padding: space.lg,
    gap: space.sm,
  },
  row: { flexDirection: "row", gap: space.sm, marginTop: space.xs },
});
