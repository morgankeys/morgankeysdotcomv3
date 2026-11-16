import { vue } from "@storybook-astro/framework/integrations";
import type { StorybookConfig } from "@storybook-astro/framework";

/**
 * Storybook for the UI catalog. Served at /dev/ on the Astro dev server
 * (proxied) and copied into dist/dev on feature-branch previews only.
 */
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts"],
  framework: {
    name: "@storybook-astro/framework",
    options: {
      integrations: [vue()],
    },
  },
  core: {
    disableTelemetry: true,
  },
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import("vite");

    return mergeConfig(viteConfig, {
      base: "/dev/",
      // Astro's dev server optimizes dependencies into the default Vite cache.
      // Sharing it makes Storybook serve a hash Vite has already replaced, so
      // the preview never finishes loading.
      cacheDir: "node_modules/.vite-storybook",
      server: {
        allowedHosts: true,
      },
      resolve: {
        alias: {
          // Vue stories render with inline templates, which the runtime-only
          // build cannot compile.
          vue: "vue/dist/vue.esm-bundler.js",
        },
      },
      // Draft notes and other showDraftContent UI should be visible in the
      // catalog. The static build is only published on feature previews.
      define: {
        "import.meta.env.FEATURE_PREVIEW": "true",
      },
    });
  },
};

export default config;
