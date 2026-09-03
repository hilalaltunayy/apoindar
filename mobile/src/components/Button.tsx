import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { color, radius, shadow, space, font } from "@/theme";
import { Text } from "./Text";
import { haptic } from "@/lib/haptics";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "lg" | "md" | "sm";

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  accessibilityHint?: string;
}

const HEIGHT: Record<Size, number> = { lg: 54, md: 46, sm: 38 };

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  loading = false,
  disabled = false,
  full = true,
  icon,
  style,
  accessibilityHint,
}: Props) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const spring = (to: number) => {
    if (reduced) return;
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  const palette = getPalette(variant, isDisabled);

  return (
    <Animated.View
      style={[
        full && { alignSelf: "stretch" },
        { transform: [{ scale }] },
        variant === "primary" && !isDisabled ? shadow.cta : null,
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        accessibilityHint={accessibilityHint}
        disabled={isDisabled}
        onPressIn={() => spring(0.97)}
        onPressOut={() => spring(1)}
        onPress={() => {
          if (isDisabled) return;
          haptic.light();
          onPress?.();
        }}
        style={[
          styles.base,
          {
            height: HEIGHT[size],
            backgroundColor: palette.bg,
            borderColor: palette.border,
            borderWidth: palette.border === "transparent" ? 0 : 1.5,
          },
        ]}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color={palette.fg} />
          ) : (
            <>
              {icon}
              <Text style={[styles.label, { color: palette.fg, fontSize: size === "sm" ? 14 : 16 }]}>
                {label}
              </Text>
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function getPalette(variant: Variant, disabled: boolean) {
  if (disabled) {
    return { bg: color.surface.muted, fg: color.ink.tertiary, border: "transparent" };
  }
  switch (variant) {
    case "primary":
      return { bg: color.brand.yellow500, fg: color.ink.primary, border: "transparent" };
    case "secondary":
      return { bg: color.surface.raised, fg: color.brand.purple700, border: color.line.lavender };
    case "danger":
      return { bg: color.state.dangerSoft, fg: color.state.danger, border: "transparent" };
    case "ghost":
    default:
      return { bg: "transparent", fg: color.brand.purple700, border: "transparent" };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.xl,
  },
  content: { flexDirection: "row", alignItems: "center", gap: space.sm },
  label: { fontFamily: font.sansSemibold },
});
