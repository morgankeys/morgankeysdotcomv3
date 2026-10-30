# Design system

Figma sources for this prototype. Agents load the same links from
[`Agents/context/design-system.md`](../../Agents/context/design-system.md).

## Figma files

- **Site file** — pages and features to implement:
  [morgankeysdotcomv3](https://www.figma.com/design/lQxgrO3UI3zgsoe24YPXHA/morgankeysdotcomv3?node-id=69-3148)
- **Design library** — core styles; tokens are exported from here:
  [M3 Design Kit — DUNE](https://www.figma.com/design/2EI2pZLDxPwfU599jMX3F0/M3-Design-Kit----DUNE-?node-id=49823-12141)

Token export zips land in [`Figma tokens/`](Figma%20tokens/). Typography is exported as one
`Typescale.zip` containing UI and Editorial roles in Baseline, Compact, Medium, and
Expanded modes. Baseline preserves the original design scale; the site ships the three
responsive modes. `Spacing.zip` uses the same four modes: semantic Editorial rhythm varies
by window class, while the UI scale and breakpoint constants stay fixed. Shape remains
Baseline-only because Material 3's corner-radius scale is not responsive. Before exporting
Typescale, run the line-height recompute script in that folder through Figma MCP. After a
new export, regenerate CSS with `npm run tokens` in `Code/` (see
[`Agents/skills/design-tokens/SKILL.md`](../../Agents/skills/design-tokens/SKILL.md)).
