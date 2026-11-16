#!/usr/bin/env node
/**
 * build-storybook-dev.mjs
 *
 * Runs after `astro build`. Feature-branch previews get Storybook written to
 * dist/dev (Vite base /dev/). Every other build must not contain that
 * directory: the Astro page guard cannot see files copied in after it runs.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isFeaturePreviewBuild } from "../src/lib/deploy-stage.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "dist", "dev");

if (!isFeaturePreviewBuild(process.env)) {
  if (existsSync(outDir)) {
    throw new Error(
      "dist/dev exists, but this is not a feature-branch preview. " +
        "Storybook is only published on feature previews. " +
        "See Agents/context/draft-content.md.",
    );
  }
  console.log("Skipping Storybook (not a feature-branch preview).");
  process.exit(0);
}

const result = spawnSync(
  process.execPath,
  [
    join(root, "node_modules/storybook/dist/bin/dispatcher.js"),
    "build",
    "--output-dir",
    outDir,
    "--disable-telemetry",
  ],
  { cwd: root, stdio: "inherit" },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
