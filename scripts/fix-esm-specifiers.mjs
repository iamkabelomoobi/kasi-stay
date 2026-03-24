import fs from "node:fs/promises";
import path from "node:path";

const targetDir = process.argv[2];

if (!targetDir) {
  console.error("Usage: node scripts/fix-esm-specifiers.mjs <dist-dir>");
  process.exit(1);
}

const isRelativeSpecifier = (specifier) =>
  specifier.startsWith("./") || specifier.startsWith("../");

const hasKnownExtension = (specifier) =>
  [".js", ".mjs", ".cjs", ".json", ".node"].some((ext) =>
    specifier.endsWith(ext),
  );

const specifierPattern =
  /((?:import|export)\s[^'"]*?\sfrom\s*|import\s*\(\s*|export\s*\*\s*from\s*|import\s*)(['"])(\.[^'"]+)(\2)/g;

const fileExists = async (candidatePath) => {
  try {
    const stat = await fs.stat(candidatePath);
    return stat.isFile();
  } catch {
    return false;
  }
};

const resolveSpecifier = async (entryPath, specifier) => {
  const absoluteSpecifierPath = path.resolve(path.dirname(entryPath), specifier);

  if (await fileExists(`${absoluteSpecifierPath}.js`)) {
    return `${specifier}.js`;
  }

  if (await fileExists(path.join(absoluteSpecifierPath, "index.js"))) {
    return `${specifier}/index.js`;
  }

  return `${specifier}.js`;
};

const rewriteSpecifiers = async (entryPath, source) => {
  let rewritten = "";
  let lastIndex = 0;

  for (const match of source.matchAll(specifierPattern)) {
    const [fullMatch, prefix, quote, specifier, suffix] = match;
    const matchIndex = match.index ?? 0;

    rewritten += source.slice(lastIndex, matchIndex);

    if (!isRelativeSpecifier(specifier) || hasKnownExtension(specifier)) {
      rewritten += fullMatch;
      lastIndex = matchIndex + fullMatch.length;
      continue;
    }

    const resolvedSpecifier = await resolveSpecifier(entryPath, specifier);
    rewritten += `${prefix}${quote}${resolvedSpecifier}${suffix}`;
    lastIndex = matchIndex + fullMatch.length;
  }

  rewritten += source.slice(lastIndex);
  return rewritten;
};

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(entryPath);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".js")) {
      continue;
    }

    const source = await fs.readFile(entryPath, "utf8");
    const rewritten = await rewriteSpecifiers(entryPath, source);

    if (rewritten !== source) {
      await fs.writeFile(entryPath, rewritten, "utf8");
    }
  }
};

await walk(path.resolve(targetDir));
