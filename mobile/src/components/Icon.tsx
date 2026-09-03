import React from "react";
import Svg, { Path, Circle } from "react-native-svg";
import { color as theme } from "@/theme";

export type IconName =
  | "home"
  | "search"
  | "cards"
  | "calendar"
  | "chat"
  | "user"
  | "heart"
  | "heart-fill"
  | "star"
  | "clock"
  | "check"
  | "chevron-right"
  | "chevron-left"
  | "plus"
  | "wallet"
  | "book"
  | "users"
  | "bell"
  | "globe"
  | "lock"
  | "gear"
  | "sparkle"
  | "arrow-right"
  | "list";

const PATHS: Record<IconName, React.ReactNode> = {
  home: <Path d="M4 11l8-7 8 7M6 10v9h12v-9" />,
  search: (
    <>
      <Circle cx="11" cy="11" r="6" />
      <Path d="M20 20l-4-4" />
    </>
  ),
  cards: <Path d="M4 7h16v12H4zM4 7l2-3h12l2 3" />,
  calendar: <Path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" />,
  chat: <Path d="M5 5h14v10H9l-4 4z" />,
  user: (
    <>
      <Circle cx="12" cy="8" r="3.5" />
      <Path d="M5 20c1.5-4 12.5-4 14 0" />
    </>
  ),
  users: (
    <>
      <Circle cx="9" cy="8" r="3" />
      <Path d="M3 19c1-3.5 10-3.5 11 0M16 6a3 3 0 0 1 0 6M17 13c3 .5 4.5 2 5 5" />
    </>
  ),
  heart: <Path d="M12 20S4 14.5 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 5.5-8 11-8 11z" />,
  "heart-fill": (
    <Path d="M12 20S4 14.5 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 5.5-8 11-8 11z" fill="currentColor" />
  ),
  star: <Path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 23l1-6L3.3 12.8l6-.9z" />,
  clock: (
    <>
      <Circle cx="12" cy="12" r="8" />
      <Path d="M12 7v5l3 2" />
    </>
  ),
  check: <Path d="M4 12l5 5L20 6" />,
  "chevron-right": <Path d="M9 5l7 7-7 7" />,
  "chevron-left": <Path d="M15 5l-7 7 7 7" />,
  plus: <Path d="M12 5v14M5 12h14" />,
  wallet: <Path d="M4 7h16v12H4zM4 7l0-2h12M16 13h3" />,
  book: <Path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z M18 20a2 2 0 0 0 2-2V4" />,
  bell: <Path d="M6 16V10a6 6 0 0 1 12 0v6l2 2H4zM10 20a2 2 0 0 0 4 0" />,
  globe: (
    <>
      <Circle cx="12" cy="12" r="8" />
      <Path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16" />
    </>
  ),
  lock: <Path d="M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3" />,
  gear: (
    <>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M12 3v3M12 18v3M3 12h3M18 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>
  ),
  sparkle: <Path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />,
  "arrow-right": <Path d="M4 12h16M14 6l6 6-6 6" />,
  list: <Path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
};

export function Icon({
  name,
  size = 22,
  color = theme.ink.primary,
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      color={color}
    >
      {PATHS[name]}
    </Svg>
  );
}
