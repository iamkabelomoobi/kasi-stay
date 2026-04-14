// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const { commonIgnores } = require("../../packages/config/eslint/base.cjs");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [...commonIgnores, ".expo/**", "android/**", "ios/**"],
  },
]);
