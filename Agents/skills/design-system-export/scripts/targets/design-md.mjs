// DESIGN.md — Google's open format (github.com/google-labs-code/design.md):
// YAML front matter of tokens plus a fixed order of prose sections. Read by
// Google Stitch and AI Studio, accepted as a seed by Replit Design, and
// understood by most coding agents when left at a repo root.
import { yaml, GENERATED_NOTE } from "../lib/util.mjs";
import { parseColor } from "../lib/color.mjs";
import { googleFontsUrl } from "../builders/css.mjs";
import {
  overviewSection,
  colorSection,
  typographySection,
  layoutSection,
  elevationSection,
  shapeSection,
  dosAndDontsSection,
  recipesSection,
  componentSection,
} from "../builders/docs.mjs";

const unquote = (s) => s.replace(/^["']|["']$/g, "");

export function designMd(model) {
  const spec = model.config.designMd ?? {};
  const windowMode = spec.windowMode ?? model.defaultWindowMode;

  // The format has no color modes, so the front matter carries the default
  // mode and the body documents the rest.
  const colors = {};
  for (const c of model.coreColors) {
    const value = c.values[model.defaultColorMode];
    if (parseColor(value)?.a === 1) colors[c.key] = c.hex[model.defaultColorMode];
  }
  for (const b of model.brand) colors[`brand-${b.key}`] = b.value.toUpperCase();

  const wanted = spec.typography ?? model.typography.map((r) => r.id);
  const typography = {};
  for (const id of wanted) {
    const role = model.typography.find((r) => r.id === id);
    if (!role) throw new Error(`designMd.typography lists unknown role "${id}"`);
    const v = role.modes[windowMode];
    typography[id] = {
      fontFamily: unquote(v.fontFamily),
      fontSize: v.fontSize,
      fontWeight: Number(v.fontWeight),
      lineHeight: Number(v.lineHeight),
      ...(v.letterSpacing && parseFloat(v.letterSpacing) !== 0
        ? { letterSpacing: v.letterSpacing }
        : {}),
    };
  }

  const rounded = Object.fromEntries(model.shape.map((s) => [s.key, s.value]));
  const spacing = Object.fromEntries(model.spacing.ui.map((s) => [s.short, s.modes[windowMode]]));

  const tree = { colors, typography, rounded, spacing };
  const components = spec.components ?? {};
  for (const [name, props] of Object.entries(components))
    for (const value of Object.values(props)) {
      const ref = /^\{(.+)\}$/.exec(value)?.[1];
      if (ref && ref.split(".").reduce((node, key) => node?.[key], tree) === undefined)
        throw new Error(`designMd component "${name}" references missing token {${ref}}`);
    }

  const front = yaml({
    version: "alpha",
    name: model.name,
    description: model.description,
    colors,
    typography,
    rounded,
    spacing,
    ...(Object.keys(components).length ? { components } : {}),
  });

  const fonts = googleFontsUrl(model);
  const dark = model.darkMode;
  const rootBlock = (mode) =>
    model.coreColors.map((c) => `  ${c.name}: ${c.hex[mode]};`).join("\n");
  const darkSelector = dark
    ? (model.colorModes.find((m) => m.id === dark).exportSelector ?? model.colorModes.find((m) => m.id === dark).selector)
    : null;

  return `---
${front}
---

# ${model.name}

<!-- ${GENERATED_NOTE(model)} -->

## Overview

${overviewSection(model)}

## Colors

The front matter holds the light theme. Every role also has a dark value, listed here, and the two themes must always ship together.

${colorSection(model)}

## Typography

Front matter sizes are the ${windowMode} (widest) window class.

${typographySection(model)}

## Layout

Front matter spacing is the ${windowMode} window class.

${layoutSection(model)}

## Elevation & Depth

${elevationSection(model)}

## Shapes

${shapeSection(model)}

## Components

${model.components.map((c) => `### ${c.name}\n\n${componentSection(model, c, { importFrom: model.package.name })}`).join("\n\n")}

### Everything else

Build other elements from tokens, following these recipes.

${recipesSection(model)}

## Do's and Don'ts

${dosAndDontsSection(model)}

## Implementation

Define the tokens as CSS custom properties and reference them everywhere. This block is enough to start; add the remaining roles from the tables above as you need them.

\`\`\`css
${fonts ? `@import url("${fonts}");\n\n` : ""}:root {
${rootBlock(model.defaultColorMode)}
${model.fonts.map((f) => `  ${f.variable}: "${f.family}", ${f.fallback};`).join("\n")}
${model.shape.map((s) => `  ${s.name}: ${s.value};`).join("\n")}
${model.spacing.ui.map((s) => `  ${s.name}: ${s.modes[model.defaultWindowMode]};`).join("\n")}
}
${dark ? `\n${darkSelector.replace(", ", ",\n")} {\n${rootBlock(dark)}\n}\n` : ""}\`\`\`
`;
}

export default {
  id: "design-md",
  title: "DESIGN.md",
  summary: "Google's DESIGN.md format. For AI Studio, Stitch, and any agent that reads a repo.",
  build(model) {
    return {
      files: { "DESIGN.md": designMd(model) },
      next: [
        "AI Studio: attach DESIGN.md to the prompt in Build mode, or paste it into System instructions, and ask it to follow the file.",
        "Stitch: import DESIGN.md as the project's design system.",
        "Any repo-reading agent: commit DESIGN.md at the repository root.",
        "Validate after changes: npx @google/design.md lint DESIGN.md",
      ],
    };
  },
};
