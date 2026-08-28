// @ts-check
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import sitemap from "@astrojs/sitemap";

// Static-first portfolio. Builds land in the kit's Export drop zone so they can be
// staged for manual transfer to a server (see AGENTS.md).
export default defineConfig({
  // Update to the production domain when known; enables absolute URLs + sitemap.
  site: "https://morgankeys.com",
  output: "static",
  outDir: "../Export/site",
  integrations: [vue(), sitemap()],
  image: {
    // Use the sharp image service for high-quality responsive images (astro:assets).
    service: { entrypoint: "astro/assets/services/sharp" },
  },
});
