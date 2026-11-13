// Bolt.new — a team design system is compiled by Bolt from sources you give
// it: an npm package (name or .tgz), a public GitHub repo, a zip of files, a
// Storybook, or a docs site. Packages and repos produce real components;
// docs alone produce only a theme. An "Agent Instructions" field steers the
// compile.
// https://support.bolt.new/building/design-system/add-design-system
import { reactSource, npmPackage } from "../builders/react.mjs";
import { guidelineFiles, packageSetup, compactInstructions } from "../builders/docs.mjs";
import { prefixTree, GENERATED_NOTE } from "../lib/util.mjs";

export default {
  id: "bolt",
  title: "Bolt.new",
  summary: "An npm tarball and a source zip to add as Bolt design-system sources, plus agent instructions.",
  build(model) {
    const importFrom = model.package.name;
    const guidelines = guidelineFiles(model, { importFrom, setup: packageSetup(model) });
    const pkg = npmPackage(model, { guidelines });
    const source = { ...reactSource(model), ...prefixTree("docs", guidelines) };

    const agentInstructions = `This is the ${model.name} design system: a React component library with CSS-variable design tokens for light and dark themes.

- Use only React syntax.
- The components are ${model.components.map((c) => `\`${c.name}\``).join(", ")}. Keep their names, props, and markup exactly as provided; styling is driven by \`data-*\` attributes and must not be converted to utility classes.
- Treat the CSS custom properties in \`styles.css\` / \`src/styles/tokens.css\` as the source of truth for color, typography, spacing, and radius. Preserve the variable names.
- \`theme.css\` maps the tokens onto Tailwind v4 utilities and shadcn/ui variable names. Use it as the theme; do not generate a different palette.
- The \`guidelines/\` (or \`docs/\`) folder holds the usage rules. Read \`Guidelines.md\` first.
- \`src/App.tsx\` is a style-guide page, not a component.
- For components the library does not include (cards, inputs, dialogs, navigation), follow \`composition/recipes.md\`.
`;

    const tgzName = `${model.slug}-design-system-${model.version}.tgz`;
    const zipName = `${model.slug}-design-system-source.zip`;
    return {
      files: {
        ...prefixTree("package", pkg),
        ...prefixTree("source", source),
        "agent-instructions.md": agentInstructions,
        "project-prompt.md": compactInstructions(model, {
          importFrom,
          setup: `Install \`${importFrom}\` and import \`${importFrom}/styles.css\` once at the app entry. With Tailwind v4, instead import \`${importFrom}/fonts.css\`, then \`tailwindcss\`, then \`${importFrom}/tailwind.css\` in the global stylesheet. If the package is not available, define the variables below in the global stylesheet and load the fonts from Google Fonts.`,
        }),
        "README.md": readme(model, { tgzName, zipName }),
      },
      archives: [
        { name: tgzName, files: pkg, format: "tgz" },
        { name: zipName, files: source },
      ],
      next: [
        `Team plan: Import your design system > Set up myself; add ${tgzName} under NPM and ${zipName} under Files; paste agent-instructions.md; Generate.`,
        "Any plan: paste project-prompt.md as the first message of a project.",
      ],
    };
  },
};

const readme = (model, { tgzName, zipName }) => `# ${model.name} → Bolt.new

${GENERATED_NOTE(model)}

## What is here

| Path | What it is |
| --- | --- |
| \`${tgzName}\` | The design system as a built npm package (components, CSS, guidelines) |
| \`${zipName}\` | The same system as a Vite + React + Tailwind source project, with guidelines in \`docs/\` |
| \`agent-instructions.md\` | Text for the import's **Agent Instructions** field |
| \`project-prompt.md\` | A condensed system description to paste into a single project |
| \`package/\`, \`source/\` | The two archives, unpacked |

## Option 1: a team design system (paid Team plan)

Bolt compiles a design system from sources you give it. Its docs say npm packages and repositories give the best results; documentation alone only yields a theme.

1. Log in to the team account. On the Bolt home page, click **+** at the bottom-left of the chat box → **Import your design system**.
2. In the setup dialog, choose **Set up myself**.
3. In **Sources**:
   - **NPM** → upload \`${tgzName}\`. (Once the package is published, enter its name, \`${model.package.name}\`, instead.)
   - **Files** → upload \`${zipName}\`.
4. Paste \`agent-instructions.md\` into **Agent Instructions**.
5. Click **Generate**. Bolt emails you when it is ready, typically 45 to 60 minutes, and produces a Storybook you can check against \`source/src/App.tsx\`.
6. Use it: in a new chat, **Design System** in the toolbar → select ${model.name} → prompt → **Build now**. For an existing project, attach it under project settings → **Design system**, then prompt Bolt to apply it.

A team can add or sync 10 design systems per week. After the kit changes, re-run the export and sync with the new files.

## Option 2: a single project (any plan)

Paste \`project-prompt.md\` as the first message of a new project (or keep it in the project's prompt/knowledge settings), and attach \`${tgzName}\` so Bolt can install the package. Without the package Bolt rebuilds components from the recipes in the prompt.
`;
