// eslint-config-expo (SDK 52) ships a legacy eslintrc-style config; load it
// through FlatCompat so we can still run ESLint 9's flat-config CLI.
const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    ignores: [
      "dist/*",
      ".expo/*",
      "node_modules/*",
      "babel.config.js",
      "metro.config.js",
      "eslint.config.js",
    ],
  },
  ...compat.extends("eslint-config-expo"),
  {
    rules: {
      "import/no-unresolved": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
