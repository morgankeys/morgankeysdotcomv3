// @ts-check
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import sitemap from "@astrojs/sitemap";

// Static-first portfolio. Output stays inside Code/ (`dist/`) so Vercel can use
// Root Directory = Code and the default Output Directory = dist.

// Per-environment site URL. Vercel sets PUBLIC_SITE_URL per environment scope
// (Production -> https://morgankeys.com, Preview -> https://staging.morgankeys.com)
// so canonical URLs and the generated sitemap never advertise the wrong host.
const site = process.env.PUBLIC_SITE_URL ?? "https://morgankeys.com";

/**
 * Fails any build that emits a page under /dev/.
 *
 * Sandbox, test, and specimen pages belong in src/pages/dev/ as dynamic routes
 * whose getStaticPaths returns nothing outside `astro dev`. A static page in
 * that folder would still build and ship, so this guard catches it on every
 * build: local, CI, staging, and production. See
 * Agents/context/dev-only-pages.md.
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
        if (leaked.length > 0) {
          throw new Error(
            `Dev-only pages were built for deployment: ${leaked.join(", ")}. ` +
              "Pages under src/pages/dev/ must be dynamic routes whose " +
              "getStaticPaths returns [] unless import.meta.env.DEV. " +
              "See Agents/context/dev-only-pages.md.",
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
  integrations: [vue(), sitemap(), devOnlyPagesGuard()],
  image: {
    // Use the sharp image service for high-quality responsive images (astro:assets).
    service: { entrypoint: "astro/assets/services/sharp" },
  },
});
