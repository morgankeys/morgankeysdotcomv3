---
name: design-system-export
description: Export this kit's design system (tokens, components, usage rules) into the formats other AI prototyping platforms ingest — DESIGN.md, Lovable, Replit, Bolt.new, v0, and Figma Make. Use when asked to export, package, or share the design system, to try the system in another tool, or to add a new export target.
---

# Design-system export

Turns the design system the prototype in `Code/` already uses into ready-to-import
packages for other prototyping platforms. One command, one output folder per platform,
each with a README listing the exact import steps.

## Run it

```bash
cd Code/
npm run tokens      # only if src/styles/tokens/ is missing (it is gitignored)
npm run ds:export   # every target
```

```bash
npm run ds:export -- lovable v0   # only some targets
npm run ds:export -- --list       # show targets
```

Output goes to `Export/design-system/<target>/` (gitignored; regenerate, never edit).
Other flags: `--out <dir>`, `--config <file>`, `--no-archives`.

## Targets

| Target | What it produces | How the platform takes it |
| --- | --- | --- |
| `design-md` | `DESIGN.md` in Google's format | Attach or paste in AI Studio; import in Stitch; commit at a repo root |
| `lovable` | A Vite + React + Tailwind design-system project (zip) with `.lovable/` knowledge, plus a 10,000-character Instructions fallback | Upload into a Lovable design-system project and release |
| `replit` | An Agent skill (`.agents/skills/…`) carrying the source, a `replit.md` block, custom instructions, and a `DESIGN.md` seed | Copy into a Repl, add as a workspace skill, or seed Replit Design |
| `bolt` | npm tarball, source zip, agent instructions, single-project prompt | Team design-system import (NPM + Files sources) |
| `v0` | Source zip with a shadcn registry, npm tarball, import notes | Design Systems import at v0.app/design-systems |
| `figma-make` | A built, publishable npm package and a `guidelines/` folder | Publish the package, add it and the guidelines to a Make kit |

How each platform ingests a design system, with sources, is in
[`platforms.md`](platforms.md). Re-read the platform's docs before changing a target:
these products change quickly.

## How it is put together

```
Agents/skills/design-system-export/scripts/   the engine — same for every kit
  export.mjs        CLI
  model.mjs         reads the kit's CSS into one normalized model
  builders/         css.mjs · docs.mjs · react.mjs — shared output pieces
  targets/          one module per platform
Code/design-export/                           this prototype's adapter
  config.mjs        token sources, modes, role meanings, mappings, components, guidance
  react/*.tsx       React ports of the shipped components
```

- **The model is built from the generated token CSS**, not the Figma JSON. The CSS is
  what the prototype ships, so an export cannot drift from it, and alpha, units, and
  responsive modes are already resolved.
- **Component styles are not ported.** The exporter lifts each component's `<style>`
  block out of the `.vue` / `.astro` file. Only the markup is ported, in
  `Code/design-export/react/`. Those files must mirror the original template's class
  names and `data-*` attributes exactly.
- **Everything design-system-specific is in `config.mjs`**: what each color and type
  role is for, the shadcn/ui and Tailwind mappings, DESIGN.md component specs, and the
  prose (principles, do's and don'ts, recipes). The engine has no opinions about DUNE.

## When the design system changes

| Change | What to do |
| --- | --- |
| Token values, new tokens | `npm run tokens`, then `npm run ds:export`. New color and type roles appear automatically; add a usage line in `guidance.colorRoles` / `guidance.typeRoles` |
| A shipped component's styles | Re-export. Nothing else |
| A shipped component's template or props | Update its port in `react/` and its `props` in `config.mjs` to match |
| A new component worth shipping | Add `react/<Name>.tsx` and a `components` entry (source, props, usage, showcase, notes) |
| Guidance | Edit `guidance` in `config.mjs`. The Lovable and Bolt condensed prompts must stay under 10,000 characters; the export fails if they do not |

Bump `version` in `config.mjs` before publishing the npm package again.

## Verify an export

The export only fails on structural problems (missing sources, unknown token references,
TypeScript errors in a port, oversized prompts). After a meaningful change, also:

1. Build the generated project and look at it in both themes:
   ```bash
   cp -R Export/design-system/lovable/project /tmp/ds && cd /tmp/ds && npm install && npm run dev
   ```
   Its page is a living style guide. Compare it with the real site.
2. Lint the DESIGN.md with Google's CLI: `npx @google/design.md lint Export/design-system/design-md/DESIGN.md`.

## Adding a platform

1. Read the platform's current docs and add a section to `platforms.md`.
2. Add `scripts/targets/<id>.mjs` exporting `{ id, title, summary, build(model) }`.
   `build` returns `{ files, archives?, next? }`: `files` is a path → content map, so a
   target never touches the disk. Compose it from the builders; add to a builder rather
   than formatting tokens inside a target.
3. Register it in `scripts/targets/index.mjs` and add a row to the table above.
4. Write the target's README from the user's side: what each file is, then numbered steps
   using the platform's own UI labels.

## Using this in another kit

Copy this skill folder. Create `Code/design-export/config.mjs` for that kit's tokens
(any CSS-custom-property system works; set the prefixes and mode selectors) and port its
components into `react/`. Add the `ds:export` script and ignore `Export/design-system/`.
