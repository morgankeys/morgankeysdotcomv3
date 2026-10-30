// tokens:build — turn the unpacked Figma DTCG tokens into scoped CSS custom
// properties using Style Dictionary v5 (native DTCG support).
//
// Two things make this a *custom* pipeline rather than an off-the-shelf one:
//
//  1. Names. Figma token names carry spaces and casing ("On Primary",
//     "Byline to Body"). A kebab name transform maps them to MD3-style vars
//     (--dune-sys-color-on-primary, --dune-sys-spacing-byline-to-body, ...).
//
//  2. Opacity. Color `$value` is an object { colorSpace, components, alpha, hex }
//     where `hex` is 6-digit RGB ONLY — the opacity lives in `alpha`. A naive
//     "just use hex" transform silently drops transparency for the whole
//     State Layers group and the Surface Tint tokens (~150 per mode). The color
//     transform below emits `hex` when alpha === 1 and modern `rgb(r g b / a)`
//     when alpha < 1. A build-time guard then fails the build if any source
//     token with alpha < 1 produced a var without an alpha channel.
//
//  3. Responsive type and spacing. Figma exports Typescale and Spacing
//     collections with Baseline, Compact, Medium, and Expanded modes. The build
//     ignores Baseline, emits Compact on :root, and swaps all values at 37.5em
//     and 52.5em. Typescale sizes become rem, line heights unitless ratios, and
//     tracking em. Spacing remains px-based.
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
    return `dune-sys-color-${kebabPath(path)}`;
  },
});
StyleDictionary.registerTransform({
  name: "name/md-typescale",
  type: "name",
  // Drop the leading UI / Editorial group: Display Large -> display-large.
  transform: (t) => {
    const path = t.path.slice(1);
    if (path[path.length - 1] === "Line Height (percent)") {
      path[path.length - 1] = "Line Height";
    }
    return `dune-sys-typescale-${kebabPath(path)}`;
  },
});
StyleDictionary.registerTransform({
  name: "name/md-shape",
  type: "name",
  transform: (t) => `dune-sys-shape-${kebabPath(t.path)}`,
});
StyleDictionary.registerTransform({
  name: "name/md-spacing",
  type: "name",
  transform: (t) => {
    const path = t.path[0] === "Editorial" ? t.path.slice(1) : t.path;
    return `dune-sys-spacing-${kebabPath(path)}`;
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

// Typescale values that do not depend on sibling tokens. Responsive numeric
// values are formatted together after Style Dictionary resolves aliases.
StyleDictionary.registerTransform({
  name: "value/typescale",
  type: "value",
  transform: (t) => {
    const leaf = t.path[t.path.length - 1];
    const v = t.$value;
    if (leaf === "Weight" || leaf === "Weight-emphasized")
      return String(WEIGHT_MAP[v] ?? v);
    if (leaf === "Font") return `"${v}"`;
    return v;
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

/** Render declarations inside a viewport media query. */
function renderMediaBlock(tokens, minWidth) {
  const lines = tokens.map((t) => `    --${t.name}: ${t.$value};`);
  return `@media (min-width: ${minWidth}) {\n  :root {\n${lines.join("\n")}\n  }\n}\n`;
}

/** Path without the leaf property, used to find sibling typography tokens. */
const rolePath = (token) => token.path.slice(0, -1).join("/");

/**
 * Format resolved typography values using the role's size as context.
 * Figma remains px-based; CSS uses accessible, relative units.
 */
function formatTypescaleTokens(tokens) {
  const sizes = new Map(
    tokens
      .filter((t) => t.path[t.path.length - 1] === "Size")
      .map((t) => [rolePath(t), Number(t.original.$value)]),
  );

  return tokens
    .filter((t) => t.path[t.path.length - 1] !== "Line Height (px)")
    .map((t) => {
      const leaf = t.path[t.path.length - 1];
      const raw = Number(t.original.$value);
      const size = sizes.get(rolePath(t));

      if (leaf === "Size") t.$value = `${num(raw / 16)}rem`;
      if (leaf === "Line Height") t.$value = num(raw / size);
      if (leaf === "Line Height (percent)") t.$value = num(raw / 100);
      if (leaf === "Tracking") t.$value = `${num(raw / size)}em`;

      return t;
    });
}

/**
 * Figma binds text styles to Line Height (px), while CSS consumes the paired
 * percentage as a unitless ratio. Fail loudly if those two sources drift.
 */
function validateEditorialLineHeights(tokens, modeName) {
  const roles = new Map();

  for (const token of tokens.filter((t) => t.path[0] === "Editorial")) {
    const key = rolePath(token);
    const leaf = token.path[token.path.length - 1];
    const role = roles.get(key) ?? {};
    role[leaf] = Number(token.original.$value);
    roles.set(key, role);
  }

  const failures = [];
  for (const [role, values] of roles) {
    const size = values.Size;
    const percent = values["Line Height (percent)"];
    const px = values["Line Height (px)"];

    if (![size, percent, px].every(Number.isFinite)) {
      failures.push(
        `${role}: missing Size, Line Height (percent), or Line Height (px)`,
      );
      continue;
    }
    if (percent < 80 || percent > 250) {
      failures.push(`${role}: percent ${percent} is outside 80–250`);
    }

    const expected = (size * percent) / 100;
    if (Math.abs(px - expected) > 0.01) {
      failures.push(
        `${role}: ${px}px does not equal ${size}px × ${percent}% = ${num(expected)}px`,
      );
    }
  }

  if (failures.length > 0) {
    console.error(
      `[tokens:build] TYPESCALE GUARD FAILED — ${modeName} line-height pairs are invalid:`,
    );
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
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

const TYPESCALE_MODES = [
  { file: "Compact.tokens.json", minWidth: null },
  { file: "Medium.tokens.json", minWidth: "37.5em" },
  { file: "Expanded.tokens.json", minWidth: "52.5em" },
];

const SPACING_MODES = [
  { file: "Compact.tokens.json", minWidth: null },
  { file: "Medium.tokens.json", minWidth: "37.5em" },
  { file: "Expanded.tokens.json", minWidth: "52.5em" },
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

  // ---- Typescale (Baseline stays in Figma; 3 responsive modes ship) ----------
  const typescaleBlocks = [];
  let responsiveTokenCount = 0;

  for (const mode of TYPESCALE_MODES) {
    const tokens = await transformTokens(
      resolve(UNPACKED, "Typescale", mode.file),
      ["name/md-typescale", "value/typescale"],
    );
    validateEditorialLineHeights(tokens, mode.file.replace(".tokens.json", ""));
    const formatted = formatTypescaleTokens(tokens);
    responsiveTokenCount += formatted.length;

    if (mode.minWidth === null) {
      typescaleBlocks.push(
        `/* Compact (default) */\n${renderBlock(formatted, ":root")}`,
      );
    } else {
      typescaleBlocks.push(
        `/* ${mode.file.replace(".tokens.json", "")} */\n${renderMediaBlock(
          formatted,
          mode.minWidth,
        )}`,
      );
    }
  }

  writeFileSync(
    resolve(OUT, "_typescale.css"),
    HEADER + typescaleBlocks.join("\n"),
  );

  // ---- Shape / Spacing / Font -----------------------------------------------
  const shape = await transformTokens(
    resolve(UNPACKED, "Shape", "Baseline.tokens.json"),
    ["name/md-shape", "value/px"],
  );
  writeFileSync(
    resolve(OUT, "_shape.css"),
    HEADER + renderBlock(shape, ":root"),
  );

  const spacingBlocks = [];
  let responsiveSpacingTokenCount = 0;

  for (const mode of SPACING_MODES) {
    const tokens = await transformTokens(
      resolve(UNPACKED, "Spacing", mode.file),
      ["name/md-spacing", "value/px"],
    );
    responsiveSpacingTokenCount += tokens.length;

    if (mode.minWidth === null) {
      spacingBlocks.push(
        `/* Compact (default) */\n${renderBlock(tokens, ":root")}`,
      );
    } else {
      spacingBlocks.push(
        `/* ${mode.file.replace(".tokens.json", "")} */\n${renderMediaBlock(
          tokens,
          mode.minWidth,
        )}`,
      );
    }
  }

  writeFileSync(
    resolve(OUT, "_spacing.css"),
    HEADER + spacingBlocks.join("\n"),
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
      `[tokens:build] color modes: ${COLOR_MODES.length}; opacity-bearing vars verified: ${alphaTokenCount} (guard passed)\n` +
      `[tokens:build] type modes: ${TYPESCALE_MODES.length}; responsive declarations verified: ${responsiveTokenCount} (line-height guards passed)\n` +
      `[tokens:build] spacing modes: ${SPACING_MODES.length}; responsive declarations verified: ${responsiveSpacingTokenCount}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
