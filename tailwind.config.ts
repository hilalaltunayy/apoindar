import type { Config } from "tailwindcss";

/**
 * Apoindar design tokens — source of truth: 07-design-system-and-visual-language.md
 * Palette: soft premium yellow + soft/medium purple + warm cream + light lavender.
 * Do NOT introduce plain white as the dominant page background.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: {
            100: "#FDF3D6",
            200: "#FAE7AE",
            400: "#F6D468",
            500: "#F4C84A",
            600: "#E7B92D",
            700: "#C89A18",
          },
          purple: {
            100: "#EFE8F7",
            200: "#DDD0EE",
            400: "#B49BD9",
            500: "#9A7ACB",
            600: "#7450A6",
            700: "#5E3A86",
            800: "#492C68",
          },
          lavender: {
            100: "#F1EAF9",
            200: "#E7DBF6",
            300: "#D9C7EF",
          },
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
        },
        line: {
          soft: "#E8DDCF",
          lavender: "#E3D7F2",
        },
        state: {
          success: "#3F9A6B",
          "success-soft": "#E4F2EA",
          danger: "#C0563E",
          "danger-soft": "#F6E4DF",
          info: "#5E3A86",
        },
      },
      fontFamily: {
        serif: ["var(--font-headline)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-body)", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        md: "14px",
        lg: "18px",
        xl: "24px",
        "2xl": "32px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(36,26,38,0.04), 0 6px 16px rgba(36,26,38,0.06)",
        raised: "0 2px 6px rgba(36,26,38,0.06), 0 16px 40px rgba(36,26,38,0.10)",
        "cta": "0 6px 18px rgba(231,185,45,0.35)",
        "purple": "0 6px 18px rgba(94,58,134,0.22)",
      },
      transitionTimingFunction: {
        butter: "cubic-bezier(0.22, 1, 0.36, 1)",
        "butter-in": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        250: "250ms",
        400: "400ms",
        600: "600ms",
      },
      keyframes: {
        "apoindar-shimmer": {
          "0%": { backgroundPosition: "-480px 0" },
          "100%": { backgroundPosition: "480px 0" },
        },
        "apoindar-breathe": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "0.9" },
        },
        "apoindar-rise": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "apoindar-pop": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "60%": { transform: "scale(1.04)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "apoindar-caret": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        shimmer: "apoindar-shimmer 1.6s ease-in-out infinite",
        breathe: "apoindar-breathe 2.4s ease-in-out infinite",
        rise: "apoindar-rise 0.6s cubic-bezier(0.22,1,0.36,1) both",
        pop: "apoindar-pop 0.45s cubic-bezier(0.22,1,0.36,1) both",
        caret: "apoindar-caret 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
