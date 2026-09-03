import React from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  type ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { color, space } from "@/theme";
import { MotifBackground } from "./MotifBackground";

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  motif?: "public" | "inner" | "none";
  padded?: boolean;
  contentStyle?: ViewStyle;
  /** Adds bottom padding for a floating CTA / tab bar. */
  footerSpace?: number;
  keyboard?: boolean;
}

export function Screen({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  motif = "inner",
  padded = true,
  contentStyle,
  footerSpace = 0,
  keyboard = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const pad: ViewStyle = padded
    ? { paddingHorizontal: space.lg, paddingTop: space.lg }
    : {};
  const bottomPad = { paddingBottom: insets.bottom + space.xl + footerSpace };

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[pad, bottomPad, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={color.brand.purple600}
            colors={[color.brand.purple600]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, pad, { paddingBottom: insets.bottom }, contentStyle]}>{children}</View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {motif !== "none" && <MotifBackground intensity={motif} />}
      {keyboard ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={insets.top}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg.cream },
  flex: { flex: 1 },
});
