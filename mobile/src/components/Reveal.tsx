import React, { useEffect, useRef } from "react";
import { Animated, type ViewStyle } from "react-native";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Subtle mount reveal — fade + rise (07 §14). Used to stagger list sections.
 * Honours reduce-motion by snapping straight to the resting state.
 */
export function Reveal({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return;
    }
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 380,
      delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [progress, delay, reduced]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
