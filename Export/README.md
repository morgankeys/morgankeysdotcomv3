Kit drop zone for generated artifacts that are staged for transfer somewhere else.

- `design-system/` — the design system packaged for other prototyping platforms (DESIGN.md, Lovable, Replit, Bolt.new, v0, Figma Make). Generate it with `npm run ds:export` in `Code/`; each platform folder has a README with import steps. It is gitignored, so regenerate it rather than expecting it in a fresh clone. See `Agents/skills/design-system-export/SKILL.md`.

The site itself does not build here. It deploys to Vercel straight from `Code/dist/` (see `Code/README.md`).
