import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { commonIgnores } from "./base.mjs";

const serverConfig = tseslint.config(
  {
    ignores: [...commonIgnores],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mts,cts,js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);

export default serverConfig;
