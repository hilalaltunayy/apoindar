import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Pressable,
  Animated,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { color, radius, space } from "@/theme";
import { Text } from "./Text";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const { height: SCREEN_H } = Dimensions.get("window");

/** Reusable bottom sheet for filters, pickers and confirmations (12 §12). */
export function BottomSheet({ visible, onClose, title, children, footer }: Props) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const y = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(y, {
          toValue: 0,
          duration: reduced ? 0 : 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, { toValue: 1, duration: reduced ? 0 : 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(y, { toValue: SCREEN_H, duration: reduced ? 0 : 220, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 0, duration: reduced ? 0 : 160, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, y, backdrop, reduced]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: y }], paddingBottom: insets.bottom + space.lg, maxHeight: SCREEN_H * 0.88 },
          ]}
        >
          <View style={styles.handle} />
          {title ? (
            <Text variant="h2" style={styles.title}>
              {title}
            </Text>
          ) : null}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: space.md }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(36,26,38,0.42)" },
  sheet: {
    backgroundColor: color.bg.cream,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.line.lavender,
    marginBottom: space.md,
  },
  title: { marginBottom: space.md },
  scroll: { flexGrow: 0 },
  footer: { paddingTop: space.md, gap: space.sm },
});
