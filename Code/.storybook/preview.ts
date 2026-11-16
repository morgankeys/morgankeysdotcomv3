import type { Preview } from "@storybook/vue3";

import "../src/styles/global.css";
import "../src/styles/brand.css";
import "./preview.css";

// These scripts touch `document` as they load. The static build imports this
// file in Node to compose stories, where that throws and drops every decorator.
if (typeof document !== "undefined") {
  void import("../src/scripts/button-ripple");
  void import("../src/scripts/case-study-overlay");
  void import("../src/scripts/image-zoom");
  void import("../src/scripts/deck-embed");
}

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Color theme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute(
          "data-theme",
          context.globals.theme === "dark" ? "dark" : "light",
        );
      }
      return story();
    },
  ],
};

export default preview;
