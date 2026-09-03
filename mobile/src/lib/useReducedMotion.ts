import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Tracks the OS "reduce motion" setting (15, 12 §25). Screens use this to
 * swap large transitions for instant/opacity-only changes.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (alive) setReduced(v);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", (v) => {
      if (alive) setReduced(v);
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
