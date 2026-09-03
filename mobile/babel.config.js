module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@": "./src",
            // Zero-dependency pure modules shared with the web repo's /lib
            // (password policy, commerce constants) — one source of truth for
            // web + mobile (12 §1, §19). Only import files here that do NOT
            // self-reference via the web's "@/lib/..." alias.
            "@shared": "../lib",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
