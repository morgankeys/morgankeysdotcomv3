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
by window class, and responsive UI roles expand from Medium upward. Those UI roles alias
the fixed Material-derived references in the single-mode `Scale.zip`; breakpoint constants
stay fixed. Shape remains Baseline-only because Material 3's corner-radius scale is not
responsive. Before exporting Typescale, run the line-height recompute script in that folder
through Figma MCP. After a new export, regenerate CSS with `npm run tokens` in `Code/` (see
[`Agents/skills/design-tokens/SKILL.md`](../../Agents/skills/design-tokens/SKILL.md)).

## Dune mismatches

Places where a Dune Figma component and the code disagree, logged instead of fixed. Each
entry says which side is thought to be right; remove it once Dune or the code is updated.
Unlike [`deviations-backlog.md`](deviations-backlog.md), this list is written by hand,
because the validator can't see component-level differences.

- **Case study overlay header** — the code sets the title, then the company and date line
  under it; Dune's Editorial / Article header puts that line above the title as an eyebrow.
  Thought right: the code. Update Dune.
- **Responsive component padding** — Button, Chip, and TextField padding uses the
  responsive `ui-*` spacing roles, which grow at Medium and Expanded; Dune's components use
  fixed padding. Thought right: the code. Update Dune.
- **Extended FAB padding** — Dune pads the medium and large extended FABs by 26px and 28px;
  the code uses 24px (`ui-xl`) for both, since the spacing scale has no 26 or 28 step.
  Thought right: the code. Update Dune.
- **Text field desktop height** — 56px on phones in both, but the code grows to 74px
  (outlined) and 66px (filled) at 1100px. Undecided.
- **Text field error border** — the code keeps an invalid field's border at 1px until it is
  focused (Material 3's rule); Dune's Error variant shows 3px. Undecided; leaning toward
  the code.
