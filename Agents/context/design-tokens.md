# Design Token Conventions

Durable conventions and gotchas for the token-driven design system in `Code/`. Load this before modifying token transforms or validation scripts.

## Opacity/Alpha Handling (CRITICAL)

Figma DTCG color tokens store opacity separately from the hex value. The `hex` field is **6-digit RGB only**; alpha lives in a separate `alpha` field.

**Structure:**
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

### The Bug

A naive transform that reads only `hex` will **silently drop opacity**, breaking 150+ tokens:

- All **State Layers** (every role × Opacity-08/10/16) used for hover/active/focus states
- All **Surface Tints** (5/8/11/12/14%) used for surface elevation

This makes interactive states invisible or wrong.

### The Solution

Custom color transform in `Code/tokens/build.mjs`:

- If `alpha === 1` → emit `hex` (e.g. `#2B638B`)
- If `alpha < 1` → emit modern `rgb(r g b / a)` syntax:
  - Extract RGB from `components` (float 0–1 → ×255, round)
  - Use raw `alpha` for slash-alpha
  - Example: `rgb(43 99 139 / 0.08)`

### The Regression Guard

The build includes an assertion that fails if any `alpha < 1` token loses its alpha channel. This prevents:

- Future token exports from reintroducing the bug
- Style Dictionary upgrades from breaking the transform
- Accidental refactoring from dropping alpha

**Never remove this guard.** If it fails, fix the transform, don't bypass the check.

## Token Namespace Conventions

All generated tokens follow MD3-style naming with kebab-case:

- **`--md-sys-color-*`** — System colors
- **`--md-sys-color-state-layers-*-opacity-*`** — Hover/active/focus overlays
- **`--md-sys-typescale-*`** — Typography scales
- **`--md-sys-shape-corner-*`** — Border radii
- **`--md-sys-spacing-*`** — Semantic editorial spacing
- **`--md-ref-font-*`** — Font family references

Figma token names with spaces/casing (`On Primary`, `Byline to Body`) are transformed to kebab-case with appropriate prefixes (`--md-sys-color-on-primary`, `--md-sys-spacing-byline-to-body`).

## Known Limitations

The token system covers **editorial/document-flow spacing** (eyebrow-to-title, body-to-section, etc.) but **not component-level padding** (button padding, tag padding, inline code padding).

These remain as raw values in components because no suitable semantic tokens exist in the MD3 system. They are documented in the deviations backlog as legitimate exceptions.

**Do not weaken lint rules to suppress these.** If future Figma exports add component-level spacing tokens, update the affected components and clear the backlog.

## Color Modes

- **Light** (default): `:root`
- **Dark**: `:root[data-theme="dark"]`
- **Medium contrast**: `[data-contrast="medium"]` (generated, not yet wired to UI)
- **High contrast**: `[data-contrast="high"]` (generated, not yet wired to UI)

Theme toggle via `ThemeToggle.vue`, which cycles System → Dark → Light (sets `data-theme` on `:root`; Dark/Light persist to localStorage, System clears it and follows `prefers-color-scheme`). FOUC is prevented by an inline script in `BaseLayout.astro` that reads localStorage and sets `data-theme` before first paint, and keeps System mode in sync with OS changes.

## Validation Philosophy

The design-system validation enforces strict token usage to prevent drift. All themed properties (color, spacing, radius, typography) must use CSS custom properties.

Deviations are tracked in `Docs/Design system/deviations-backlog.md` as a running to-do list. The backlog is **not** a place to hide violations — it's a transparent record of:

- Legitimate exceptions (no suitable token exists)
- Technical debt (to be fixed when time allows)
- Temporary workarounds (documented with rationale)

Run `npm run ds:validate` after any styling changes. Use `npm run ds:validate -- --strict` in CI to gate merges on zero deviations (once backlog is cleared).

## Style Dictionary Configuration

The token build config lives in `Code/tokens/build.mjs`. Key decisions:

- **DTCG parser**: `style-dictionary/parser` enabled for W3C format support
- **Custom transforms**: `name/kebab` (spaces → hyphens, add prefixes) and `color/opacity-safe` (preserve alpha)
- **Output**: CSS custom properties in `src/styles/tokens/*.css` (one file per token category)
- **Modes**: Color modes via `data-theme` and `data-contrast` attribute selectors

When modifying transforms:

1. Test with `npm run tokens:build`
2. Check `src/styles/tokens/` output
3. Verify the regression guard passes
4. Run `npm run build` to confirm Astro compiles
5. Review `git diff` for unexpected changes

## References

- [M3 Design Kit — DUNE](https://www.figma.com/design/2EI2pZLDxPwfU599jMX3F0/M3-Design-Kit----DUNE-?node-id=49823-12141) — Design library; tokens are exported from here
- [`design-system.md`](design-system.md) — Styling conventions and both Figma source files
- [`Docs/Design system/README.md`](../../Docs/Design%20system/README.md) — Human-facing Figma file list
- [`Code/ARCHITECTURE.md`](../../Code/ARCHITECTURE.md) — Full architecture documentation
- [`Agents/skills/design-tokens/SKILL.md`](../skills/design-tokens/SKILL.md) — Token regeneration workflow
- [`Docs/Design system/design-in-code architecture.md`](../../Docs/Design%20system/design-in-code%20architecture.md) — Design system guidelines
