// v0 — Design Systems 2.0 imports sources (GitHub repo, links, or attachments
// such as a ZIP or an npm .tgz) at v0.app/design-systems and saves the result
// as a skill, after building a starter app you approve. The older route is a
// shadcn registry. "Open in v0" links ignore cssVars, so tokens cannot travel
// that way.
// https://v0.app/docs/design-systems-2
// https://ui.shadcn.com/docs/registry
import { reactSource, npmPackage } from "../builders/react.mjs";
import { guidelineFiles, packageSetup, sourceSetup } from "../builders/docs.mjs";
import { googleFontsUrl } from "../builders/css.mjs";
import { prefixTree, GENERATED_NOTE } from "../lib/util.mjs";

const json = (v) => JSON.stringify(v, null, 2) + "\n";

/** A shadcn registry: the theme as literal cssVars, the system as files. */
function registry(model, source) {
  const base = `src/design-system/${model.slug}`;
  const resolve = (ref, mode) => {
    const brand = /^var\((--[\w-]+)\)$/.exec(ref);
    if (brand) return model.brand.find((b) => b.name === brand[1])?.value ?? ref;
    return model.color(ref, mode);
  };
  const vars = (mode) =>
    Object.fromEntries(Object.entries(model.shadcn.colors ?? {}).map(([k, ref]) => [k, resolve(ref, mode)]));
  const radius = model.shape.find((s) => s.key === model.shadcn.radius)?.value;
  const font = (role) => {
    const f = model.fonts.find((x) => x.role === role);
    return f ? `"${f.family}", ${f.fallback}` : undefined;
  };

  const theme = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: `${model.slug}-theme`,
    type: "registry:theme",
    title: `${model.name} theme`,
    description: `${model.name} colors, fonts, and radius as shadcn/ui variables.`,
    cssVars: {
      theme: {
        ...(font("plain") ? { "font-sans": font("plain") } : {}),
        ...(font("brand") ? { "font-serif": font("brand") } : {}),
        ...(font("mono") ? { "font-mono": font("mono") } : {}),
      },
      light: { ...vars(model.defaultColorMode), ...(radius ? { radius } : {}) },
      ...(model.darkMode ? { dark: vars(model.darkMode) } : {}),
    },
  };

  const libraryFiles = Object.keys(source)
    .filter((p) => /^src\/(styles|components)\//.test(p) || p === "src/index.ts")
    .sort();
  const fileEntry = (path) => ({
    path,
    type: "registry:file",
    target: `${base}/${path.slice(4)}`,
  });
  const library = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: `${model.slug}-design-system`,
    type: "registry:item",
    title: `${model.name} design system`,
    description: `${model.name} tokens, Tailwind v4 theme, and components. Import ${base}/styles/index.css after Tailwind.`,
    files: libraryFiles.map(fileEntry),
  };

  return {
    "registry.json": json({
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: model.slug,
      homepage: model.homepage ?? "https://example.com",
      items: [theme, library].map(({ $schema, ...item }) => item),
    }),
    [`public/r/${theme.name}.json`]: json(theme),
    [`public/r/${library.name}.json`]: json({
      ...library,
      files: libraryFiles.map((p) => ({ ...fileEntry(p), content: source[p] })),
    }),
  };
}

export default {
  id: "v0",
  title: "v0",
  summary: "A source zip and npm tarball for v0's design-system import, import notes, and a shadcn registry.",
  build(model) {
    const importFrom = `@/design-system/${model.slug}`;
    const react = reactSource(model);
    const guidelines = guidelineFiles(model, {
      importFrom,
      setup: sourceSetup(model, { stylesPath: `src/design-system/${model.slug}/styles/index.css`, importFrom }),
    });
    const source = { ...react, ...prefixTree("docs", guidelines), ...registry(model, react) };
    const pkg = npmPackage(model, {
      guidelines: guidelineFiles(model, { importFrom: model.package.name, setup: packageSetup(model) }),
    });

    const light = model.defaultColorMode;
    const notes = `Design system: ${model.name}. ${model.description}

Globals
- All styling comes from CSS custom properties. The stylesheet entry is src/styles/index.css (tokens, base, typography classes, Tailwind v4 theme). In app/globals.css import src/styles/fonts.css first, then "tailwindcss", then src/styles/index.css, and remove the default shadcn :root and .dark variable blocks.
- src/styles/theme.css already maps the tokens to the shadcn/ui variables (--background, --primary, --card, --border, --radius, …) and to Tailwind utilities. Use it as is; do not generate a new palette.
- Page background is ${model.color("surface", light)} (surface), text is ${model.color("on-surface", light)} (on-surface), the accent is ${model.color("primary", light)} (primary).

Dark mode
- Tokens switch under the .dark class or data-theme="dark" on <html>. No dark: color variants are needed.

Fonts
${model.fonts.map((f) => `- ${f.family} (${f.weights.join(", ")}): ${f.use} CSS variable ${f.variable}.`).join("\n")}
- All are Google Fonts. In Next.js load them with next/font/google and set the three variables above; otherwise src/styles/fonts.css loads them from ${googleFontsUrl(model) ? "fonts.googleapis.com" : "your own source"}.

Components
${model.components.map((c) => `- ${c.name}: ${c.summary}`).join("\n")}
- Exported from src/index.ts. They are styled by data-* attributes in a sibling .css file; keep the markup and do not rewrite them with utility classes or replace them with shadcn's Button/Badge.
- Any shadcn/ui component may be used for everything else; it will pick up the theme.

Rules and docs
- docs/Guidelines.md is the entry point; docs/foundations/*, docs/components/*, and docs/composition/recipes.md hold the detail.
- src/App.tsx is a style-guide page showing the intended look. It is not a component.

Nothing is deprecated.
`;

    const zipName = `${model.slug}-design-system-source.zip`;
    const tgzName = `${model.slug}-design-system-${model.version}.tgz`;
    return {
      files: {
        ...prefixTree("source", source),
        ...prefixTree("package", pkg),
        "import-notes.md": notes,
        "README.md": readme(model, { zipName, tgzName }),
      },
      archives: [
        { name: zipName, files: source },
        { name: tgzName, files: pkg, format: "tgz" },
      ],
      next: [
        `v0.app/design-systems: start an import, attach ${zipName} (and ${tgzName}), paste import-notes.md as the notes, review the starter app, approve.`,
        "shadcn CLI route: host source/public/r/ and run npx shadcn@latest add <url>/r/" + `${model.slug}-theme.json`,
      ],
    };
  },
};

const readme = (model, { zipName, tgzName }) => `# ${model.name} → v0

${GENERATED_NOTE(model)}

## What is here

| Path | What it is |
| --- | --- |
| \`${zipName}\` | The design system as a Vite + React + Tailwind v4 source project, with guidelines in \`docs/\` and a shadcn registry |
| \`${tgzName}\` | The same system as a built npm package |
| \`import-notes.md\` | Text for the import form's notes step (globals, fonts, dark mode, components) |
| \`source/\`, \`package/\` | The two archives, unpacked |

## Option 1: Design Systems 2.0 (recommended)

v0 reads your sources, builds a starter app for you to review, and saves the result as a design-system skill for your team or personal workspace.

1. Go to <https://v0.app/design-systems> and start an import.
2. Add sources: attach \`${zipName}\`. Attach \`${tgzName}\` as well if you want generated apps to install the package rather than copy the source. If the repository is public, you can give its GitHub URL instead.
3. In the notes step, paste \`import-notes.md\`.
4. Review the starter app v0 builds. Compare it with \`source/src/App.tsx\`, the style guide this export generates: page background, fonts, button shapes, and primary color should match.
5. Approve. v0 validates the skill and gives you links to it. On paid plans a team owner can make it the team default from the Design Systems page.

Then start a chat with the design system selected and prompt as usual.

## Option 2: shadcn registry

\`source/registry.json\` and the built items in \`source/public/r/\` form a shadcn registry with two items:

- \`${model.slug}-theme\`: colors, fonts, and radius as shadcn variables, with literal light and dark values.
- \`${model.slug}-design-system\`: the token CSS, Tailwind theme, and components, installed to \`src/design-system/${model.slug}/\`.

Host \`public/r/\` anywhere public (deploying \`source/\` to Vercel works), then in a project:

\`\`\`bash
npx shadcn@latest add https://YOUR-HOST/r/${model.slug}-theme.json
\`\`\`

\`\`\`bash
npx shadcn@latest add https://YOUR-HOST/r/${model.slug}-design-system.json
\`\`\`

An **Open in v0** link (\`https://v0.dev/chat/api/open?url=…\`) will open the files of an item but, per shadcn's docs, ignores \`cssVars\` and \`css\`. Use it for the design-system item, not the theme.
`;
