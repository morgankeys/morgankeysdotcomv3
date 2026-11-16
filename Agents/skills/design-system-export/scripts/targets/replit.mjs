// Replit — Agent is steered by skills (a folder with SKILL.md under
// .agents/skills/, loaded when its description matches the task), by
// replit.md (project context), and by workspace custom instructions (loaded
// on every message). Replit Design can also seed a design system from an
// existing DESIGN.md plus code.
// https://docs.replit.com/teams/custom-design-system
// https://docs.replit.com/design/create-a-design-system
import { styleFiles, tokensJson } from "../builders/react.mjs";
import { stylesCss, componentCss } from "../builders/css.mjs";
import { tokensDoc, componentsDoc, rulesDoc, sourceSetup, tailwindSection, componentIndex } from "../builders/docs.mjs";
import { designMd } from "./design-md.mjs";
import { prefixTree, GENERATED_NOTE } from "../lib/util.mjs";

export default {
  id: "replit",
  title: "Replit",
  summary: "An Agent skill with the tokens and components, a replit.md block, and a DESIGN.md seed for Replit Design.",
  build(model) {
    const skillName = `${model.slug}-design-system`;
    const skillDir = `.agents/skills/${skillName}`;
    const importFrom = `@/design-system/${model.slug}`;
    const styles = styleFiles(model);

    const assets = {
      "styles/index.css": `@import "./tokens.css";\n${styles["extras.css"] ? '@import "./extras.css";\n' : ""}@import "./base.css";\n@import "./typography.css";\n@import "./theme.css";\n`,
      ...prefixTree("styles", styles),
      "styles.css": stylesCss(model),
      "tokens.json": tokensJson(model),
      "index.ts": model.components.map((c) => `export { ${c.name} } from "./components/${c.name}";\nexport type { ${c.name}Props } from "./components/${c.name}";`).join("\n") + "\n",
    };
    for (const c of model.components) {
      assets[`components/${c.name}.tsx`] = `import "./${c.name}.css";\n` + c.tsx.replace(/^\s*\/\*\*[\s\S]*?\*\/\s*/, "");
      assets[`components/${c.name}.css`] = componentCss(model, c);
    }

    const skill = {
      "SKILL.md": `---
name: ${skillName}
description: Apply the ${model.name} design system. Use whenever building, styling, or changing any UI in this project — pages, components, layouts, colors, typography, spacing, or theming — so that everything uses ${model.name} tokens and components.
---

# ${model.name} design system

${GENERATED_NOTE(model)}

${model.description}

## Install it into the project (once)

If \`src/design-system/${model.slug}/\` does not exist yet, copy this skill's \`assets/\` folder to it:

\`\`\`bash
mkdir -p src/design-system && cp -R ${skillDir}/assets src/design-system/${model.slug}
\`\`\`

${sourceSetup(model, { stylesPath: `src/design-system/${model.slug}/styles/index.css`, importFrom })}

For a project without Tailwind, import \`src/design-system/${model.slug}/styles.css\` instead: it is the same system as one plain stylesheet.

## Always

- Use the shipped components:
${componentIndex(model).split("\n").map((l) => "  " + l).join("\n")}
- Reference tokens for every color, font setting, radius, and spacing value. Never hardcode one.
- Build anything the library does not ship from the recipes in \`references/components.md\`.

## Tailwind utilities

${tailwindSection(model)}

## References

Read the one that matches the task before writing code:

- \`references/tokens.md\`: every color, type, spacing, shape, and elevation token, with usage.
- \`references/components.md\`: component props and examples, plus recipes for cards, inputs, dialogs, navigation, and more.
- \`references/rules.md\`: principles and do's and don'ts.
`,
      "references/tokens.md": tokensDoc(model),
      "references/components.md": componentsDoc(model, { importFrom }),
      "references/rules.md": rulesDoc(model),
      ...prefixTree("assets", assets),
    };

    const replitMd = `## Design system

This project uses the ${model.name} design system. ${model.description}

- Read and follow the design system skill at \`${skillDir}/\` before building or changing any UI.
- The system's source is in \`src/design-system/${model.slug}/\` (copy it from the skill's \`assets/\` if missing).
- Components: ${model.components.map((c) => `\`${c.name}\``).join(", ")}, imported from \`${importFrom}\`.
- Styling: tokens only. Tailwind utilities come from the ${model.name} theme (\`bg-surface-container-low\`, \`p-ui-lg\`, \`type-headline-small\`). No hardcoded colors, font sizes, radii, or spacing, and no \`dark:\` color variants.
- Fonts: ${model.fonts.map((f) => `${f.family} for ${f.use.replace(/\.$/, "").toLowerCase()}`).join("; ")}.
- Both light and dark themes must work. Toggle with \`class="dark"\` on \`<html>\`.
`;

    const customInstructions = `Always apply the ${model.name} design system when building or modifying UI.\nRead and follow the design system skill at \`${skillDir}/\` (or the workspace skill named \`${skillName}\`).\nUse its components and CSS variables. Never hardcode colors, font sizes, radii, or spacing.\n`;

    const zipName = `${skillName}-skill.zip`;
    return {
      files: {
        ...prefixTree(skillDir, skill),
        "replit.md": replitMd,
        "custom-instructions.md": customInstructions,
        "DESIGN.md": designMd(model),
        "README.md": readme(model, { skillName, skillDir, zipName }),
      },
      archives: [{ name: zipName, files: prefixTree(skillName, skill) }],
      next: [
        `Per project: copy ${skillDir}/ into the Repl and append replit.md to the project's replit.md.`,
        `Workspace-wide: add ${zipName} as a workspace skill and paste custom-instructions.md into custom instructions.`,
        "Replit Design: create a design system and give it DESIGN.md as the source.",
      ],
    };
  },
};

const readme = (model, { skillName, skillDir, zipName }) => `# ${model.name} → Replit

${GENERATED_NOTE(model)}

## What is here

| Path | What it is |
| --- | --- |
| \`${skillDir}/\` | An Agent skill: instructions, token and component references, and the system's source under \`assets/\` |
| \`${zipName}\` | The same skill, zipped |
| \`replit.md\` | A block to add to a project's \`replit.md\` |
| \`custom-instructions.md\` | Three lines for workspace custom instructions |
| \`DESIGN.md\` | Seed file for Replit Design |

## Option 1: one project

1. Upload \`${zipName}\` to the Repl and unzip it into \`.agents/skills/\`, so the skill sits at \`${skillDir}/SKILL.md\`. (Or drag the \`.agents\` folder in.)
2. Append the contents of \`replit.md\` to the project's \`replit.md\`.
3. Ask Agent to build something. It loads the skill when the task touches UI, and copies the system into \`src/design-system/${model.slug}/\` the first time.

## Option 2: every project in a workspace

1. In **Workspace Settings**, add a skill named \`${skillName}\` from \`${zipName}\`. Skills can also be imported from a public GitHub repository. (Skills: all paid plans.)
2. Paste \`custom-instructions.md\` into the workspace's custom instructions, which load on every message. (Custom instructions: Pro and Enterprise.)

## Option 3: Replit Design

1. Start a design system from the home-page prompt box (or **Extract design system** from a mockup frame's ⋯ menu).
2. Attach \`DESIGN.md\` as the source, and optionally \`${skillDir}/assets/styles.css\` as code.
3. Review the result against the tables in \`DESIGN.md\`, then **Save design system**.

Replit Design re-derives its own \`tokens.json\` and components from the seed, so it will be close to the kit, not identical. Options 1 and 2 use the kit's real CSS and components.
`;
