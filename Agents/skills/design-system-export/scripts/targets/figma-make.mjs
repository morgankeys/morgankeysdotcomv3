// Figma Make — a Make kit bundles an npm package (React, Vite-compatible,
// published to public npm or to an organization's Figma-hosted private
// registry) with a guidelines folder whose entry point is Guidelines.md.
// Make reads guidelines progressively, so many short files beat one long one.
// https://help.figma.com/hc/articles/43602872461079
// https://help.figma.com/hc/articles/43602393097239
import { npmPackage } from "../builders/react.mjs";
import { guidelineFiles, packageSetup } from "../builders/docs.mjs";
import { prefixTree, GENERATED_NOTE } from "../lib/util.mjs";

export default {
  id: "figma-make",
  title: "Figma Make",
  summary: "A built, publishable npm package and a guidelines folder for a Make kit.",
  build(model) {
    const name = model.package.name;
    // Make has no Tailwind theme hook of its own, so the plain stylesheet is the
    // contract and the guidelines speak in variables and classes.
    const guidelines = guidelineFiles(model, {
      importFrom: name,
      setup: `IMPORTANT: Use \`${name}\` for all UI. Do not use Make's default components or styles.\n\n${packageSetup(model)}`,
    });
    const pkg = npmPackage(model, { guidelines });
    const tgzName = `${name.replace(/^@/, "").replace("/", "-")}-${model.version}.tgz`;

    return {
      files: {
        ...prefixTree("package", pkg),
        ...prefixTree("guidelines", guidelines),
        "README.md": readme(model, tgzName),
      },
      archives: [{ name: tgzName, files: pkg, format: "tgz" }],
      next: [
        `Publish: cd package && npm publish --access public (or to your Figma org registry). The scope in "${name}" must be one you own.`,
        "In a Make file: Settings > Create a kit, add the package, replace the guidelines folder with guidelines/, test, Publish kit.",
      ],
    };
  },
};

const readme = (model, tgzName) => {
  const name = model.package.name;
  const scope = name.startsWith("@") ? name.split("/")[0] : null;
  return `# ${model.name} → Figma Make

${GENERATED_NOTE(model)}

## What is here

| Path | What it is |
| --- | --- |
| \`package/\` | The npm package, already built: ESM, type declarations, CSS, and a copy of the guidelines |
| \`${tgzName}\` | The same package as \`npm pack\` would produce it, for inspection or local installs |
| \`guidelines/\` | The guidelines folder for the Make kit. \`Guidelines.md\` is the entry point |

The package needs no build step. It ships React components (React 18 or 19 as a peer dependency), one self-contained \`styles.css\`, and no other runtime dependencies, which is what Make's Vite environment requires.

## 1. Publish the package

Make installs packages from a registry, so the package has to be published first.${scope ? ` The name is \`${name}\`: you must own the \`${scope}\` scope on the registry you publish to. To change it, edit \`package.name\` in the kit's export config and re-run the export.` : ""}

**Public npm**

\`\`\`bash
cd package
\`\`\`

\`\`\`bash
npm login
\`\`\`

\`\`\`bash
npm publish --access public
\`\`\`

**Private, Figma-hosted registry** (paid plans; an organization admin manages scopes)

1. In Figma: **Admin** → **Resources** → **npm registry** → **Manage scopes**. Create a scope that does not exist on public npm, then copy the configuration snippet.
2. Paste the snippet into \`package/.npmrc\`. It contains an access token; do not commit it.
3. Set the package name to that scope (in the kit's export config), re-run the export, then \`npm publish\` from \`package/\`.

Bump \`version\` in the export config before each publish; registries reject a repeated version.

## 2. Create the Make kit

1. Open a new Make file. Click **Settings** (top right) → **Create a kit** → **Assemble your kit**.
2. Add the npm package by name: \`${name}\`. Make installs it and its peer dependencies.
3. Make creates a \`guidelines\` folder in the file explorer. Replace its contents with the files in \`guidelines/\` here, keeping the folder structure. \`Guidelines.md\` must stay at the top level: it is the one file Make always reads, and it routes to the rest.
4. Test it. Prompt: “Build a pricing page with three plans and a call to action.” Check that it imports from \`${name}\`, imports \`${name}/styles.css\` once, and uses \`Button\` rather than a hand-built one.
5. Move the file out of Drafts (kits cannot be published from Drafts), then **Publish kit**, keeping the default \`package.json\` and \`vite.config.ts\`.

Teammates use it from any Make file: **Add context** → **Select a Make kit**. Organization admins can approve a kit and enable it by default.

## Updating

Re-run the export, publish the new package version, then in the kit: bump the package version, replace the guidelines, and **Update kit**.

## Good to know

- Make kits do not fully extract design tokens from Figma libraries; they flatten variables to raw values. This package carries the real tokens as CSS variables instead, so do not also add the Figma library's styles to the kit, or the two will compete.
- Fonts load from Google Fonts through \`styles.css\`.
`;
};
