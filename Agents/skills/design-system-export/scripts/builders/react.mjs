// The two code shapes the platforms ingest:
//
//   reactSource()  a Vite + React + Tailwind v4 project whose src/ is the
//                  design system (components, token CSS, a showcase page).
//                  For platforms that read a repo or a zip of source.
//   npmPackage()   the same components and CSS, pre-built to ESM + .d.ts, for
//                  platforms that install a package.
//
// Both are assembled from the kit's own component styles plus the React ports
// in the kit's export config, so neither needs an install or a bundler to
// produce.
import { createRequire } from "node:module";
import { join } from "node:path";
import {
  fontsCss,
  tokensCss,
  tokensContrastCss,
  extrasCss,
  baseCss,
  typographyCss,
  componentCss,
  themeCss,
  stylesCss,
  tailwindCss,
} from "./css.mjs";
import { GENERATED_NOTE } from "../lib/util.mjs";

const json = (value) => JSON.stringify(value, null, 2) + "\n";

/** Swap the port's kit-internal header comment for one that suits consumers. */
function consumerSource(model, component, { importCss }) {
  const body = component.tsx.replace(/^\s*\/\*\*[\s\S]*?\*\/\s*/, "");
  const header = `/**\n * ${component.name} — ${component.summary}\n * ${GENERATED_NOTE(model)}\n */\n`;
  return header + (importCss ? `import "./${component.name}.css";\n` : "") + body;
}

const barrel = (model) =>
  model.components
    .map(
      (c) =>
        `export { ${c.name} } from "./components/${c.name}";\nexport type { ${c.name}Props } from "./components/${c.name}";`,
    )
    .join("\n") + "\n";

/** Machine-readable token dump: every role, every mode, with its CSS variable. */
export function tokensJson(model) {
  return json({
    $description: GENERATED_NOTE(model),
    name: model.name,
    version: model.version,
    modes: {
      color: model.colorModes.map((m) => ({ id: m.id, selector: m.exportSelector ?? m.selector })),
      window: model.windowModes.map((m) => ({ id: m.id, media: m.media })),
    },
    color: Object.fromEntries(
      model.colors.map((c) => [c.key, { variable: c.name, group: c.group, values: c.values }]),
    ),
    brand: Object.fromEntries(model.brand.map((b) => [b.key, { variable: b.name, value: b.value }])),
    typography: Object.fromEntries(
      model.typography.map((r) => [r.id, { variables: r.vars, values: r.modes }]),
    ),
    shape: Object.fromEntries(model.shape.map((s) => [s.key, { variable: s.name, value: s.value }])),
    spacing: Object.fromEntries(
      [...model.spacing.ui, ...model.spacing.editorial, ...model.spacing.breakpoints].map((s) => [
        s.key,
        { variable: s.name, values: s.modes },
      ]),
    ),
    elevation: Object.fromEntries(
      model.elevation.map((e) => [e.key, { variable: e.name, value: e.value }]),
    ),
    fonts: model.fonts,
  });
}

/** The individual stylesheets, keyed by file name. */
export function styleFiles(model) {
  const files = {
    "fonts.css": fontsCss(model),
    "tokens.css": tokensCss(model),
    "base.css": baseCss(model),
    "typography.css": typographyCss(model),
    "theme.css": themeCss(model),
  };
  const contrast = tokensContrastCss(model);
  if (contrast) files["tokens-contrast.css"] = contrast;
  const extras = extrasCss(model);
  if (extras) files["extras.css"] = extras;
  return files;
}

// ---------------------------------------------------------------- source ---

function showcase(model) {
  const swatches = model.coreColors
    .filter((c) => !c.key.startsWith("on-") && !/fixed|inverse|shadow|scrim|tint|^background$/.test(c.key))
    .map((c) => `  ["${c.key}", "${c.name}"],`)
    .join("\n");
  const brand = model.brand
    .filter((b) => !b.key.startsWith("on-"))
    .map((b) => `  ["${b.key}", "${b.name}"],`)
    .join("\n");
  const type = model.typography.map((r) => `  "${r.id}",`).join("\n");
  const sections = model.components
    .filter((c) => c.showcase)
    .map(
      (c) => `      <Section title="${c.name}">
        <div className="flex flex-wrap items-center gap-ui-md">
${c.showcase.split("\n").map((l) => "          " + l).join("\n")}
        </div>
      </Section>`,
    )
    .join("\n");
  const names = model.components.filter((c) => c.showcase).map((c) => c.name);

  return `// Living style guide for the ${model.name} design system.
// ${GENERATED_NOTE(model)}
import { useState, type JSX, type ReactNode } from "react";
import { ${names.join(", ")} } from "./index";

const COLORS: [string, string][] = [
${swatches}
];

const BRAND: [string, string][] = [
${brand}
];

const TYPE: string[] = [
${type}
];

function Section({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return (
    <section className="flex flex-col gap-ui-lg">
      <h2 className="type-headline-small">{title}</h2>
      {children}
    </section>
  );
}

function Swatches({ items }: { items: [string, string][] }): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-ui-md sm:grid-cols-3 lg:grid-cols-5">
      {items.map(([key, variable]) => (
        <figure key={key} className="flex flex-col gap-ui-xs">
          <div
            className="h-16 rounded-lg border border-border"
            style={{ backgroundColor: \`var(\${variable})\` }}
          />
          <figcaption className="type-label-medium text-muted-foreground">{key}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export default function App(): JSX.Element {
  const [dark, setDark] = useState(false);
  return (
    <div className={dark ? "dark" : undefined}>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-5xl flex-col gap-ui-4xl px-ui-xl py-ui-4xl">
          <header className="flex flex-wrap items-end justify-between gap-ui-lg">
            <div className="flex flex-col gap-ui-sm">
              <p className="type-eyebrow text-muted-foreground">Design system</p>
              <h1 className="type-display-small">${model.name}</h1>
              <p className="type-standfirst max-w-2xl text-muted-foreground">
                ${model.description}
              </p>
            </div>
            <button
              type="button"
              className="type-label-large rounded-full border border-border px-ui-lg py-ui-sm"
              onClick={() => setDark(!dark)}
            >
              {dark ? "Light theme" : "Dark theme"}
            </button>
          </header>

          <Section title="Color roles">
            <Swatches items={COLORS} />
          </Section>
${brand ? `\n          <Section title="Brand tones">\n            <Swatches items={BRAND} />\n          </Section>\n` : ""}
${sections.replace(/^ {6}/gm, "          ")}

          <Section title="Type roles">
            <div className="flex flex-col gap-ui-md">
              {TYPE.map((role) => (
                <div key={role} className="grid gap-ui-xs sm:grid-cols-[12rem_1fr] sm:items-baseline">
                  <span className="type-label-medium text-muted-foreground">{role}</span>
                  <span className={\`type-\${role}\`}>${model.config.sampleText ?? "The quick brown fox jumps over the lazy dog"}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Surfaces">
            <div className="grid gap-ui-lg sm:grid-cols-3">
              <div className="flex flex-col gap-ui-sm rounded-lg bg-card p-ui-xl">
                <h3 className="type-title-medium">Card</h3>
                <p className="type-body-medium text-muted-foreground">
                  Tonal step, no border, no shadow.
                </p>
              </div>
              <div className="flex flex-col gap-ui-sm rounded-lg bg-muted p-ui-xl">
                <h3 className="type-title-medium">Container</h3>
                <p className="type-body-medium text-muted-foreground">One step stronger.</p>
              </div>
              <div className="flex flex-col gap-ui-sm rounded-lg bg-accent p-ui-xl">
                <h3 className="type-title-medium">Container high</h3>
                <p className="type-body-medium text-muted-foreground">Nested panels and hover.</p>
              </div>
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}
`;
}

/**
 * A Vite + React + Tailwind v4 project. `src/` minus the app shell is the
 * design system itself.
 */
export function reactSource(model, { name = `${model.slug}-design-system` } = {}) {
  const files = {};
  const styles = styleFiles(model);
  for (const [file, css] of Object.entries(styles)) files[`src/styles/${file}`] = css;

  // Tokens stand alone at the conventional path; index.css is the full entry.
  // Fonts are imported separately, before Tailwind (see tailwindCss()).
  const imports = ["tokens", "extras", "base", "typography", "theme"]
    .filter((n) => styles[`${n}.css`])
    .map((n) => `@import "./${n}.css";`);
  files["src/styles/index.css"] =
    `/*\n * ${model.name} design system — style entry.\n * Import once, after "tailwindcss". Import fonts.css before it.\n * ${GENERATED_NOTE(model)}\n */\n${imports.join("\n")}\n`;
  files["src/index.css"] = `@import "./styles/fonts.css";\n@import "tailwindcss";\n@import "./styles/index.css";\n`;

  for (const component of model.components) {
    files[`src/components/${component.name}.tsx`] = consumerSource(model, component, { importCss: true });
    files[`src/components/${component.name}.css`] = componentCss(model, component);
  }
  files["src/index.ts"] = `// ${model.name} design system — public components.\n${barrel(model)}`;
  files["src/tokens.json"] = tokensJson(model);
  files["src/App.tsx"] = showcase(model);
  files["src/main.tsx"] = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;
  files["src/vite-env.d.ts"] = `/// <reference types="vite/client" />\n`;
  files["index.html"] = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${model.name} design system</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
  files["package.json"] = json({
    name,
    private: true,
    version: model.version,
    type: "module",
    description: `${model.name} design system. ${model.description}`,
    scripts: { dev: "vite", build: "tsc --noEmit && vite build", preview: "vite preview" },
    dependencies: { react: "^18.3.1", "react-dom": "^18.3.1" },
    devDependencies: {
      "@tailwindcss/vite": "^4.1.0",
      "@types/react": "^18.3.12",
      "@types/react-dom": "^18.3.1",
      "@vitejs/plugin-react": "^4.3.4",
      tailwindcss: "^4.1.0",
      typescript: "^5.6.3",
      vite: "^6.0.0",
    },
  });
  files["vite.config.ts"] = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
`;
  files["tsconfig.json"] = json({
    compilerOptions: {
      target: "ES2020",
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      moduleResolution: "bundler",
      jsx: "react-jsx",
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      isolatedModules: true,
      resolveJsonModule: true,
      baseUrl: ".",
      paths: { "@/*": ["./src/*"] },
    },
    include: ["src"],
  });
  files[".gitignore"] = "node_modules\ndist\n";
  return files;
}

// --------------------------------------------------------------- package ---

/**
 * A publishable npm package, already built. TypeScript comes from the kit's
 * own dependencies; nothing is installed.
 */
export function npmPackage(model, { guidelines = {} } = {}) {
  const require = createRequire(join(model.config.dir, "package.json"));
  let ts;
  try {
    ts = require("typescript");
  } catch {
    throw new Error(
      "The npm package build needs `typescript`. Install the kit's dependencies (npm ci) and re-run.",
    );
  }
  const compilerOptions = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.ReactJSX,
    declaration: true,
    isolatedDeclarations: true,
    verbatimModuleSyntax: true,
  };
  const compile = (fileName, source) => {
    const js = ts.transpileModule(source, { compilerOptions, fileName });
    const dts = ts.transpileDeclaration(source, { compilerOptions, fileName });
    const problems = [...(js.diagnostics ?? []), ...(dts.diagnostics ?? [])];
    if (problems.length)
      throw new Error(
        `${fileName}: ${problems.map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n")).join("; ")}`,
      );
    return { js: js.outputText, dts: dts.outputText };
  };

  const files = {};
  for (const component of model.components) {
    const out = compile(`${component.name}.tsx`, consumerSource(model, component, { importCss: false }));
    files[`dist/components/${component.name}.js`] = out.js;
    files[`dist/components/${component.name}.d.ts`] = out.dts;
  }
  const index = compile(
    "index.ts",
    barrel(model).replace(/"\.\/components\/(\w+)"/g, '"./components/$1.js"'),
  );
  files["dist/index.js"] = index.js;
  files["dist/index.d.ts"] = index.dts;

  const styles = styleFiles(model);
  files["dist/styles.css"] = stylesCss(model);
  files["dist/tailwind.css"] = tailwindCss(model);
  for (const name of ["fonts.css", "tokens.css", "tokens-contrast.css", "theme.css"])
    if (styles[name]) files[`dist/${name}`] = styles[name];
  files["dist/tokens.json"] = tokensJson(model);

  for (const [path, content] of Object.entries(guidelines)) files[`guidelines/${path}`] = content;

  const pkg = model.package;
  files["package.json"] = json({
    name: pkg.name,
    version: model.version,
    description: `${model.name} design system. ${model.description}`,
    license: pkg.license,
    ...(model.homepage ? { homepage: model.homepage } : {}),
    type: "module",
    main: "./dist/index.js",
    module: "./dist/index.js",
    types: "./dist/index.d.ts",
    exports: {
      ".": { types: "./dist/index.d.ts", import: "./dist/index.js" },
      "./styles.css": "./dist/styles.css",
      "./tailwind.css": "./dist/tailwind.css",
      "./fonts.css": "./dist/fonts.css",
      "./tokens.css": "./dist/tokens.css",
      ...(styles["tokens-contrast.css"] ? { "./tokens-contrast.css": "./dist/tokens-contrast.css" } : {}),
      "./theme.css": "./dist/theme.css",
      "./tokens.json": "./dist/tokens.json",
      "./guidelines/*": "./guidelines/*",
      "./package.json": "./package.json",
    },
    files: ["dist", "guidelines"],
    sideEffects: ["**/*.css"],
    peerDependencies: { react: "^18.0.0 || ^19.0.0", "react-dom": "^18.0.0 || ^19.0.0" },
    keywords: ["design-system", "react", "design-tokens", model.slug],
  });
  files["README.md"] = `# ${pkg.name}

${model.name} design system. ${model.description}

${GENERATED_NOTE(model)}

## Use

\`\`\`bash
npm install ${pkg.name}
\`\`\`

\`\`\`tsx
// Once, at the app entry:
import "${pkg.name}/styles.css";

import { ${model.components.map((c) => c.name).join(", ")} } from "${pkg.name}";
\`\`\`

\`styles.css\` is complete on its own: web fonts, tokens for light and dark, base
typography, a \`.type-<role>\` class for every type role, and component styles. It needs
no Tailwind and no build configuration.

Dark mode: add \`class="dark"\` or \`data-theme="dark"\` to \`<html>\`.

### With Tailwind CSS v4

Use \`tailwind.css\` instead of \`styles.css\`, with the fonts first:

\`\`\`css
@import "${pkg.name}/fonts.css";
@import "tailwindcss";
@import "${pkg.name}/tailwind.css";
\`\`\`

The order matters: a font \`@import\` is only valid before other rules, and the rest must
follow Tailwind so the base styles win over Preflight. \`tailwind.css\` adds a theme that maps the tokens onto Tailwind utilities (\`bg-surface-container-low\`,
\`p-ui-lg\`, \`rounded-lg\`, \`text-headline-small\`) and onto the shadcn/ui variable names
(\`--background\`, \`--primary\`, …), so shadcn components pick up the system.

### Other entry points

| Import | Contents |
| --- | --- |
| \`${pkg.name}/tokens.css\` | Tokens only |
| \`${pkg.name}/theme.css\` | The Tailwind v4 theme only |
${styles["tokens-contrast.css"] ? `| \`${pkg.name}/tokens-contrast.css\` | Medium and high contrast modes (\`data-contrast\`) |\n` : ""}| \`${pkg.name}/tokens.json\` | Every token and mode as data |
| \`${pkg.name}/guidelines/*\` | Usage guidelines for coding agents |
`;
  return files;
}
