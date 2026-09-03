import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import Svg, { Circle, Path, G, Line } from "react-native-svg";
import { color } from "@/theme";

interface Props {
  /** "public" = landing/auth (more visible); "inner" = dashboards (very light). */
  intensity?: "public" | "inner";
  style?: ViewStyle;
}

/**
 * Subtle education / sport motif wash (04 §4, 07 §7, 12 §2). Vector so it scales
 * on every screen density. Never a photo, never loud.
 */
export function MotifBackground({ intensity = "inner", style }: Props) {
  const op = intensity === "public" ? 1 : 0.45;
  const stroke = color.brand.purple300;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
        <G opacity={0.05 * op}>
          {/* protractor arc — academic */}
          <Path d="M40 120 a90 90 0 0 1 180 0" stroke={stroke} strokeWidth={2} fill="none" />
          <Line x1="40" y1="120" x2="220" y2="120" stroke={stroke} strokeWidth={2} />
          {/* running track — sport */}
          <Path
            d="M120 560 h150 a70 70 0 0 1 0 140 h-150 a70 70 0 0 1 0 -140 z"
            stroke={color.brand.yellow600}
            strokeWidth={2}
            fill="none"
          />
          {/* musical note */}
          <Circle cx="300" cy="300" r="10" fill={color.brand.purple500} />
          <Line x1="310" y1="300" x2="310" y2="230" stroke={color.brand.purple500} strokeWidth={2} />
          {/* orbit — science */}
          <Circle cx="90" cy="400" r="46" stroke={stroke} strokeWidth={2} fill="none" />
          <Path d="M50 400 h80" stroke={stroke} strokeWidth={2} transform="rotate(30 90 400)" />
          <Path d="M50 400 h80" stroke={stroke} strokeWidth={2} transform="rotate(-30 90 400)" />
        </G>
      </Svg>
    </View>
  );
}
