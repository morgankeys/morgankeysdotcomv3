# How each platform ingests a design system

Research notes behind the export targets, from each platform's own documentation
(read November 2026). These products change quickly: re-read the linked page before
changing a target, and update this file when you do.

## DESIGN.md (Google)

- Open format from Google Labs, spec version `alpha`. Reference consumer is Stitch; AI
  Studio and most coding agents read it as plain context.
- **Front matter (YAML):** `version`, `name`, `description`, `colors`, `typography`,
  `rounded`, `spacing`, `components`. Colors are any CSS color (hex recommended).
  Dimensions take `px`, `em`, or `rem`. Typography objects use `fontFamily`, `fontSize`,
  `fontWeight`, `lineHeight`, `letterSpacing`. A `primary` color is required.
- **References:** `{colors.primary}`, by full path. Component properties:
  `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`,
  `width`. Variants and states are separate keys (`button-primary-hover`).
- **Body:** `##` sections in a fixed order — Overview, Colors, Typography, Layout,
  Elevation & Depth, Shapes, Components, Do's and Don'ts. Extra sections are allowed;
  duplicate headings are an error.
- No concept of color modes or responsive values, so the export puts the light theme and
  widest window class in the front matter and documents the rest in the body.
- Source: <https://github.com/google-labs-code/design.md/blob/main/docs/spec.md>

## Lovable

- A design system is a dedicated Lovable project marked as one. React libraries only.
  All paid plans. Wrapping an existing npm package directly is Enterprise-only.
- **Sources:** a public npm package, a public Git URL, or uploaded files. No private
  repository fetch.
- **Discovery:** tokens from CSS custom properties in top-level style files
  (`src/index.css`, `src/styles/tokens.css`) or a Tailwind config; components from the
  `src/index.ts(x)` barrel, else `src/components/`.
- **Release** generates `.lovable/design-system.json` and docs. `.lovable/system.md` is
  hand-authored and never overwritten; `.lovable/rules/*.md` always propagates.
- **Attach** copies `src/` (minus pages, routes, stories, tests, `App.tsx`, `main.tsx`)
  and `.lovable/` into the consumer at `src/design-system/<slug>/` and
  `.lovable/rules/libraries/<slug>/`. Updates re-run the copy.
- **Lighter route:** Instructions (workspace, project, personal), 10,000 characters each,
  all plans. Lovable also reads a top-level `AGENTS.md` on every message.
- Sources: <https://docs.lovable.dev/features/design-systems>,
  <https://docs.lovable.dev/features/knowledge>

## Replit

- **Agent customization:** skills are folders with a `SKILL.md` (name + description
  front matter, per agentskills.io) under `.agents/skills/` in a project, or added in
  Workspace Settings (also importable from a public GitHub repo). Custom instructions
  load on every message (Pro and Enterprise). Project context goes in `replit.md`.
- **Replit Design:** creates a design system from a prompt plus sources — a Figma URL, a
  website, code, images, or an existing `DESIGN.md` — and stores tokens in `tokens.json`
  feeding CSS variables. It re-derives the system rather than importing it verbatim.
- Sources: <https://docs.replit.com/teams/custom-design-system>,
  <https://docs.replit.com/features/agent/skills>,
  <https://docs.replit.com/design/create-a-design-system>,
  <https://docs.replit.com/design/design-md>

## Bolt.new

- Team design systems are compiled by Bolt from sources: **NPM** (public name or `.tgz`
  upload; private registries supported), **GitHub** (public repos), **Files** (up to 10;
  folders as `.zip`), **Storybook**, **Websites**. Packages and repos give real
  components; docs alone give only a theme.
- Optional **Agent Instructions** steer the compile. Takes 45–60 minutes; produces a
  Storybook. Paid Team plan; 10 adds or syncs per week.
- Sources: <https://support.bolt.new/building/design-system/add-design-system>,
  <https://support.bolt.new/building/design-system/use-design-system>

## v0

- **Design Systems 2.0** (<https://v0.app/design-systems>): import from GitHub repos,
  Figma frames, links, or attachments (ZIP, `.tgz`). Optional notes cover globals,
  providers, fonts, deprecated components. v0 builds a starter app for review, then saves
  the system as a skill (team or personal). Team default is a paid, owner-only setting.
- **Legacy:** a shadcn registry (`registry.json`, built items under `/r/*.json`;
  `registry:theme` items carry `cssVars` with `theme` / `light` / `dark`).
- **Open in v0** (`https://v0.dev/chat/api/open?url=…`) ignores `cssVars`, `css`, and
  `envVars`, so it cannot carry tokens.
- Sources: <https://v0.app/docs/design-systems-2>,
  <https://ui.shadcn.com/docs/registry/registry-item-json>,
  <https://ui.shadcn.com/docs/registry/open-in-v0>

## Figma Make

- A **Make kit** bundles npm packages, optional Figma library styles, and guidelines.
  Professional plans and up.
- **Package:** must work with Vite and be published — public npm, or the organization's
  Figma-hosted private registry (admin creates a scope under Admin → Resources → npm
  registry and copies an `.npmrc` snippet). No workspace dependencies; public
  dependencies are fine.
- **Guidelines:** a `guidelines/` folder authored in the kit. `Guidelines.md` is the
  entry point and the only file read unconditionally; it should route to many short
  files (setup, tokens, one per component). Imperative, specific, with code.
- Kits flatten Figma variables to raw values, so shipping tokens as CSS in the package
  is more faithful than adding the Figma library.
- Sources: <https://help.figma.com/hc/articles/43602872461079>,
  <https://help.figma.com/hc/articles/43602393097239>,
  <https://help.figma.com/hc/en-us/articles/39241689698839>
