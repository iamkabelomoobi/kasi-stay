import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { commonIgnores } from "../../packages/config/eslint/base.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([...commonIgnores, ".next/**", "out/**", "next-env.d.ts"]),
]);

export default eslintConfig;
