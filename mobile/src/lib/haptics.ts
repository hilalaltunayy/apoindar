import * as Haptics from "expo-haptics";

/** Sparing haptics (12 §25). Silently no-ops on web / unsupported devices. */
export const haptic = {
  select: () => Haptics.selectionAsync().catch(() => {}),
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}),
};
