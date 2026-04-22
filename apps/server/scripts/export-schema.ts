import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { lexicographicSortSchema, printSchema } from "graphql";

const outputArg = process.argv[2];

if (!outputArg) {
  throw new Error("Missing output path. Usage: export-schema <output-path>");
}

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@localhost:5432/kasistay";

const outputPath = resolve(process.cwd(), outputArg);
const { schema } = await import("../src/app");

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${printSchema(lexicographicSortSchema(schema))}\n`);

console.log(`Schema exported to ${outputPath}`);
