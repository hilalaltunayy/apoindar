import React, { useEffect, useRef, useState } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { Image } from "expo-image";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { MotifBackground } from "@/components";
import { color, font } from "@/theme";
import { useReducedMotion } from "@/lib/useReducedMotion";

const MARK = require("../assets/logo-mark.png");
const MIN_SHOW_MS = 1100;

/** Branded logo reveal (07 §13, 12 §15) → routes by session + role. */
export default function Splash() {
  const { status, user } = useAuth();
  const { ready: i18nReady } = useI18n();
  const reduced = useReducedMotion();
  const [minElapsed, setMinElapsed] = useState(false);

  const scale = useRef(new Animated.Value(reduced ? 1 : 0.82)).current;
  const opacity = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  const wordmark = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), MIN_SHOW_MS);
    if (!reduced) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
        ]),
        Animated.timing(wordmark, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
    return () => clearTimeout(timer);
  }, [opacity, scale, wordmark, reduced]);

  const settled = status !== "loading" && i18nReady && minElapsed;

  if (settled) {
    if (status === "authenticated" && user) {
      return <Redirect href={user.role === "PROVIDER" ? "/(provider)/dashboard" : "/(student)/home"} />;
    }
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <View style={styles.root}>
      <MotifBackground intensity="public" />
      <Animated.View style={[styles.center, { opacity, transform: [{ scale }] }]}>
        <Image source={MARK} style={styles.mark} contentFit="contain" />
        <Animated.Text
          style={[
            styles.word,
            { opacity: wordmark, transform: [{ translateY: wordmark.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] },
          ]}
        >
          Apoindar
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg.cream, alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center", gap: 14 },
  mark: { width: 76, height: 76, borderRadius: 20 },
  word: { fontFamily: font.serif, fontSize: 30, color: color.ink.primary, letterSpacing: -0.3 },
});
