# Design system

Figma sources for this prototype. Agents load the same links from
[`Agents/context/design-system.md`](../../Agents/context/design-system.md).

## Figma files

- **Site file** — pages and features to implement:
  [morgankeysdotcomv3](https://www.figma.com/design/lQxgrO3UI3zgsoe24YPXHA/morgankeysdotcomv3?node-id=69-3148)
- **Design library** — core styles; tokens are exported from here:
  [M3 Design Kit — DUNE](https://www.figma.com/design/2EI2pZLDxPwfU599jMX3F0/M3-Design-Kit----DUNE-?node-id=49823-12141)

Token export zips land in [`Figma tokens/`](Figma%20tokens/). After a new export, regenerate CSS with `npm run tokens` in `Code/` (see [`Agents/skills/design-tokens/SKILL.md`](../../Agents/skills/design-tokens/SKILL.md)).
