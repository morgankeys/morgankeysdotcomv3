// @ts-check
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import sitemap from "@astrojs/sitemap";

// Static-first portfolio. Output stays inside Code/ (`dist/`) so Vercel can use
// Root Directory = Code and the default Output Directory = dist.
export default defineConfig({
  // Update to the production domain when known; enables absolute URLs + sitemap.
  site: "https://morgankeys.com",
  output: "static",
  outDir: "dist",
  integrations: [vue(), sitemap()],
  image: {
    // Use the sharp image service for high-quality responsive images (astro:assets).
    service: { entrypoint: "astro/assets/services/sharp" },
  },
});
