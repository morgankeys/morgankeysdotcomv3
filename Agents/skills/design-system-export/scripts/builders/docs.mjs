// Agent-facing documentation, generated from the model. Every platform wants
// roughly the same knowledge under a different file name, so each target picks
// sections from here and decides where they go.
//
// Written for a coding agent that has never seen the kit: imperative, specific,
// names the exact token to use, and shows code.
import { table } from "../lib/util.mjs";

const code = (s) => `\`${s}\``;

const toPx = (value) => {
  const m = /^(-?[\d.]+)rem$/.exec(value ?? "");
  return m ? `${+(parseFloat(m[1]) * 16).toFixed(2)}px` : value;
};

const unquote = (s) => (s ?? "").replace(/^["']|["']$/g, "");

const bullets = (items = []) => items.map((i) => `- ${i}`).join("\n");

// ------------------------------------------------------------- sections ---

export function overviewSection(model) {
  const g = model.guidance;
  return [
    ...(g.overview ?? [model.description]),
    g.principles?.length ? `### Principles\n\n${bullets(g.principles)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function colorSection(model, { states = true } = {}) {
  const dark = model.darkMode;
  const rows = model.coreColors.map((c) => [
    code(c.key),
    code(c.name),
    c.hex[model.defaultColorMode],
    ...(dark ? [c.hex[dark]] : []),
    c.usage,
  ]);
  const head = ["Role", "CSS variable", "Light", ...(dark ? ["Dark"] : []), "Use for"];
  const parts = [table(head, rows)];

  if (model.brand.length) {
    parts.push(
      "### Brand tones\n\nFixed colors that do not change with the theme.",
      table(
        ["Tone", "CSS variable", "Value"],
        model.brand.map((b) => [code(b.key), code(b.name), b.value.toUpperCase()]),
      ),
    );
  }

  const stateLayers = model.colors.filter((c) => c.group === "stateLayers");
  if (states && stateLayers.length) {
    const sample = stateLayers.find((c) => /on-surface-opacity-08$/.test(c.key)) ?? stateLayers[0];
    const roles = [
      ...new Set(stateLayers.map((c) => c.key.replace(/^state-layers-|-opacity-\d+$/g, ""))),
    ];
    parts.push(
      `### State layers\n\nTranslucent overlays for hover, focus, and pressed states, one set per content role. Pattern: ${code(sample.name.replace(/on-surface-opacity-08$/, "<role>-opacity-<08|10|16>"))}. Available roles: ${roles.map(code).join(", ")}.`,
    );
  }

  if (model.guidance.colorNotes?.length)
    parts.push(`### Rules\n\n${bullets(model.guidance.colorNotes)}`);
  if (dark) {
    const mode = model.colorModes.find((m) => m.id === dark);
    parts.push(
      `### Dark mode\n\nDark values apply under ${code((mode.exportSelector ?? mode.selector).split(", ").join("` or `"))}. Because every role keeps its name, components written against the variables need no dark-specific styles.`,
    );
  }
  return parts.join("\n\n");
}

export function typographySection(model) {
  const windows = model.windowModes;
  const first = windows[0].id;
  const fonts = table(
    ["Family", "CSS variable", "Weights", "Use for"],
    model.fonts.map((f) => [f.family, code(f.variable), f.weights.join(", "), f.use]),
  );
  const roles = table(
    [
      "Role",
      "Font",
      `Size (${windows.map((w) => w.label.toLowerCase()).join(" / ")})`,
      "Weight",
      "Line height",
      "Use for",
    ],
    model.typography.map((r) => {
      const sizes = [...new Set(windows.map((w) => toPx(r.modes[w.id].fontSize)))];
      return [
        code(r.id),
        unquote(r.modes[first].fontFamily),
        sizes.join(" / "),
        r.modes[first].fontWeight,
        r.modes[first].lineHeight,
        r.usage,
      ];
    }),
  );
  const sample = model.typography.find((r) => r.id === "headline-small") ?? model.typography[0];
  const vars = Object.values(sample.vars).map((v) => `  ${v}`).join("\n");
  const breakpoints = windows
    .slice(1)
    .map((w) => `${w.label.toLowerCase()} from ${w.from}`)
    .join(", ");
  return [
    fonts,
    "### Type roles",
    roles,
    `Each role is a set of variables, for example ${code(sample.id)}:\n\n\`\`\`\n${vars}\n\`\`\`\n\nApply a whole role with the class ${code(`type-${sample.id}`)} (one exists for every role), or set the five properties from the role's variables. Sizes switch by window class (${breakpoints}).`,
    model.guidance.typeNotes?.length ? `### Rules\n\n${bullets(model.guidance.typeNotes)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function layoutSection(model) {
  const windows = model.windowModes;
  const perMode = (t) => [...new Set(windows.map((w) => t.modes[w.id]))].join(" / ");
  const parts = [];
  if (model.spacing.ui.length)
    parts.push(
      `### UI spacing\n\nValues are ${windows.map((w) => w.label.toLowerCase()).join(" / ")} where they differ.`,
      table(
        ["Step", "CSS variable", "Value"],
        model.spacing.ui.map((s) => [code(s.short), code(s.name), perMode(s)]),
      ),
    );
  if (model.spacing.editorial.length)
    parts.push(
      "### Editorial spacing\n\nVertical rhythm between blocks of long-form text.",
      table(
        ["Token", "Value"],
        model.spacing.editorial.map((s) => [code(s.name), perMode(s)]),
      ),
    );
  if (model.spacing.breakpoints.length)
    parts.push(
      "### Breakpoints",
      table(
        ["Name", "CSS variable", "Value"],
        model.spacing.breakpoints.map((s) => [code(s.short), code(s.name), s.value]),
      ),
      "CSS cannot read a variable inside a media query, so repeat the literal there.",
    );
  if (model.guidance.layout?.length) parts.push(`### Rules\n\n${bullets(model.guidance.layout)}`);
  return parts.join("\n\n");
}

export function elevationSection(model) {
  const parts = [];
  if (model.guidance.elevation?.length) parts.push(bullets(model.guidance.elevation));
  if (model.elevation.length)
    parts.push(
      table(
        ["CSS variable", "Value"],
        model.elevation.map((e) => [code(e.name), code(e.value)]),
      ),
    );
  return parts.join("\n\n");
}

export function shapeSection(model) {
  return [
    table(
      ["Step", "CSS variable", "Value"],
      model.shape.map((s) => [code(s.key), code(s.name), s.value]),
    ),
    model.guidance.shapes?.length ? bullets(model.guidance.shapes) : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function dosAndDontsSection(model) {
  const g = model.guidance;
  return [
    g.dos?.length ? `**Do**\n\n${bullets(g.dos)}` : "",
    g.donts?.length ? `**Don't**\n\n${bullets(g.donts)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function recipesSection(model) {
  return (model.guidance.recipes ?? [])
    .map((r) => `- **${r.name}.** ${r.body}`)
    .join("\n");
}

export function componentSection(model, component, { importFrom }) {
  const props = table(
    ["Prop", "Type", "Default", "Notes"],
    component.props.map((p) => [
      code(p.name),
      code(p.type),
      p.default ? code(p.default) : "",
      p.description ?? "",
    ]),
  );
  return [
    component.summary,
    `\`\`\`tsx\nimport { ${component.name} } from "${importFrom}";\n\n${component.usage}\n\`\`\``,
    props,
    "Also accepts standard HTML attributes (`className`, `onClick`, `aria-*`, …).",
    component.notes?.length ? bullets(component.notes) : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function componentIndex(model) {
  return model.components.map((c) => `- ${code(c.name)}: ${c.summary}`).join("\n");
}

// ------------------------------------------------------------ documents ---

/** The full token reference as one document. */
export function tokensDoc(model) {
  return `# ${model.name} design tokens

Every value below is a CSS custom property. Reference the variable; never copy the value.

## Color

${colorSection(model)}

## Typography

${typographySection(model)}

## Layout and spacing

${layoutSection(model)}

## Shape

${shapeSection(model)}

## Elevation

${elevationSection(model)}
`;
}

export function componentsDoc(model, options) {
  return `# ${model.name} components

${model.components
  .map((c) => `## ${c.name}\n\n${componentSection(model, c, options)}`)
  .join("\n\n")}

## Building anything else

The library is deliberately small. Build every other element from tokens, following these recipes, so it matches the shipped components.

${recipesSection(model)}
`;
}

export function rulesDoc(model) {
  return `# ${model.name} rules

${overviewSection(model)}

## Do's and don'ts

${dosAndDontsSection(model)}
`;
}

/**
 * A single always-on instruction block, for platforms whose only hook is a
 * size-limited text field. Kept well under `limit` characters; the full
 * references are linked from wherever the target puts them.
 */
export function compactInstructions(model, { importFrom, setup, references, limit = 10000 }) {
  const g = model.guidance;
  const pick = (keys) =>
    model.coreColors
      .filter((c) => keys.includes(c.key))
      .map((c) => `${code(c.name)} ${c.hex[model.defaultColorMode]}${model.darkMode ? ` / ${c.hex[model.darkMode]}` : ""} — ${c.usage}`);
  const essentials = [
    "surface", "on-surface", "on-surface-variant", "surface-container-low",
    "surface-container", "surface-container-high", "primary", "on-primary",
    "secondary-container", "on-secondary-container", "outline", "outline-variant",
    "error", "on-error",
  ];
  const typeEssentials = [
    "display-small", "headline-large", "headline-small", "title-medium",
    "body-large", "body-medium", "label-large", "label-medium", "title",
    "standfirst", "eyebrow", "caption", "metric",
  ];
  const type = model.typography
    .filter((r) => typeEssentials.includes(r.id))
    .map((r) => `${code(`type-${r.id}`)} — ${r.usage}`);
  const first = model.windowModes[0].id;
  const text = `# ${model.name} design system

Always build UI with the ${model.name} design system. ${model.description}

${setup ? `## Setup\n\n${setup}\n\n` : ""}## Principles

${bullets(g.principles)}

## Color (light / dark)

${bullets(pick(essentials))}

${bullets((g.colorNotes ?? []).slice(0, 3))}

## Type

Fonts: ${model.fonts.map((f) => `${f.family} (${code(f.variable)}) for ${f.use.replace(/\.$/, "").toLowerCase()}`).join("; ")}.

Apply a role with its class:

${bullets(type)}

${bullets((g.typeNotes ?? []).slice(0, 2))}

## Spacing and shape

- Spacing: ${model.spacing.ui.map((s) => `${code(s.name)} ${s.modes[first]}`).join(", ")}.
- Radius: ${model.shape.map((s) => `${code(s.name)} ${s.value}`).join(", ")}.
${bullets([...(g.shapes ?? []).slice(0, 2), ...(g.elevation ?? []).slice(0, 2)])}

## Components

Import from ${code(importFrom)} and use these instead of building your own:

${componentIndex(model)}

Build everything else from tokens:

${recipesSection(model)}

## Do's and don'ts

${dosAndDontsSection(model)}
${references ? `\n${references}\n` : ""}`;
  if (text.length > limit)
    throw new Error(
      `Compact instructions are ${text.length} characters; the limit is ${limit}. Trim the config's guidance.`,
    );
  return text;
}

// ------------------------------------------------------- guideline sets ---

/** Setup instructions when the system is installed as an npm package. */
export function packageSetup(model) {
  const name = model.package.name;
  return `Install \`${name}\` and import its stylesheet once, at the app entry, before any other styles:

\`\`\`tsx
import "${name}/styles.css";
\`\`\`

That one file loads the web fonts, every design token for light and dark, base typography, the \`.type-<role>\` classes, and the component styles. It does not need Tailwind.

If the project uses Tailwind CSS v4, do not import \`styles.css\`. Use the Tailwind entry in the global stylesheet instead, in exactly this order, so utilities and shadcn/ui components resolve to the tokens:

\`\`\`css
@import "${name}/fonts.css";
@import "tailwindcss";
@import "${name}/tailwind.css";
\`\`\`

Then delete any default \`:root { --background: … }\` and \`.dark { … }\` variable blocks, which would override the theme.

Import components from the package root:

\`\`\`tsx
import { ${model.components.map((c) => c.name).join(", ")} } from "${name}";
\`\`\`

Switch to dark mode by adding \`class="dark"\` (or \`data-theme="dark"\`) to \`<html>\`.`;
}

/** Setup instructions when the system's source lives inside the project. */
export function sourceSetup(model, { stylesPath, importFrom }) {
  const rel = (p) => (p.startsWith("src/") ? "./" + p.slice(4) : p);
  const fontsPath = stylesPath.replace(/index\.css$/, "fonts.css");
  return `The design system's source is in this project, with its styles in \`${stylesPath.replace(/\/index\.css$/, "/")}\`. Import them once in the global stylesheet (\`src/index.css\` or \`app/globals.css\`; adjust the relative paths), in exactly this order:

\`\`\`css
@import "${rel(fontsPath)}";
@import "tailwindcss";
@import "${rel(stylesPath)}";
\`\`\`

The fonts must come before Tailwind and the rest after it. Together they load the web fonts, every design token for light and dark, base typography, the \`.type-<role>\` classes, and a Tailwind v4 theme that maps the tokens onto utilities and onto the shadcn/ui variable names. Delete any default \`:root { --background: … }\` and \`.dark { … }\` variable blocks, which would override it.

Import components from \`${importFrom}\`:

\`\`\`tsx
import { ${model.components.map((c) => c.name).join(", ")} } from "${importFrom}";
\`\`\`

Switch to dark mode by adding \`class="dark"\` (or \`data-theme="dark"\`) to \`<html>\`.`;
}

export function tailwindSection(model) {
  const sample = model.spacing.ui.find((s) => s.short === "lg") ?? model.spacing.ui[0];
  const shadcn = new Set(Object.keys(model.shadcn.colors ?? {}));
  const roleUtilities = model.coreColors
    .filter((c) => !shadcn.has(c.key))
    .slice(0, 4)
    .map((c) => `\`${c.key.startsWith("on-") ? "text" : "bg"}-${c.key}\``);
  const brand = model.brand.find((b) => !b.key.startsWith("on-"));
  if (brand) roleUtilities.push(`\`bg-brand-${brand.key}\``);
  const radius = Object.entries(model.config.tailwind?.radius ?? {})
    .filter(([step]) => ["sm", "md", "lg", "2xl"].includes(step))
    .map(([step, key]) => {
      const token = model.shape.find((t) => t.key === key);
      return `\`rounded-${step}\`${token ? ` (${token.value})` : ""}`;
    });
  const display = model.fonts.find((f) => f.role === "brand");
  const escape = model.coreColors.find((c) => shadcn.has(c.key)) ?? model.coreColors[0];
  return `With the Tailwind theme loaded, prefer these utilities over arbitrary values:

- **Color:** shadcn names (\`bg-background\`, \`text-foreground\`, \`bg-card\`, \`bg-primary text-primary-foreground\`, \`text-muted-foreground\`, \`border-border\`)${roleUtilities.length ? ` and ${model.name} role names (${roleUtilities.join(", ")})` : ""}.
${sample ? `- **Spacing:** \`p-ui-${sample.short}\`, \`gap-ui-${sample.short}\`. Do not use Tailwind's numeric spacing scale (\`p-4\`, \`gap-6\`).\n` : ""}- **Type:** \`type-<role>\` classes (${model.typography.slice(0, 2).map((r) => `\`type-${r.id}\``).join(", ")}). Do not use \`text-lg\`, \`font-bold\`, or \`leading-*\`.
${radius.length ? `- **Radius:** ${[...radius, "`rounded-full`"].join(", ")}.\n` : ""}- **Fonts:** \`font-sans\`${display ? ", \`font-serif\` (the display face, " + display.family + ")" : ""}, \`font-mono\`.
- **Dark mode:** never write \`dark:\` color variants. The tokens already switch.

Anything without a utility takes the variable directly: \`bg-(${escape.name})\`.`;
}

/**
 * The full guideline set as many short files, the shape agents retrieve from
 * best: an entry file that routes to foundations, components, and recipes.
 */
export function guidelineFiles(model, { importFrom, setup, tailwind = true }) {
  const files = {};
  files["setup.md"] = `# Setup\n\n${setup}\n${tailwind ? `\n## Tailwind utilities\n\n${tailwindSection(model)}\n` : ""}`;
  files["foundations/color.md"] = `# Color\n\n${colorSection(model)}\n`;
  files["foundations/typography.md"] = `# Typography\n\n${typographySection(model)}\n`;
  files["foundations/layout.md"] = `# Layout and spacing\n\n${layoutSection(model)}\n`;
  files["foundations/shape-and-elevation.md"] = `# Shape\n\n${shapeSection(model)}\n\n# Elevation\n\n${elevationSection(model)}\n`;
  for (const c of model.components)
    files[`components/${kebabName(c.name)}.md`] = `# ${c.name}\n\n${componentSection(model, c, { importFrom })}\n`;
  files["composition/recipes.md"] = `# Recipes\n\nHow to build what the library does not ship. Follow these exactly so new elements match the shipped components.\n\n${recipesSection(model)}\n`;

  files["Guidelines.md"] = `# ${model.name} design system

IMPORTANT: Build every screen with the ${model.name} design system. Read \`setup.md\` before writing any code, then the foundation file for whatever you are styling.

${overviewSection(model)}

## Where to look

| When you are… | Read |
| --- | --- |
| Starting a project, importing styles or components | \`setup.md\` |
| Choosing any color, or styling hover, focus, and pressed states | \`foundations/color.md\` |
| Setting text of any kind | \`foundations/typography.md\` |
| Spacing, page width, breakpoints | \`foundations/layout.md\` |
| Corner radius or shadows | \`foundations/shape-and-elevation.md\` |
${model.components.map((c) => `| Using \`${c.name}\` | \`components/${kebabName(c.name)}.md\` |`).join("\n")}
| Building a card, input, dialog, nav, or anything not in the library | \`composition/recipes.md\` |

## Components

Import from \`${importFrom}\`. Always use these instead of writing your own:

${componentIndex(model)}

## Do's and don'ts

${dosAndDontsSection(model)}
`;
  return files;
}

const kebabName = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
