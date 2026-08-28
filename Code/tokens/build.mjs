// tokens:build — turn the unpacked Figma DTCG tokens into scoped CSS custom
// properties using Style Dictionary v4 (native DTCG support).
//
// Two things make this a *custom* pipeline rather than an off-the-shelf one:
//
//  1. Names. Figma token names carry spaces and casing ("On Primary",
//     "Byline to Body"). A kebab name transform maps them to MD3-style vars
//     (--md-sys-color-on-primary, --md-sys-spacing-byline-to-body, ...).
//
//  2. Opacity. Color `$value` is an object { colorSpace, components, alpha, hex }
//     where `hex` is 6-digit RGB ONLY — the opacity lives in `alpha`. A naive
//     "just use hex" transform silently drops transparency for the whole
//     State Layers group and the Surface Tint tokens (~150 per mode). The color
//     transform below emits `hex` when alpha === 1 and modern `rgb(r g b / a)`
//     when alpha < 1. A build-time guard then fails the build if any source
//     token with alpha < 1 produced a var without an alpha channel.
import StyleDictionary from "style-dictionary";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const UNPACKED = resolve(
  __dirname,
  "../../Docs/Design system/Figma tokens/unpacked",
);
const OUT = resolve(__dirname, "../src/styles/tokens");

const HEADER =
  "/*\n" +
  " * GENERATED FILE — do not edit by hand.\n" +
  " * Regenerate with `npm run tokens` (unpacks the Figma zips + Style Dictionary build).\n" +
  " * Source of truth: Docs/Design system/Figma tokens/*.zip\n" +
  " */\n\n";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** kebab-case a single path segment: "On Primary" -> "on-primary", "Surface Tint 5%" -> "surface-tint-5". */
const kebab = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const kebabPath = (path) => path.map(kebab).join("-");

/** Round the raw float alpha to a stable, human-readable value (0.07999998 -> 0.08). */
const roundAlpha = (a) => {
  const r = Math.round(a * 10000) / 10000;
  return String(r);
};

/** Clean up float noise from Figma numbers: -0.8500000238418579 -> -0.85. */
const num = (n) => String(Math.round(Number(n) * 10000) / 10000);

// Named font weights -> numeric CSS font-weight.
const WEIGHT_MAP = {
  Thin: 100,
  ExtraLight: 200,
  "Extra Light": 200,
  Light: 300,
  Regular: 400,
  Normal: 400,
  Medium: 500,
  SemiBold: 600,
  "Semi Bold": 600,
  Bold: 700,
  "Extra Bold": 800,
  ExtraBold: 800,
  Black: 900,
};

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

// Names — one per token set so the correct MD3 prefix / dropped group is applied.
StyleDictionary.registerTransform({
  name: "name/md-color",
  type: "name",
  transform: (t) => {
    const path = t.path[0] === "Schemes" ? t.path.slice(1) : t.path;
    return `md-sys-color-${kebabPath(path)}`;
  },
});
StyleDictionary.registerTransform({
  name: "name/md-typescale",
  type: "name",
  // Drop the leading UI / Editorial group: Display Large -> display-large.
  transform: (t) => `md-sys-typescale-${kebabPath(t.path.slice(1))}`,
});
StyleDictionary.registerTransform({
  name: "name/md-shape",
  type: "name",
  transform: (t) => `md-sys-shape-${kebabPath(t.path)}`,
});
StyleDictionary.registerTransform({
  name: "name/md-spacing",
  type: "name",
  transform: (t) => {
    const path = t.path[0] === "Editorial" ? t.path.slice(1) : t.path;
    return `md-sys-spacing-${kebabPath(path)}`;
  },
});
StyleDictionary.registerTransform({
  name: "name/md-font",
  type: "name",
  transform: (t) => {
    const path = t.path[0] === "Static" ? t.path.slice(1) : t.path;
    return `md-ref-${kebabPath(path)}`;
  },
});

// Opacity-safe color value — the crux of the pipeline.
StyleDictionary.registerTransform({
  name: "color/opacity-safe",
  type: "value",
  filter: (t) => t.$type === "color",
  transform: (t) => {
    const v = t.$value;
    const alpha = typeof v.alpha === "number" ? v.alpha : 1;
    if (alpha < 1) {
      const [r, g, b] = v.components.map((c) => Math.round(c * 255));
      return `rgb(${r} ${g} ${b} / ${roundAlpha(alpha)})`;
    }
    return v.hex;
  },
});

// Typescale values: Size/Line Height/Tracking -> px, Weight -> numeric, Font -> quoted family.
StyleDictionary.registerTransform({
  name: "value/typescale",
  type: "value",
  transform: (t) => {
    const leaf = t.path[t.path.length - 1];
    const v = t.$value;
    if (leaf === "Size" || leaf === "Line Height" || leaf === "Tracking")
      return `${num(v)}px`;
    if (leaf === "Weight" || leaf === "Weight-emphasized")
      return String(WEIGHT_MAP[v] ?? v);
    if (leaf === "Font") return `"${v}"`;
    return String(v);
  },
});

// Shape + spacing: plain numbers -> px.
StyleDictionary.registerTransform({
  name: "value/px",
  type: "value",
  filter: (t) => t.$type === "number" || typeof t.$value === "number",
  transform: (t) => `${num(t.$value)}px`,
});

// Font theme: Font -> quoted family, Weight -> numeric, Tracking -> px.
StyleDictionary.registerTransform({
  name: "value/font-theme",
  type: "value",
  transform: (t) => {
    const v = t.$value;
    if (t.path.includes("Font")) return `"${v}"`;
    if (t.path.includes("Weight")) return String(WEIGHT_MAP[v] ?? v);
    if (t.path.includes("Tracking"))
      return typeof v === "number" ? `${num(v)}px` : String(v);
    return String(v);
  },
});

// ---------------------------------------------------------------------------
// Build helpers
// ---------------------------------------------------------------------------

/** Transform a single source file and return the flat list of transformed tokens. */
async function transformTokens(source, transforms) {
  const sd = new StyleDictionary({
    usesDtcg: true,
    log: { verbosity: "silent", warnings: "disabled" },
    source: [source],
    platforms: { css: { transforms, buildPath: `${OUT}/`, files: [] } },
  });
  const dict = await sd.getPlatformTokens("css");
  return dict.allTokens;
}

/** Render a list of transformed tokens as a CSS custom-property block. */
function renderBlock(tokens, selector) {
  const lines = tokens.map((t) => `  --${t.name}: ${t.$value};`);
  return `${selector} {\n${lines.join("\n")}\n}\n`;
}

const COLOR_MODES = [
  { file: "Light.tokens.json", selector: ":root" },
  {
    file: "Light Medium Contrast.tokens.json",
    selector: ':root[data-contrast="medium"]',
  },
  {
    file: "Light High Contrast.tokens.json",
    selector: ':root[data-contrast="high"]',
  },
  { file: "Dark.tokens.json", selector: ':root[data-theme="dark"]' },
  {
    file: "Dark Medium Contrast.tokens.json",
    selector: ':root[data-theme="dark"][data-contrast="medium"]',
  },
  {
    file: "Dark High Contrast.tokens.json",
    selector: ':root[data-theme="dark"][data-contrast="high"]',
  },
];

/** Alpha channel present? true for rgb(.../ ...), rgba(...), or 8-digit hex. */
const hasAlphaChannel = (value) =>
  /\/\s*[\d.]+\s*\)/.test(value) ||
  /rgba\(/i.test(value) ||
  /^#[0-9a-f]{8}$/i.test(value);

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

async function main() {
  if (!existsSync(UNPACKED)) {
    console.error(
      `[tokens:build] unpacked tokens not found at ${UNPACKED}. Run npm run tokens:unpack first.`,
    );
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });

  // ---- Color (6 modes -> one file, scoped selectors) + opacity guard --------
  const colorBlocks = [];
  const guardFailures = [];
  let alphaTokenCount = 0;

  for (const mode of COLOR_MODES) {
    const src = resolve(UNPACKED, "Color", mode.file);
    const tokens = await transformTokens(src, [
      "name/md-color",
      "color/opacity-safe",
    ]);

    for (const t of tokens) {
      const origAlpha = t.original?.$value?.alpha;
      if (typeof origAlpha === "number" && origAlpha < 1) {
        alphaTokenCount++;
        if (!hasAlphaChannel(String(t.$value))) {
          guardFailures.push(
            `${mode.file}: --${t.name} = "${t.$value}" (source alpha ${origAlpha})`,
          );
        }
      }
    }
    colorBlocks.push(
      `/* ${mode.file.replace(".tokens.json", "")} */\n${renderBlock(tokens, mode.selector)}`,
    );
  }

  if (guardFailures.length > 0) {
    console.error(
      "[tokens:build] OPACITY GUARD FAILED — alpha<1 tokens lost their alpha channel:",
    );
    for (const f of guardFailures) console.error(`  - ${f}`);
    process.exit(1);
  }

  writeFileSync(resolve(OUT, "_color.css"), HEADER + colorBlocks.join("\n"));

  // ---- Typescale / Shape / Spacing / Font -----------------------------------
  const typescale = await transformTokens(
    resolve(UNPACKED, "Typescale", "Baseline.tokens.json"),
    ["name/md-typescale", "value/typescale"],
  );
  writeFileSync(
    resolve(OUT, "_typescale.css"),
    HEADER + renderBlock(typescale, ":root"),
  );

  const shape = await transformTokens(
    resolve(UNPACKED, "Shape", "Baseline.tokens.json"),
    ["name/md-shape", "value/px"],
  );
  writeFileSync(
    resolve(OUT, "_shape.css"),
    HEADER + renderBlock(shape, ":root"),
  );

  const spacing = await transformTokens(
    resolve(UNPACKED, "Spacing", "Baseline.tokens.json"),
    ["name/md-spacing", "value/px"],
  );
  writeFileSync(
    resolve(OUT, "_spacing.css"),
    HEADER + renderBlock(spacing, ":root"),
  );

  const font = await transformTokens(
    resolve(UNPACKED, "Font theme", "Baseline.tokens.json"),
    ["name/md-font", "value/font-theme"],
  );
  writeFileSync(resolve(OUT, "_font.css"), HEADER + renderBlock(font, ":root"));

  // ---- index.css (the single global variables file) -------------------------
  const index =
    HEADER +
    ["_color.css", "_typescale.css", "_shape.css", "_spacing.css", "_font.css"]
      .map((f) => `@import './${f}';`)
      .join("\n") +
    "\n";
  writeFileSync(resolve(OUT, "index.css"), index);

  console.log(
    `[tokens:build] wrote ${OUT}/{_color,_typescale,_shape,_spacing,_font,index}.css\n` +
      `[tokens:build] color modes: ${COLOR_MODES.length}; opacity-bearing vars verified: ${alphaTokenCount} (guard passed)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
