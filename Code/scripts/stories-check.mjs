#!/usr/bin/env node
/**
 * stories-check.mjs
 *
 * Every UI component needs a sibling Storybook story. A new file under
 * src/components/ fails this check until it has Component.stories.ts beside
 * it, or it is added to EXEMPT with a reason.
 *
 * Case-study bodies are content, not components, so that directory is exempt
 * as a whole. HomePage is the page composition. GoogleAnalytics has no UI.
 *
 * Wired into `npm run lint`. Exits 1 when a component is missing its story.
 */
import { access, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const componentsDir = join(root, "src", "components");

const COMPONENT_EXT = new Set([".astro", ".vue"]);

/**
 * Paths relative to src/components/, with why they have no story.
 * A directory entry exempts everything under it.
 *
 * @type {Record<string, string>}
 */
const EXEMPT = {
  // One content body per case study, not a reusable component.
  "case-studies": "Case study content, not a reusable component.",
  // The page composition.
  "HomePage.astro": "Page composition, not a reusable component.",
  // Injects the analytics tag. Nothing to look at.
  "GoogleAnalytics.astro": "No visible UI.",
};

/** @param {string} dir @returns {AsyncGenerator<string>} */
async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

/**
 * @param {string} rel path relative to src/components/, forward slashes
 * @returns {boolean}
 */
function isExempt(rel) {
  if (rel in EXEMPT) return true;
  const top = rel.split("/")[0];
  return top in EXEMPT && rel.includes("/");
}

/** @type {string[]} */
const missing = [];

for await (const file of walk(componentsDir)) {
  const ext = file.slice(file.lastIndexOf("."));
  if (!COMPONENT_EXT.has(ext)) continue;

  const rel = relative(componentsDir, file).split(sep).join("/");
  if (isExempt(rel)) continue;

  const story = file.slice(0, -ext.length) + ".stories.ts";
  try {
    await access(story);
  } catch {
    missing.push(rel);
  }
}

if (missing.length === 0) {
  console.log("Every UI component has a story.");
  process.exit(0);
}

console.error("Components missing a sibling *.stories.ts:\n");
for (const rel of missing) console.error(`  - src/components/${rel}`);
console.error(
  "\nAdd the story, or exempt the file in scripts/stories-check.mjs with a reason.",
);
process.exit(1);
