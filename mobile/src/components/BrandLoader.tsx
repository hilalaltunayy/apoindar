import React, { useEffect, useRef, useState } from "react";
import { View, Image, Animated, StyleSheet, Easing } from "react-native";
import { color, space } from "@/theme";
import { Text } from "./Text";
import { useI18n } from "@/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";

const MARK = require("../../assets/logo-mark.png");
const GLYPHS = ["✏️", "📐", "🎓", "🎾", "🎵", "🌊", "🏀", "📚"];
const PURPLES = [color.brand.purple400, color.brand.purple500, color.brand.purple600, color.brand.purple700];

/**
 * Branded loader (07 §15.2, 12 §15) — the Apoindar mark over cycling education
 * motifs while the ring deepens. Never a generic spinner.
 */
export function BrandLoader({ label, compact = false }: { label?: string; compact?: boolean }) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const pop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const id = setInterval(() => setI((n) => n + 1), 440);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (reduced) return;
    pop.setValue(0.6);
    Animated.timing(pop, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.back(2)),
      useNativeDriver: true,
    }).start();
  }, [i, pop, reduced]);

  const ring = PURPLES[Math.min(i, PURPLES.length - 1)];

  return (
    <View style={[styles.wrap, compact && { paddingVertical: space.lg }]} accessibilityRole="progressbar">
      <Image source={MARK} style={styles.mark} accessibilityIgnoresInvertColors />
      <View style={[styles.box, { borderColor: ring }]}>
        <Animated.Text style={[styles.glyph, { transform: [{ scale: pop }] }]}>
          {GLYPHS[i % GLYPHS.length]}
        </Animated.Text>
      </View>
      <Text variant="bodyMuted">{`${label ?? t("common.loading")}…`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", gap: space.md, paddingVertical: space["3xl"] },
  mark: { width: 26, height: 26, borderRadius: 7, opacity: 0.9 },
  box: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,253,248,0.7)",
  },
  glyph: { fontSize: 26 },
});
