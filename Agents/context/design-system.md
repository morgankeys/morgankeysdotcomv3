# Design System Conventions

Durable styling and component conventions for the prototype in `Code/`. Load this before
editing components, styles, or anything that renders UI.

For the token *pipeline* — how CSS custom properties are generated from Figma exports, and
the opacity/alpha transform — see [`design-tokens.md`](design-tokens.md).

The same two Figma files are listed for humans in
[`Docs/Design system/README.md`](../../Docs/Design%20system/README.md).

## Figma sources

- **Site file** — pages and features to implement:
  [morgankeysdotcomv3](https://www.figma.com/design/lQxgrO3UI3zgsoe24YPXHA/morgankeysdotcomv3?node-id=69-3148)
- **Design library** — core styles; tokens are exported from here:
  [M3 Design Kit — DUNE](https://www.figma.com/design/2EI2pZLDxPwfU599jMX3F0/M3-Design-Kit----DUNE-?node-id=49823-12141)

## Styling Rules

**Scoped styles only.** All component styling must live in scoped `<style>` blocks. No
inline styles, no global CSS outside of `src/styles/global.css` and generated token files.

**Token variables only.** All themed properties must use CSS custom properties from the
generated token files:

- **Color**: `--md-sys-color-*` (system colors), `--md-sys-color-state-layers-*-opacity-*`
  (hover/active/focus overlays)
- **Typography**: `--md-sys-typescale-*` (font-size, line-height, letter-spacing, weight,
  font-family)
- **Shape**: `--md-sys-shape-corner-*` (border-radius)
- **Spacing**: `--md-sys-spacing-*` (editorial spacing only — byline-to-body,
  body-to-section, etc.)
- **Font families**: `--md-ref-font-brand|plain|mono`

**Discovering variable names**: Run `rg "your-search-term" Code/src/styles/tokens/` or open
the generated CSS files directly. Never guess a variable name — confirm it exists. These
files are gitignored, so on a fresh clone run `npm run tokens` in `Code/` first to create
them.

## Generated Files — Never Hand-Edit

All files in `Code/src/styles/tokens/` have headers that say
`GENERATED FILE — do not edit by hand`. If you need to change token output:

1. Modify the transform in `Code/tokens/build.mjs`
2. Regenerate with `npm run tokens`
3. Verify output in `src/styles/tokens/`
4. Run `npm run build` to confirm Astro compiles

**Never edit the generated CSS directly.** Your changes will be lost on the next build.

The color transform includes a build-time regression guard that fails if any token with
`alpha < 1` loses its alpha channel. If the guard fails, fix the transform — do not bypass
the check. Full rationale in [`design-tokens.md`](design-tokens.md).

## Handling Deviations

**Never weaken lint rules to suppress design-system violations.** If Stylelint or
`npm run ds:validate` flags a hardcoded value:

1. Check if a suitable token exists (`rg "likely-name" Code/src/styles/tokens/`)
2. If yes: use the token
3. If no suitable token exists: log the deviation to
   `Docs/Design system/deviations-backlog.md` with rationale
4. If it's technical debt: log it and add a TODO comment in the code

The backlog is a transparent record of legitimate exceptions and work-in-progress, not a
place to hide violations.

**Run validation after styling changes:**

```bash
npm run ds:validate
```

This updates the backlog with current deviations. Review the diff before committing.

## Spacing token scales

Two complementary spacing scales exist:

- **Editorial/document-flow spacing** — semantic tokens for prose rhythm
  (`--md-sys-spacing-eyebrow-to-title`, `--md-sys-spacing-body-to-section`, etc.). Use for
  document flow between text blocks.
- **Component-level spacing** — the `--md-sys-spacing-ui-*` scale (`ui-xxs`=2px, `ui-xs`=4,
  `ui-sm`=8, `ui-md`=12, `ui-lg`=16, `ui-xl`=24, `ui-2xl`=32, `ui-3xl`=48, `ui-4xl`=64,
  `ui-5xl`=96). Use for `gap`/`padding`/`margin` inside components (buttons, tags, cards).

**Never use `--md-sys-shape-corner-*` tokens for spacing.** Shape tokens are for
`border-radius` only. Earlier code used corner tokens as spacing proxies (before the
`ui-*` scale existed); those have been migrated to `spacing-ui-*`. The `ui-*` scale has no
20px or 28px step — snap to the nearest (`ui-lg`/`ui-xl` or `ui-xl`/`ui-2xl`) and note the
decision.

## Image Handling

- **Raster images** (photos, screenshots): place in `src/assets/` and use `astro:assets`
  via the `<Figure>` component. Astro/sharp generates responsive srcset plus WebP
  conversions.
- **SVG images**: sharp does **not** resize or convert SVGs, so an SVG passed through
  `<Figure>` produces **no** responsive srcset and **no** WebP — it is emitted as-is. Never
  use an SVG to test or demonstrate the responsive image pipeline; use a raster source
  (`src/assets/placeholder-raster.jpg` exists for this). SVGs are fine for logos and icons,
  ideally inlined for styling control.

## References

- [`design-tokens.md`](design-tokens.md) — Token pipeline, alpha handling, color modes
- [`Agents/skills/design-tokens/SKILL.md`](../skills/design-tokens/SKILL.md) — Token
  regeneration workflow
- [`Docs/Design system/README.md`](../../Docs/Design%20system/README.md) — Human-facing
  Figma file list
- [`Code/ARCHITECTURE.md`](../../Code/ARCHITECTURE.md) — Component APIs, FOUC prevention,
  Vue island patterns, image optimization workflows
