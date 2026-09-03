import React, { useRef } from "react";
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  Image,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import { color, radius, shadow, space, font } from "@/theme";
import { Text } from "./Text";
import { haptic } from "@/lib/haptics";
import { useReducedMotion } from "@/lib/useReducedMotion";

/* ------------------------------------------------------------------ Card */

export function Card({
  children,
  onPress,
  style,
  raised = false,
  padded = true,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  raised?: boolean;
  padded?: boolean;
}) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) => {
    if (reduced || !onPress) return;
    Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 5 }).start();
  };

  const inner = (
    <Animated.View
      style={[
        styles.card,
        padded && { padding: space.lg },
        raised ? shadow.raised : shadow.soft,
        { transform: [{ scale }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (!onPress) return inner;
  return (
    <Pressable
      onPressIn={() => to(0.985)}
      onPressOut={() => to(1)}
      onPress={() => {
        haptic.select();
        onPress();
      }}
      accessibilityRole="button"
    >
      {inner}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Chip */

export function Chip({
  label,
  selected = false,
  onPress,
  tone = "purple",
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: "purple" | "yellow" | "neutral";
}) {
  const bg = selected
    ? tone === "yellow"
      ? color.brand.yellow500
      : color.brand.purple600
    : color.surface.raised;
  const fg = selected ? (tone === "yellow" ? color.ink.primary : color.ink.inverse) : color.ink.secondary;
  const border = selected ? "transparent" : color.line.soft;

  return (
    <Pressable
      onPress={
        onPress
          ? () => {
              haptic.select();
              onPress();
            }
          : undefined
      }
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityState={{ selected }}
      style={[styles.chip, { backgroundColor: bg, borderColor: border }]}
    >
      <Text style={{ color: fg, fontFamily: font.sansMedium, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

/* ----------------------------------------------------------------- Badge */

export function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "danger" | "premium" | "info";
}) {
  const map = {
    neutral: { bg: color.surface.muted, fg: color.ink.secondary },
    success: { bg: color.state.successSoft, fg: color.state.success },
    danger: { bg: color.state.dangerSoft, fg: color.state.danger },
    premium: { bg: color.brand.purple100, fg: color.brand.purple700 },
    info: { bg: color.brand.lavender200, fg: color.brand.purple700 },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: map.bg }]}>
      <Text style={{ color: map.fg, fontFamily: font.sansSemibold, fontSize: 11, letterSpacing: 0.3 }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

/* ---------------------------------------------------------------- Avatar */

export function Avatar({
  uri,
  name,
  size = 48,
}: {
  uri?: string | null;
  name?: string | null;
  size?: number;
}) {
  const initials = (name ?? "")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color.brand.lavender200 }}
        accessibilityIgnoresInvertColors
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color.brand.purple100,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: color.brand.purple700, fontFamily: font.serif, fontSize: size * 0.36 }}>
        {initials || "A"}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------- SegmentedControl */

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segment}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => {
              haptic.select();
              onChange(o.value);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.segmentItem, active && styles.segmentItemActive]}
          >
            <Text
              style={{
                fontFamily: active ? font.sansSemibold : font.sansMedium,
                fontSize: 13,
                color: active ? color.ink.primary : color.ink.tertiary,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* -------------------------------------------------------------- StatTile */

export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="caption">{label}</Text>
      <Text style={{ fontFamily: font.serif, fontSize: 22, color: color.ink.primary }}>{value}</Text>
      {hint ? <Text variant="caption">{hint}</Text> : null}
    </View>
  );
}

/* ------------------------------------------------------------- Row / etc */

export function Row({
  children,
  gap = space.sm,
  style,
  align = "center",
}: {
  children: React.ReactNode;
  gap?: number;
  style?: StyleProp<ViewStyle>;
  align?: ViewStyle["alignItems"];
}) {
  return <View style={[{ flexDirection: "row", alignItems: align, gap }, style]}>{children}</View>;
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="h2">{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line.soft,
  },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  badge: { paddingHorizontal: space.sm, paddingVertical: 3, borderRadius: radius.sm, alignSelf: "flex-start" },
  segment: {
    flexDirection: "row",
    backgroundColor: color.surface.muted,
    borderRadius: radius.pill,
    padding: 3,
  },
  segmentItem: { flex: 1, paddingVertical: space.sm, alignItems: "center", borderRadius: radius.pill },
  segmentItemActive: { backgroundColor: color.surface.raised, ...shadow.soft },
  stat: {
    flex: 1,
    backgroundColor: color.surface.base,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.line.soft,
    padding: space.md,
    gap: 2,
  },
  divider: { height: 1, backgroundColor: color.line.soft, marginVertical: space.md },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.md,
  },
});
