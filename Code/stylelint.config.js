/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-declaration-strict-value"],
  ignoreFiles: ["src/styles/tokens/**/*.css", "node_modules/**", "dist/**"],
  rules: {
    // Require token variables (var(...)) for themed properties instead of raw literals.
    // ds-validate.mjs additionally enforces the --md-* prefix.
    //
    // expandShorthand checks the color longhand inside `border*`, `outline`,
    // and `background`, so `border: 1px solid #000` fails while
    // `1px solid var(--md-…)` passes. This plugin accepts any function call, so
    // literals inside `rgb()`, `calc()`, gradients, or a `var()` fallback, and
    // colors in `box-shadow`/`text-shadow`, are enforced by ds-validate.mjs only.
    "scale-unlimited/declaration-strict-value": [
      [
        "/color$/",
        "fill",
        "stroke",
        "/^margin/",
        "/^padding/",
        "/gap$/",
        "font-weight",
        "line-height",
        "letter-spacing",
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
          "/gap$/": ["0", "normal"],
          "/^border-radius$/": ["0"],
          "/^border-.*-radius$/": ["0"],
          "font-family": ["inherit"],
          "font-size": ["inherit"],
        },
        disableFix: true,
        expandShorthand: true,
        recurseLonghand: true,
      },
    ],
    "no-descending-specificity": null,
    "selector-class-pattern": null,
    "media-feature-range-notation": null,
    // iOS Safari supports only the prefixed `-webkit-text-size-adjust`; the
    // unprefixed property alone would let it inflate text in landscape.
    "property-no-vendor-prefix": [
      true,
      { ignoreProperties: ["-webkit-text-size-adjust"] },
    ],
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
      // Only component files carry CSS inside <style> blocks. Plain .css files
      // must use the default parser, or postcss-html finds nothing to lint.
      files: ["**/*.astro", "**/*.vue"],
      customSyntax: "postcss-html",
    },
    {
      files: ["src/styles/fonts.css"],
      rules: {
        "scale-unlimited/declaration-strict-value": null,
      },
    },
  ],
};
