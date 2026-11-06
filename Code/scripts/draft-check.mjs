#!/usr/bin/env node
/**
 * draft-check.mjs
 *
 * Lists draft content in Code/src and grades it by where the pull request is
 * going (Agents/context/draft-content.md):
 *
 *   --base main      error: drafts must be finished or removed before they
 *                    reach production. Exits 1.
 *   --base staging   warning: allowed, but it is clean-up to do before the
 *                    next promotion to main. Exits 0.
 *   anything else    report only. Exits 0.
 *
 * Draft content is:
 *   - any file in a `drafts/` folder under src/
 *   - any use of <DraftNote>
 *   - any import of the placeholder images, outside src/pages/dev/
 *
 * The specimen pages in src/pages/dev/ are not counted: they are part of the
 * kit and never render on staging or production.
 *
 * Usage: node scripts/draft-check.mjs [--base <branch>]
 */
import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const srcDir = join(root, "src");

const baseIndex = process.argv.indexOf("--base");
const base = baseIndex === -1 ? "" : (process.argv[baseIndex + 1] ?? "");

const SOURCE_EXTENSIONS = [".astro", ".vue", ".ts", ".js", ".mjs"];
const PLACEHOLDER_IMPORT = /assets\/placeholder(-raster)?\.(jpg|svg)["']/;

/** @param {string} dir @returns {AsyncGenerator<string>} */
async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

/** @type {string[]} */
const findings = [];

for await (const file of walk(srcDir)) {
  if (!SOURCE_EXTENSIONS.some((ext) => file.endsWith(ext))) continue;

  const rel = relative(root, file).split(sep).join("/");
  if (rel.startsWith("src/pages/dev/")) continue;
  if (rel === "src/components/case-study/DraftNote.astro") continue;

  if (rel.split("/").includes("drafts")) {
    findings.push(`${rel}: draft file`);
    continue;
  }

  const text = await readFile(file, "utf8");
  if (text.includes("<DraftNote")) {
    findings.push(`${rel}: uses <DraftNote>`);
  }
  if (PLACEHOLDER_IMPORT.test(text)) {
    findings.push(`${rel}: imports a placeholder image`);
  }
}

if (findings.length === 0) {
  console.log("No draft content.");
  process.exit(0);
}

const list = findings.map((line) => `  - ${line}`).join("\n");
const inCi = Boolean(process.env.GITHUB_ACTIONS);

if (base === "main") {
  const message =
    "Draft content cannot merge into main. Finish or remove it on staging first " +
    "(Agents/context/draft-content.md).";
  console.error(`${message}\n${list}`);
  if (inCi) console.log(`::error title=Draft content::${message}`);
  process.exit(1);
}

if (base === "staging") {
  const message =
    "Draft content is merging into staging. It stays hidden there, but must be " +
    "finished or removed before staging is promoted to main " +
    "(Agents/context/draft-content.md).";
  console.warn(`${message}\n${list}`);
  if (inCi) console.log(`::warning title=Draft content::${message}`);
  process.exit(0);
}

console.log(`Draft content (allowed on feature branches):\n${list}`);
