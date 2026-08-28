---
name: design-tokens
description: Regenerate design tokens from Figma exports and run design-system validation. Use when a new Figma token export arrives or when validating design-system compliance.
---

# Design Tokens & Validation

Workflow for regenerating CSS custom properties from Figma DTCG token exports and validating design-system compliance in the `Code/` prototype.

## When to use this skill

- A new Figma token export (`.zip`) has been added to `Docs/Design system/Figma tokens/`
- Token structure has changed (add/remove/rename tokens)
- Style Dictionary config in `Code/tokens/build.mjs` has been updated
- You need to validate design-system compliance (check for hardcoded colors, raw spacing, etc.)
- Before committing changes that affect component styling

## Regenerating Tokens from Figma

### 1. Place the new Figma export

New token exports should land in `Docs/Design system/Figma tokens/*.zip`. These are typically named like:

- `Color - Dark.zip`
- `Color - Light.zip`
- `Typescale - Baseline.zip`
- `Shape - Baseline.zip`
- `Spacing - Baseline.zip`

### 2. Run the token pipeline

```bash
cd Code/
npm run tokens
```

This runs two scripts sequentially:

1. **`tokens:unpack`** — Unzips all `.zip` files in `Docs/Design system/Figma tokens/` into `Docs/Design system/Figma tokens/unpacked/` (tracked in git for diffing)
2. **`tokens:build`** — Runs Style Dictionary to generate `src/styles/tokens/*.css` files

### 3. Review the changes

```bash
git diff src/styles/tokens/
```

Look for:
- New tokens added
- Token values changed (e.g. color, spacing, or typography updates)
- Token structure changes (might require component updates)

### 4. Verify the build

```bash
npm run build
```

The build will fail if:
- The opacity-safe color transform regression guard detects alpha loss (see below)
- Astro encounters invalid CSS or broken imports

### 5. Run validation

```bash
npm run ds:validate
```

This scans all components for design-system deviations and updates the backlog at `Docs/Design system/deviations-backlog.md`.

## Critical: Opacity/Alpha Gotcha

**This is the most important thing to understand about the token pipeline.**

Figma DTCG color tokens have this structure:

```json
{
  "$value": {
    "colorSpace": "srgb",
    "components": { "red": 0.168, "green": 0.388, "blue": 0.545 },
    "alpha": 0.08,
    "hex": "#2B638B"
  }
}
```

**The `hex` field contains ONLY 6-digit RGB.** Opacity lives in the separate `alpha` field.

### The Bug

A naive transform that reads only the `hex` field will **silently drop opacity**, breaking 150+ tokens:

- All **State Layers** (every role × Opacity-08/10/16)
- All **Surface Tints** (5%, 8%, 11%, 12%, 14%)

These tokens are used for hover states, active states, and surface elevation. Losing alpha makes these effects invisible or wrong.

### Our Solution

The custom color transform in `Code/tokens/build.mjs`:

1. If `alpha === 1` → emit `hex` (e.g. `#2B638B`)
2. If `alpha < 1` → emit modern `rgb(r g b / a)` syntax:
   - Extract RGB from `components` (float 0–1 → multiply by 255, round)
   - Use raw `alpha` for the slash-alpha
   - Example: `rgb(43 99 139 / 0.08)`

### The Regression Guard

The build includes an assertion that fails if any token with `alpha < 1` produces output without an alpha channel (no `rgb(.../ ...)` or 8-digit hex). This prevents:

- Future token exports from reintroducing the bug
- Style Dictionary upgrades from breaking the transform
- Accidental transform refactoring from dropping alpha

If the guard fails, the build will exit with an error listing the affected tokens. Fix the transform before proceeding.

## Design-System Validation

The codebase enforces strict token usage to prevent design-system drift. All color, spacing, border-radius, font-family, font-size, and other themed properties **must** use CSS custom properties from the token system.

### Running validation

```bash
cd Code/
npm run ds:validate
```

This scans all `src/**` files and checks for:

- **hardcoded-color** — Color property uses a literal hex/rgb/hsl/named color instead of `var(--md-…)`
- **raw-spacing** — Spacing property (margin/padding/gap) uses a raw length instead of `var(--md-sys-spacing-…)`
- **raw-border-radius** — Border-radius uses a raw length instead of `var(--md-sys-shape-corner-…)`
- **non-token-font-family** — font-family must resolve through `var(--md-ref-font-…)` or `var(--md-sys-typescale-*-font, …)`
- **raw-font-size** — font-size uses a raw length instead of `var(--md-sys-typescale-…)`
- **non-md-token** — CSS variable is not from the MD3 token namespace (`--md-sys-*` / `--md-ref-*`)
- **global-component-leak** — Component-level selector or styling detected in global.css

### Output

Validation writes/updates a running backlog at `Docs/Design system/deviations-backlog.md`, grouped by file with rule and line number.

**Example backlog entry:**

```markdown
### `src/components/Button.astro`

| Line | Rule | Detail |
| ---- | ---- | ------ |
| 49 | raw-spacing | `padding` uses a raw length: `0.625rem 1.5rem`. |
```

### Strict mode (CI gating)

```bash
npm run ds:validate -- --strict
```

Fails with exit code 1 if any deviations exist. Use this in CI/pre-commit hooks to gate merges.

### Known limitations

The token system covers **editorial/document-flow spacing** but not **component-level padding** (button padding, tag padding, inline code padding). These remain as raw values because no suitable semantic tokens exist in the MD3 system.

If future Figma exports add component-level spacing tokens, update the affected components and re-run validation to clear the backlog.

Do **not** weaken the lint rules to make violations disappear. Document legitimate exceptions in the backlog instead.

## Token Namespace

All generated tokens follow MD3-style naming:

- **`--md-sys-color-*`** — System colors (primary, background, surface, etc.)
- **`--md-sys-color-state-layers-*-opacity-*`** — Hover/active/focus state layers
- **`--md-sys-typescale-*`** — Typography scales (display, headline, title, body, label)
- **`--md-sys-shape-corner-*`** — Border radii (none → extra-extra-large → full)
- **`--md-sys-spacing-*`** — Semantic editorial spacing (eyebrow-to-title, body-to-section, etc.)
- **`--md-ref-font-*`** — Font family references (brand, plain, mono)

### Color modes

- **Light** (default): `:root`
- **Dark**: `:root[data-theme="dark"]`
- **Medium contrast**: `[data-contrast="medium"]` (generated, not yet wired to UI)
- **High contrast**: `[data-contrast="high"]` (generated, not yet wired to UI)

Toggle between light and dark with the `ThemeToggle.vue` component (flips `data-theme` attribute on `:root`, persists to localStorage).

## Troubleshooting

### Build fails with "alpha channel lost" error

The regression guard detected that one or more tokens with `alpha < 1` produced output without an alpha channel. Check `Code/tokens/build.mjs` and ensure the color transform emits `rgb(r g b / a)` for alpha-bearing tokens.

### Validation reports false positives

If a raw value is genuinely necessary (e.g. component padding with no semantic token), document it in the backlog and leave the deviation in place. Do not weaken the lint rules.

### Token changes break components

Run `npm run ds:validate` to find affected components. Update them to use the new token names/values, then re-run validation to confirm.

### New tokens don't appear in CSS

1. Verify the `.zip` file is in `Docs/Design system/Figma tokens/`
2. Run `npm run tokens:unpack` and check `Docs/Design system/Figma tokens/unpacked/`
3. Run `npm run tokens:build` and check `src/styles/tokens/`
4. If still missing, check the token's `$type` field — only `color`, `dimension`, `fontFamily`, `fontWeight`, `number`, and `string` types are currently supported

## References

- [Style Dictionary documentation](https://amzn.github.io/style-dictionary/)
- [W3C DTCG spec](https://tr.designtokens.org/format/)
- [Material Design 3 token reference](https://m3.material.io/foundations/design-tokens/overview)
- [`Code/ARCHITECTURE.md`](../../../Code/ARCHITECTURE.md) — Full architecture documentation
- [`Docs/Design system/design-in-code architecture.md`](../../../Docs/Design%20system/design-in-code%20architecture.md) — Design system guidelines
