/**
 * Apoindar design tokens for mobile — the SAME approved system as web
 * (07-design-system, 12 §2). Do not redesign; extend only.
 */

export const color = {
  brand: {
    yellow100: "#FDF3D6",
    yellow200: "#FAE7AE",
    yellow400: "#F6D468",
    yellow500: "#F4C84A",
    yellow600: "#E7B92D",
    yellow700: "#C89A18",
    purple100: "#EFE8F7",
    purple200: "#DDD0EE",
    purple300: "#C9B6E5",
    purple400: "#B49BD9",
    purple500: "#9A7ACB",
    purple600: "#7450A6",
    purple700: "#5E3A86",
    purple800: "#492C68",
    lavender100: "#F1EAF9",
    lavender200: "#E7DBF6",
    lavender300: "#D9C7EF",
  },
  bg: {
    cream: "#FBF6EA",
    soft: "#F8F2E7",
  },
  surface: {
    base: "#FFFDF8",
    raised: "#FFFFFF",
    muted: "#F6EFE1",
  },
  ink: {
    primary: "#241A26",
    secondary: "#5F5364",
    tertiary: "#8A7E90",
    inverse: "#FFFDF8",
  },
  line: {
    soft: "#E8DDCF",
    lavender: "#E3D7F2",
  },
  state: {
    success: "#3F9A6B",
    successSoft: "#E4F2EA",
    danger: "#C0563E",
    dangerSoft: "#F6E4DF",
    info: "#5E3A86",
  },
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
} as const;

export const font = {
  serif: "Fraunces_600SemiBold",
  serifRegular: "Fraunces_400Regular",
  sans: "Inter_400Regular",
  sansMedium: "Inter_500Medium",
  sansSemibold: "Inter_600SemiBold",
} as const;

export const type = {
  display: { fontFamily: font.serif, fontSize: 32, lineHeight: 38, color: color.ink.primary },
  h1: { fontFamily: font.serif, fontSize: 26, lineHeight: 32, color: color.ink.primary },
  h2: { fontFamily: font.serif, fontSize: 20, lineHeight: 26, color: color.ink.primary },
  bodyLg: { fontFamily: font.sans, fontSize: 16, lineHeight: 24, color: color.ink.secondary },
  body: { fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.ink.primary },
  bodyMuted: { fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.ink.secondary },
  label: { fontFamily: font.sansMedium, fontSize: 13, lineHeight: 18, color: color.ink.primary },
  caption: { fontFamily: font.sans, fontSize: 12, lineHeight: 16, color: color.ink.tertiary },
} as const;

export const shadow = {
  soft: {
    shadowColor: "#241A26",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  raised: {
    shadowColor: "#241A26",
    shadowOpacity: 0.12,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  cta: {
    shadowColor: color.brand.yellow600,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
} as const;

/** Motion timings (07 §14, §25). Buttery, restrained. */
export const motion = {
  fast: 180,
  base: 250,
  slow: 400,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

export const theme = { color, radius, space, font, type, shadow, motion };
export type Theme = typeof theme;
