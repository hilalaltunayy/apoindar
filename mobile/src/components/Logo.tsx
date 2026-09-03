import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { color, font } from "@/theme";
import { Text } from "./Text";

const MARK = require("../../assets/logo-mark.png");

interface Props {
  size?: number;
  wordmark?: boolean;
  tone?: "dark" | "light";
}

/** Apoindar mark + serif wordmark (07 §2) — identical to web. */
export function Logo({ size = 30, wordmark = true, tone = "dark" }: Props) {
  return (
    <View style={styles.row}>
      <Image
        source={MARK}
        style={{ width: size, height: size, borderRadius: size * 0.28 }}
        accessibilityIgnoresInvertColors
      />
      {wordmark && (
        <Text
          style={{
            fontFamily: font.serif,
            fontSize: size * 0.62,
            color: tone === "light" ? color.ink.inverse : color.ink.primary,
            letterSpacing: -0.3,
          }}
        >
          Apoindar
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
});
