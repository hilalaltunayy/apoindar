import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { color, space, font } from "@/theme";
import { Text } from "./Text";
import { Logo } from "./Logo";

interface Props {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  logo?: boolean;
}

/** Lightweight in-page header — inner pages keep motifs very light (12 §2). */
export function Header({ title, subtitle, showBack = false, right, logo = false }: Props) {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={styles.back}
          >
            <Text style={{ fontSize: 20, color: color.brand.purple700 }}>‹</Text>
          </Pressable>
        ) : logo ? (
          <Logo size={26} />
        ) : (
          <View />
        )}
        {right ?? <View />}
      </View>
      {title ? (
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text variant="bodyMuted">{subtitle}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm, marginBottom: space.md },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 32 },
  back: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: color.surface.raised,
    borderWidth: 1,
    borderColor: color.line.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: { gap: 2 },
  title: { fontFamily: font.serif, fontSize: 28, lineHeight: 34, color: color.ink.primary },
});
