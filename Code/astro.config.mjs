// @ts-check
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import sitemap from "@astrojs/sitemap";
import {
  detectBranch,
  isFeaturePreviewBuild,
  isVercelBuild,
} from "./src/lib/deploy-stage.mjs";

// Static-first portfolio. Output stays inside Code/ (`dist/`) so Vercel can use
// Root Directory = Code and the default Output Directory = dist.

// Per-environment site URL. Vercel sets PUBLIC_SITE_URL per environment scope
// (Production -> https://morgankeys.com, Preview -> https://staging.morgankeys.com)
// so canonical URLs and the generated sitemap never advertise the wrong host.
const site = process.env.PUBLIC_SITE_URL ?? "https://morgankeys.com";

// Where this build runs: a feature-branch preview (drafts shown), the host,
// and the branch. They drive draft content and the environment badge; see
// src/lib/deploy-stage.mjs.
const featurePreview = isFeaturePreviewBuild(process.env);
const deployHost = isVercelBuild(process.env) ? "vercel" : "other";
const deployBranch = detectBranch(process.env);

/**
 * Fails any staging, production, or local build that emits a page under /dev/.
 *
 * Specimen and sandbox pages belong in src/pages/dev/ as dynamic routes whose
 * getStaticPaths returns nothing unless `showDraftContent` (src/lib/env.ts).
 * They build only under `astro dev` and on feature-branch previews. A static
 * page in that folder would build everywhere, so this guard catches it on
 * every build that is not a feature-branch preview: local, CI, staging, and
 * production. See Agents/context/draft-content.md.
 *
 * @returns {import("astro").AstroIntegration}
 */
function devOnlyPagesGuard() {
  return {
    name: "dev-only-pages-guard",
    hooks: {
      "astro:build:done": ({ pages }) => {
        const leaked = pages
          .map(({ pathname }) => `/${pathname}`)
          .filter((path) => path === "/dev/" || path.startsWith("/dev/"));
        if (leaked.length > 0 && !featurePreview) {
          throw new Error(
            `Dev-only pages were built for deployment: ${leaked.join(", ")}. ` +
              "Pages under src/pages/dev/ must be dynamic routes whose " +
              "getStaticPaths returns [] unless showDraftContent. " +
              "See Agents/context/draft-content.md.",
          );
        }
      },
    },
  };
}

export default defineConfig({
  site,
  output: "static",
  outDir: "dist",
  integrations: [
    vue(),
    // Feature-branch previews build /dev/ pages; they never belong in a sitemap.
    sitemap({ filter: (page) => !new URL(page).pathname.startsWith("/dev/") }),
    devOnlyPagesGuard(),
  ],
  vite: {
    define: {
      "import.meta.env.FEATURE_PREVIEW": JSON.stringify(featurePreview),
      "import.meta.env.DEPLOY_HOST": JSON.stringify(deployHost),
      "import.meta.env.DEPLOY_BRANCH": JSON.stringify(deployBranch),
    },
  },
  image: {
    // Use the sharp image service for high-quality responsive images (astro:assets).
    service: { entrypoint: "astro/assets/services/sharp" },
  },
});
