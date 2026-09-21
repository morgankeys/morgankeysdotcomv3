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

export default defineConfig({
  site,
  output: "static",
  outDir: "dist",
  integrations: [vue(), sitemap()],
  image: {
    // Use the sharp image service for high-quality responsive images (astro:assets).
    service: { entrypoint: "astro/assets/services/sharp" },
  },
});
