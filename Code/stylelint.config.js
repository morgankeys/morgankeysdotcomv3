/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-declaration-strict-value"],
  customSyntax: "postcss-html",
  ignoreFiles: [
    "src/styles/tokens/**/*.css",
    "node_modules/**",
    "../Export/**",
    "dist/**",
  ],
  rules: {
    // Require token variables (var(...)) for themed properties instead of raw literals.
    // ds-validate.mjs additionally enforces the --md-* prefix.
    "scale-unlimited/declaration-strict-value": [
      [
        "/color$/",
        "fill",
        "stroke",
        "/^margin/",
        "/^padding/",
        "/^gap/",
        "/^border-radius$/",
        "/^border-top-left-radius$/",
        "/^border-top-right-radius$/",
        "/^border-bottom-left-radius$/",
        "/^border-bottom-right-radius$/",
        "font-family",
        "font-size",
      ],
      {
        ignoreValues: {
          "": [
            "inherit",
            "initial",
            "unset",
            "revert",
            "revert-layer",
            "auto",
            "none",
            "normal",
            "transparent",
            // `value-keyword-case` (stylelint-config-standard) requires the
            // lowercase spelling, and this plugin matches ignoreValues
            // case-sensitively — so the allowlist must carry both, or the two
            // rules contradict each other and no spelling can pass.
            "currentcolor",
            "currentColor",
            "0",
            "100%",
          ],
          "/color$/": [
            "inherit",
            "initial",
            "unset",
            "transparent",
            "currentcolor",
            "currentColor",
          ],
          "/^margin/": ["0", "auto", "inherit"],
          "/^padding/": ["0", "inherit"],
          "/^gap/": ["0", "normal"],
          "/^border-radius$/": ["0"],
          "/^border-.*-radius$/": ["0"],
          "font-family": ["inherit"],
          "font-size": ["inherit"],
        },
        disableFix: true,
      },
    ],
    "no-descending-specificity": null,
    "selector-class-pattern": null,
    "media-feature-range-notation": null,
    // `:global()` (Astro) and `:deep()` (Vue SFC) are valid scoped-style selectors used
    // to reach slotted/injected markup such as inlined SVGs and astro:assets <img>.
    // stylelint-config-standard does not know them; recognize them rather than
    // sprinkling per-line disables.
    "selector-pseudo-class-no-unknown": [
      true,
      { ignorePseudoClasses: ["global", "deep"] },
    ],
  },
  overrides: [
    {
      files: ["src/styles/fonts.css"],
      rules: {
        "scale-unlimited/declaration-strict-value": null,
      },
    },
  ],
};
