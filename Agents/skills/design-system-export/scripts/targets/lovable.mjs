// Lovable — a design system is a dedicated Lovable project holding a React
// component library. On release Lovable reads tokens from top-level style
// files (src/styles/tokens.css), components from the src/index.ts barrel, and
// knowledge from .lovable/. Connected projects get src/ and .lovable/ copied
// in under src/design-system/<slug>/.
// https://docs.lovable.dev/features/design-systems
import { reactSource } from "../builders/react.mjs";
import {
  guidelineFiles,
  sourceSetup,
  compactInstructions,
  rulesDoc,
  tokensDoc,
  componentsDoc,
  tailwindSection,
} from "../builders/docs.mjs";
import { prefixTree, GENERATED_NOTE } from "../lib/util.mjs";

export default {
  id: "lovable",
  title: "Lovable",
  summary: "A React design-system project to import as a Lovable design system, plus an Instructions fallback.",
  build(model) {
    const importFrom = `@/design-system/${model.slug}`;
    const stylesPath = `src/design-system/${model.slug}/styles/index.css`;
    const setup = sourceSetup(model, { stylesPath, importFrom });

    const system = `# ${model.name} design system

${GENERATED_NOTE(model)}

IMPORTANT: Every screen in this project uses the ${model.name} design system. Use its components and tokens; never hardcode a color, font size, radius, or spacing value.

## Setup

${setup}

## Tailwind utilities

${tailwindSection(model)}

${rulesDoc(model).replace(/^# .*\n\n/, "")}
## Reference

- \`.lovable/rules/design-tokens.md\`: every token and when to use it.
- \`.lovable/rules/components.md\`: component props, examples, and recipes for everything the library does not ship.
- \`.lovable/rules/library-guidelines.md\`: principles and do's and don'ts.
`;

    const project = {
      ...reactSource(model),
      ".lovable/system.md": system,
      ".lovable/rules/design-tokens.md": tokensDoc(model),
      ".lovable/rules/components.md": componentsDoc(model, { importFrom }),
      ".lovable/rules/library-guidelines.md": rulesDoc(model),
      "AGENTS.md": `# ${model.name} design system\n\nThis project is the ${model.name} design system: a React component library plus design tokens.\n\n- Tokens are CSS custom properties in \`src/styles/tokens.css\`. They are generated; do not edit values here.\n- Components are in \`src/components/\` and exported from \`src/index.ts\`.\n- \`src/App.tsx\` is a living style guide, not part of the library.\n- Usage rules are in \`.lovable/system.md\` and \`.lovable/rules/\`.\n`,
      "README.md": `# ${model.name} design system for Lovable\n\n${GENERATED_NOTE(model)}\n\nA Vite + React + Tailwind v4 project. \`src/\` is the library; \`npm install && npm run dev\` shows the style guide.\n`,
    };

    const instructions = compactInstructions(model, {
      importFrom,
      setup: `If the ${model.name} design system is attached to this project, its files are in \`src/design-system/${model.slug}/\`: import its \`styles/fonts.css\` before Tailwind and its \`styles/index.css\` after it, and use its components. If it is not attached, define the variables below in the global stylesheet yourself and load the fonts from Google Fonts.`,
    });

    const zipName = `${model.slug}-lovable-design-system.zip`;
    return {
      files: {
        ...prefixTree("project", project),
        ...prefixTree("guidelines", guidelineFiles(model, { importFrom, setup })),
        "instructions.md": instructions,
        "README.md": readme(model, zipName),
      },
      archives: [{ name: zipName, files: project }],
      next: [
        `Paid plan: create a design system (prompt box + > Design > Use a design system > Create design system), upload ${zipName} in the chat, ask Lovable to use it as the library source, then Release version.`,
        "Any plan: paste instructions.md into Project settings > Instructions.",
      ],
    };
  },
};

const readme = (model, zipName) => `# ${model.name} → Lovable

${GENERATED_NOTE(model)}

## What is here

| Path | What it is |
| --- | --- |
| \`${zipName}\` | The design-system project, zipped for upload |
| \`project/\` | The same project, unzipped |
| \`instructions.md\` | A condensed version for Lovable's Instructions field (under its 10,000-character limit) |
| \`guidelines/\` | The full guidelines as separate files, for reference or upload |

## Option 1: a Lovable design system (paid plans)

A Lovable design system is its own Lovable project that holds a React component library. Projects that attach it get its components, tokens, and rules copied in, and are offered an update each time you release a new version.

1. On lovable.dev, click **+** on the prompt box, then **Design** → **Use a design system** → **Create design system**.
2. In the new project's chat, upload \`${zipName}\` and say:
   > Use the uploaded project as this design system's library source. Keep \`src/\` and \`.lovable/\` exactly as they are: the components in \`src/components\`, the barrel \`src/index.ts\`, the tokens in \`src/styles/tokens.css\`, and the knowledge files in \`.lovable/\`. Do not restyle or rename anything.
3. Check the preview against \`project/src/App.tsx\` (the style guide page).
4. Click **Release version**. Only released design systems can be attached.
5. Attach it: in any project, **+** → **Project** → **Design system**, or start a new one from **+** → **Design** → **Use a design system**.

If the repository is public you can skip the upload and give Lovable its Git URL instead, pointing it at this folder. Lovable cannot fetch private repositories.

After the kit's tokens or components change, re-run the export, upload the new zip to the design-system project, and release again. Connected projects get an **Update available** prompt.

Things to know:

- \`.lovable/system.md\` is the hand-off document Lovable never overwrites. Lovable regenerates \`.lovable/design-system.json\` and may regenerate the files in \`.lovable/rules/\` on release.
- The project uses Tailwind CSS v4. Lovable's docs note that a consumer scaffolded on Tailwind 3 can conflict; its setup verification normally resolves this.
- One design system per project.

## Option 2: Instructions (all plans)

1. Open **Project settings** → **Instructions** (or **Workspace settings** → **Instructions** to apply it everywhere).
2. Paste the contents of \`instructions.md\`.

This gives Lovable the tokens and rules but not the components, so it will rebuild buttons from the recipes. Lovable also reads a top-level \`AGENTS.md\` on every message, so the same text can be committed there instead.
`;
