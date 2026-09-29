#!/usr/bin/env node
/**
 * Design-system validation — scans Code/src for token deviations and updates
 * Docs/Design system/deviations-backlog.md.
 *
 * The backlog is regenerated in full on every run. Rationale for accepted
 * deviations lives in Docs/Design system/deviation-rationale.json and is merged
 * into the backlog here, so it survives regeneration. Entries are keyed by an
 * exact match on file + rule + detail (not line, which drifts). An entry that
 * matches no current deviation (the deviation was fixed, or its wording
 * changed) is left in place but reported as unmatched, in the console and in
 * the backlog for that run — it is never rewritten or deleted automatically.
 *
 * Usage:
 *   node scripts/ds-validate.mjs          # report only (exit 0)
 *   node scripts/ds-validate.mjs --strict # exit 1 when deviations exist (CI gate)
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CODE_ROOT = join(__dirname, "..");
const SRC_ROOT = join(CODE_ROOT, "src");
const REPO_ROOT = join(CODE_ROOT, "..");
const BACKLOG_PATH = join(
  REPO_ROOT,
  "Docs",
  "Design system",
  "deviations-backlog.md",
);
const RATIONALE_PATH = join(
  REPO_ROOT,
  "Docs",
  "Design system",
  "deviation-rationale.json",
);

const STRICT = process.argv.includes("--strict");

const SCAN_EXTENSIONS = new Set([".css", ".astro", ".vue"]);
const SKIP_DIRS = new Set(["node_modules", ".astro"]);
const SKIP_PATH_PREFIX = "src/styles/tokens/";
const GLOBAL_CSS_REL = "src/styles/global.css";
const FONTS_CSS_REL = "src/styles/fonts.css";
const BRAND_CSS_REL = "src/styles/brand.css";

/** @typedef {{ line: number, rule: string, detail: string }} Deviation */
/** @typedef {{ file: string, rule: string, detail: string, rationale: string }} RationaleEntry */
/** @typedef {{ text: string, fallback: boolean }} Atom */

const RULE_DESCRIPTIONS = {
  "hardcoded-color":
    "Color property or color-bearing shorthand (`border*`, `outline`, `background*`, `box-shadow`, `text-shadow`) uses a literal hex/rgb/hsl/named color instead of `var(--md-…)`, including as a `var()` fallback.",
  "raw-spacing":
    "Spacing property (margin/padding/gap/row-gap/column-gap) uses a raw length instead of `var(--md-sys-spacing-…)`, including one mixed with a token or inside `calc()`.",
  "raw-border-radius":
    "Border-radius uses a raw length instead of `var(--md-sys-shape-corner-…)`.",
  "non-token-font-family":
    "font-family must resolve through `var(--md-ref-font-…)` or `var(--md-sys-typescale-*-font, …)`.",
  "raw-font-size":
    "font-size uses a raw length instead of `var(--md-sys-typescale-…)`.",
  "raw-typography":
    "font-weight, line-height, or letter-spacing uses a literal instead of `var(--md-sys-typescale-…)`.",
  "non-md-token":
    "CSS variable is not from the MD3 token namespace (`--md-sys-*` / `--md-ref-*`).",
  "local-md-token-override":
    "A component defines an MD3 token (`--md-sys-*` / `--md-ref-*`) with a literal color or length, overriding the generated value locally. Exempt: `src/styles/brand.css`, which defines the `--md-ref-brand-*` primitives the Figma export lacks, and the `--md-sys-elevation-*` shadows in `src/styles/global.css`, which the export does not emit yet.",
  "unscoped-style":
    "Component style block is not scoped: `<style is:global>` / `<style is:inline>` in `.astro`, or `<style>` without `scoped` (or `module`) in `.vue`.",
  "global-component-leak":
    "Component-level selector or styling detected in global.css (belongs in scoped component styles).",
};

/**
 * `var()` fallbacks in global.css are allowed: the base typography there
 * (`var(--md-sys-typescale-body-size, 16px)` and similar) keeps the page
 * readable if the token import ever fails. Fallbacks anywhere else are checked
 * like any other literal.
 */
const FALLBACK_ALLOWED_FILES = new Set([GLOBAL_CSS_REL]);

/** CSS-wide keywords and values that carry no design decision. */
const NEUTRAL_KEYWORDS = new Set([
  "inherit",
  "initial",
  "unset",
  "revert",
  "revert-layer",
  "normal",
  "0",
]);

const COLOR_FUNCTIONS = new Set([
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "hwb",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "color",
]);

// CSS named colors, minus `transparent` and `currentcolor`, which are allowed.
const NAMED_COLORS = new Set(
  `aliceblue antiquewhite aqua aquamarine azure beige bisque black
  blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate
  coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod
  darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange
  darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray
  darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey
  dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold
  goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory
  khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral
  lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink
  lightsalmon lightseagreen lightskyblue lightslategray lightslategrey
  lightsteelblue lightyellow lime limegreen linen magenta maroon
  mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen
  mediumslateblue mediumspringgreen mediumturquoise mediumvioletred
  midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive
  olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise
  palevioletred papayawhip peachpuff peru pink plum powderblue purple
  rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen
  seashell sienna silver skyblue slateblue slategray slategrey snow springgreen
  steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke
  yellow yellowgreen`.split(/\s+/),
);

// Longhand color properties plus the shorthands that can carry a color.
const COLOR_PROP_RE =
  /^(color|accent-color|caret-color|fill|stroke|background(-color|-image)?|border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-color)?|outline(-color)?|column-rule(-color)?|text-decoration(-color)?|box-shadow|text-shadow)$/i;
const SPACING_PROP_RE =
  /^((margin|padding)(-(top|right|bottom|left|block|inline|block-start|block-end|inline-start|inline-end))?|gap|row-gap|column-gap)$/i;
const RADIUS_PROP_RE =
  /^border(-(top|bottom)(-(left|right))?)?-radius$|^border-radius$/i;
const TYPOGRAPHY_PROP_RE = /^(font-weight|line-height|letter-spacing)$/i;

const ALLOWED_GLOBAL_ELEMENTS = new Set([
  "html",
  "body",
  "main",
  "img",
  "picture",
  "video",
  "canvas",
  "svg",
  "input",
  "button",
  "textarea",
  "select",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "code",
  "kbd",
  "pre",
  "samp",
  "a",
]);

const ALLOWED_GLOBAL_UNIVERSAL = /^(\*|(\*::(before|after)))$/;
const ALLOWED_GLOBAL_CLASS = /^\.type-[a-z0-9-]+$/;
const ALLOWED_GLOBAL_PSEUDO = /^::selection$/;

/**
 * @param {string} dir
 * @param {string[]} files
 * @returns {string[]}
 */
function walkSrc(dir, files = []) {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) {
    return files;
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkSrc(join(dir, entry.name), files);
      continue;
    }

    const ext = entry.name.slice(entry.name.lastIndexOf("."));
    if (!SCAN_EXTENSIONS.has(ext)) continue;

    const fullPath = join(dir, entry.name);
    const relPath = relative(CODE_ROOT, fullPath).replace(/\\/g, "/");
    if (relPath.startsWith(SKIP_PATH_PREFIX)) continue;

    files.push(fullPath);
  }

  return files;
}

/** @typedef {{ content: string, lineOffset: number, attrs: string, tagLine: number }} StyleSection */

/**
 * @param {string} filePath
 * @param {string} content
 * @returns {StyleSection[]}
 */
function extractStyleSections(filePath, content) {
  const ext = filePath.slice(filePath.lastIndexOf("."));
  if (ext === ".css") {
    return [{ content, lineOffset: 0, attrs: "", tagLine: 1 }];
  }

  /** @type {StyleSection[]} */
  const sections = [];
  const re = /<style(\s[^>]*)?>([\s\S]*?)<\/style>/gi;
  let match;

  while ((match = re.exec(content)) !== null) {
    // Newlines before the first character of the style body, so a match on
    // the body's first line reports the `<style>` tag's own line number.
    const bodyStart = match.index + match[0].indexOf(">") + 1;
    const lineOffset = content.slice(0, bodyStart).split("\n").length - 1;
    const tagLine = content.slice(0, match.index).split("\n").length;
    sections.push({
      content: match[2],
      lineOffset,
      attrs: (match[1] ?? "").trim(),
      tagLine,
    });
  }

  return sections;
}

/**
 * Flags a style block that is not scoped to its component (AGENTS.md rule 3).
 * @param {string} filePath
 * @param {StyleSection} section
 * @param {Deviation[]} deviations
 */
function checkStyleScope(filePath, section, deviations) {
  const { attrs, tagLine } = section;

  if (filePath.endsWith(".astro") && /(^|\s)is:(global|inline)\b/.test(attrs)) {
    deviations.push({
      line: tagLine,
      rule: "unscoped-style",
      detail: `\`<style ${attrs}>\` applies globally; use a scoped \`<style>\` block.`,
    });
  }

  if (filePath.endsWith(".vue") && !/(^|\s)(scoped|module)\b/.test(attrs)) {
    const tag = attrs ? `<style ${attrs}>` : "<style>";
    deviations.push({
      line: tagLine,
      rule: "unscoped-style",
      detail: `\`${tag}\` without \`scoped\` applies globally; use \`<style scoped>\`.`,
    });
  }
}

/**
 * Removes comments but keeps their newlines, so line numbers computed from the
 * stripped text still match the source file.
 * @param {string} css
 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (comment) =>
    comment.replace(/[^\n]/g, ""),
  );
}

/** @param {string} value */
function isMdTokenVar(value) {
  return /var\(\s*--md-(sys|ref)-/.test(value);
}

/** @param {string} value */
function hasNonMdVar(value) {
  return /var\(\s*--(?!md-(?:sys|ref)-)[\w-]+/.test(value);
}

/**
 * Index of the parenthesis that closes the one at `open`, or the end of the
 * string when it is unbalanced.
 * @param {string} value
 * @param {number} open
 */
function matchingParen(value, open) {
  let depth = 0;
  for (let i = open; i < value.length; i += 1) {
    if (value[i] === "(") depth += 1;
    if (value[i] === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return value.length;
}

/** @param {string} value */
function topLevelComma(value) {
  let depth = 0;
  for (let i = 0; i < value.length; i += 1) {
    if (value[i] === "(") depth += 1;
    else if (value[i] === ")") depth -= 1;
    else if (value[i] === "," && depth === 0) return i;
  }
  return -1;
}

/**
 * Splits a value into the literal pieces written in it: whitespace-, comma-
 * and slash-separated words, looking inside functions such as `calc()`,
 * `color-mix()` and `linear-gradient()`. A `var()` reference is not a literal,
 * but its fallback is scanned (and marked `fallback`). A color function such
 * as `rgb(…)` is kept whole; `url()` is skipped.
 * @param {string} value
 * @param {boolean} [fallback]
 * @param {Atom[]} [atoms]
 * @returns {Atom[]}
 */
function literalAtoms(value, fallback = false, atoms = []) {
  let word = "";
  const flush = () => {
    if (word) atoms.push({ text: word, fallback });
    word = "";
  };

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];

    if (char === "(") {
      const name = word.toLowerCase();
      word = "";
      const close = matchingParen(value, i);
      const inner = value.slice(i + 1, close);

      if (name === "var") {
        const comma = topLevelComma(inner);
        if (comma !== -1) literalAtoms(inner.slice(comma + 1), true, atoms);
      } else if (COLOR_FUNCTIONS.has(name)) {
        atoms.push({ text: `${name}(${inner.trim()})`, fallback });
      } else if (name !== "url") {
        literalAtoms(inner, fallback, atoms);
      }

      i = close;
      continue;
    }

    if (/[\s,/]/.test(char)) {
      flush();
      continue;
    }

    word += char;
  }

  flush();
  return atoms;
}

/** @param {string} text */
function isColorAtom(text) {
  const lower = text.toLowerCase();
  if (/^#[0-9a-f]{3,8}$/.test(lower)) return true;
  if (COLOR_FUNCTIONS.has(lower.slice(0, lower.indexOf("(")))) return true;
  return NAMED_COLORS.has(lower);
}

/** A non-zero length in px/rem/em/pt. @param {string} text */
function isRawLength(text) {
  const match = /^[+-]?(\d+\.?\d*|\.\d+)(px|rem|em|pt)$/i.exec(text);
  return match !== null && Number.parseFloat(match[1]) !== 0;
}

/**
 * @param {string} selector
 * @param {number} line
 * @param {Deviation[]} deviations
 */
function checkGlobalSelector(selector, line, deviations) {
  for (const sel of selector
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)) {
    if (
      ALLOWED_GLOBAL_UNIVERSAL.test(sel) ||
      ALLOWED_GLOBAL_ELEMENTS.has(sel) ||
      ALLOWED_GLOBAL_PSEUDO.test(sel) ||
      ALLOWED_GLOBAL_CLASS.test(sel)
    ) {
      continue;
    }

    if (
      /^[a-z][a-z0-9-]*(:{1,2}[a-z-]+)?$/i.test(sel) &&
      ALLOWED_GLOBAL_ELEMENTS.has(sel.split(":")[0])
    ) {
      continue;
    }

    const classMatches = sel.match(/\.[a-zA-Z_][\w-]*/g);
    if (classMatches) {
      for (const cls of classMatches) {
        if (!ALLOWED_GLOBAL_CLASS.test(cls)) {
          deviations.push({
            line,
            rule: "global-component-leak",
            detail: `Non-universal class selector \`${cls}\` in global.css (use scoped component styles).`,
          });
        }
      }
      continue;
    }

    if (sel.startsWith("#")) {
      deviations.push({
        line,
        rule: "global-component-leak",
        detail: `ID selector \`${sel}\` in global.css.`,
      });
      continue;
    }

    if (/[#.[]/.test(sel)) {
      deviations.push({
        line,
        rule: "global-component-leak",
        detail: `Selector \`${sel}\` looks like component styling in global.css.`,
      });
    }
  }
}

/**
 * @param {string} prop
 * @param {string} value
 * @param {number} line
 * @param {string} relPath
 * @param {Deviation[]} deviations
 */
function analyzeDeclaration(prop, value, line, relPath, deviations) {
  const propLower = prop.trim().toLowerCase();
  const val = value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\(\s/g, "(")
    .replace(/\s\)/g, ")");

  if (propLower === "content") return;
  if (relPath === FONTS_CSS_REL) return;

  const allowFallback = FALLBACK_ALLOWED_FILES.has(relPath);
  const atoms = literalAtoms(val).filter(
    (atom) => !(atom.fallback && allowFallback),
  );
  /** @param {string} rule @param {string} detail */
  const report = (rule, detail) => deviations.push({ line, rule, detail });

  if (propLower.startsWith("--")) {
    if (!/^--md-(sys|ref)-/.test(propLower)) return;
    if (relPath === BRAND_CSS_REL) return;
    if (
      relPath === GLOBAL_CSS_REL &&
      propLower.startsWith("--md-sys-elevation-")
    ) {
      return;
    }
    if (atoms.some((a) => isColorAtom(a.text) || isRawLength(a.text))) {
      report(
        "local-md-token-override",
        `\`${prop}\` redefines an MD3 token with a literal value: \`${val}\`.`,
      );
    }
    return;
  }

  if (hasNonMdVar(val)) {
    report(
      "non-md-token",
      `\`${prop}\` references a non-MD3 variable: \`${val}\`.`,
    );
  }

  if (COLOR_PROP_RE.test(propLower)) {
    if (atoms.some((a) => isColorAtom(a.text))) {
      report(
        "hardcoded-color",
        `\`${prop}\` uses a literal color: \`${val}\`.`,
      );
    }
    return;
  }

  if (SPACING_PROP_RE.test(propLower)) {
    if (atoms.some((a) => isRawLength(a.text))) {
      report("raw-spacing", `\`${prop}\` uses a raw length: \`${val}\`.`);
    }
    return;
  }

  if (RADIUS_PROP_RE.test(propLower)) {
    if (atoms.some((a) => isRawLength(a.text))) {
      report("raw-border-radius", `\`${prop}\` uses a raw length: \`${val}\`.`);
    }
    return;
  }

  if (propLower === "font-family") {
    const literals = atoms.filter(
      (a) => !NEUTRAL_KEYWORDS.has(a.text.toLowerCase()),
    );
    if (!isMdTokenVar(val) || literals.length > 0) {
      report(
        "non-token-font-family",
        `\`${prop}\` must use \`var(--md-ref-font-*)\` or typescale font vars: \`${val}\`.`,
      );
    }
    return;
  }

  if (propLower === "font-size") {
    if (
      atoms.some(
        (a) =>
          isRawLength(a.text) ||
          (/^[\d.]+%$/.test(a.text) && a.text !== "100%"),
      )
    ) {
      report("raw-font-size", `\`${prop}\` uses a raw size: \`${val}\`.`);
    }
    return;
  }

  if (TYPOGRAPHY_PROP_RE.test(propLower)) {
    if (atoms.some((a) => !NEUTRAL_KEYWORDS.has(a.text.toLowerCase()))) {
      report(
        "raw-typography",
        `\`${prop}\` uses a literal instead of a typescale token: \`${val}\`.`,
      );
    }
  }
}

/**
 * @param {string} css
 * @param {number} lineOffset
 * @param {string} relPath
 * @param {Deviation[]} deviations
 */
function scanCssContent(css, lineOffset, relPath, deviations) {
  const stripped = stripComments(css);

  if (relPath === GLOBAL_CSS_REL) {
    scanGlobalSelectors(stripped, lineOffset, deviations);
  }

  // A declaration is a property (custom properties included) followed by a
  // value that ends at `;` or `}`. Requiring that terminator keeps selectors
  // such as `a:hover {` and at-rule preludes such as `(min-width: 600px) {`
  // from being read as declarations.
  const declRe =
    /(?<![\w-])(--[\w-]+|[a-z][a-z0-9-]*)\s*:\s*([^;{}]+)(?=[;}]|$)/gi;
  let match;

  while ((match = declRe.exec(stripped)) !== null) {
    const before = stripped.slice(0, match.index);
    const line = lineOffset + before.split("\n").length;
    analyzeDeclaration(match[1], match[2], line, relPath, deviations);
  }
}

/**
 * @param {string} css
 * @param {number} lineOffset
 * @param {Deviation[]} deviations
 */
function scanGlobalSelectors(css, lineOffset, deviations) {
  let depth = 0;
  let ruleStart = 0;

  for (let i = 0; i < css.length; i += 1) {
    const char = css[i];

    if (char === "{") {
      if (depth === 0) {
        const raw = css.slice(ruleStart, i);
        const prelude = raw.trim();
        if (prelude && !prelude.startsWith("@")) {
          const preludeStart = ruleStart + raw.search(/\S/);
          const line =
            lineOffset + css.slice(0, preludeStart).split("\n").length;
          checkGlobalSelector(prelude, line, deviations);
        }
      }
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        ruleStart = i + 1;
      }
    }
  }
}

/**
 * @param {string} filePath
 * @returns {{ relPath: string, deviations: Deviation[] }}
 */
function scanFile(filePath) {
  const relPath = relative(CODE_ROOT, filePath).replace(/\\/g, "/");
  const content = readFileSync(filePath, "utf8");
  const sections = extractStyleSections(filePath, content);

  /** @type {Deviation[]} */
  const deviations = [];

  if (
    sections.length === 0 &&
    (filePath.endsWith(".astro") || filePath.endsWith(".vue"))
  ) {
    return { relPath, deviations };
  }

  for (const section of sections) {
    checkStyleScope(filePath, section, deviations);
    scanCssContent(section.content, section.lineOffset, relPath, deviations);
  }

  return { relPath, deviations };
}

/**
 * @param {string} file
 * @param {string} rule
 * @param {string} detail
 */
function rationaleKey(file, rule, detail) {
  return JSON.stringify([file, rule, detail]);
}

/**
 * Reads the rationale file, which people and agents edit directly; the
 * validator only reads it. A missing file means no rationale; a malformed
 * one stops the run rather than silently dropping notes.
 * @returns {RationaleEntry[]}
 */
function loadRationale() {
  if (!existsSync(RATIONALE_PATH)) return [];

  const where = relative(REPO_ROOT, RATIONALE_PATH);
  const raw = readFileSync(RATIONALE_PATH, "utf8");
  /** @type {unknown} */
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`${where}: invalid JSON (${error.message})`, {
      cause: error,
    });
  }

  const entries = /** @type {{ entries?: unknown }} */ (parsed)?.entries;
  if (!Array.isArray(entries)) {
    throw new Error(`${where}: expected an object with an "entries" array.`);
  }

  entries.forEach((entry, index) => {
    for (const field of ["file", "rule", "detail", "rationale"]) {
      if (typeof entry?.[field] !== "string" || entry[field].trim() === "") {
        throw new Error(
          `${where}: entries[${index}] needs a non-empty string "${field}".`,
        );
      }
    }
  });

  return entries;
}

/**
 * Matches rationale entries to current deviations by an exact key. Entries
 * that don't match are reported as unmatched (not removed): the deviation
 * may have been fixed, or the wording may have changed and the entry needs
 * updating by hand.
 * @param {Map<string, Deviation[]>} byFile
 * @param {RationaleEntry[]} entries
 * @returns {{
 *   lookup: Map<string, string>,
 *   unmatched: RationaleEntry[],
 * }}
 */
function matchRationale(byFile, entries) {
  /** @type {Set<string>} */
  const current = new Set();
  for (const [relPath, deviations] of byFile) {
    for (const d of deviations) {
      current.add(rationaleKey(relPath, d.rule, d.detail));
    }
  }

  /** @type {Map<string, string>} */
  const lookup = new Map();
  /** @type {RationaleEntry[]} */
  const unmatched = [];

  for (const entry of entries) {
    const key = rationaleKey(entry.file, entry.rule, entry.detail);
    // A duplicate entry for a deviation that already has one counts as unmatched.
    if (current.has(key) && !lookup.has(key)) {
      lookup.set(key, entry.rationale.trim());
    } else {
      unmatched.push(entry);
    }
  }

  return { lookup, unmatched };
}

/** @param {string} text */
function tableCell(text) {
  return text.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");
}

/**
 * @param {Map<string, Deviation[]>} byFile
 * @param {number} fileCount
 * @param {Map<string, string>} rationale
 * @param {RationaleEntry[]} unmatched
 * @returns {string}
 */
function formatBacklog(byFile, fileCount, rationale, unmatched) {
  let total = 0;
  let explained = 0;
  /** @type {Map<string, number>} */
  const ruleCounts = new Map();

  for (const [relPath, deviations] of byFile) {
    total += deviations.length;
    for (const d of deviations) {
      ruleCounts.set(d.rule, (ruleCounts.get(d.rule) ?? 0) + 1);
      if (rationale.has(rationaleKey(relPath, d.rule, d.detail))) {
        explained += 1;
      }
    }
  }

  const lines = [
    "# Design system deviations backlog",
    "",
    "> Auto-generated by `npm run ds:validate` in `Code/`. Do not edit by hand.",
    "> Use as a running to-do list for design-system cleanup (see",
    "> [design-in-code architecture.md](./design-in-code%20architecture.md)).",
    "> Record rationale for accepted deviations in",
    "> [deviation-rationale.json](./deviation-rationale.json); it is merged in on every run.",
    "",
    `**Files scanned:** ${fileCount}`,
    `**Total deviations:** ${total}`,
    `**With rationale:** ${explained} of ${total}`,
    "",
  ];

  if (total === 0) {
    lines.push("No deviations found.", "");
  } else {
    lines.push("## Summary by rule", "");
    lines.push("| Rule | Count |");
    lines.push("| ---- | ----- |");
    for (const [rule, count] of [...ruleCounts.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    )) {
      lines.push(`| ${rule} | ${count} |`);
    }
    lines.push("");

    lines.push("## Deviations by file", "");

    for (const [relPath, deviations] of [...byFile.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    )) {
      if (deviations.length === 0) continue;

      lines.push(`### \`${relPath}\``, "");
      lines.push("| Line | Rule | Detail | Rationale |");
      lines.push("| ---- | ---- | ------ | --------- |");
      for (const d of deviations.sort(
        (a, b) => a.line - b.line || a.rule.localeCompare(b.rule),
      )) {
        const note =
          rationale.get(rationaleKey(relPath, d.rule, d.detail)) ?? "—";
        lines.push(
          `| ${d.line} | ${d.rule} | ${d.detail} | ${tableCell(note)} |`,
        );
      }
      lines.push("");
    }
  }

  if (unmatched.length > 0) {
    lines.push("## Unmatched rationale entries", "");
    lines.push(
      "These entries in `deviation-rationale.json` match no current deviation " +
        "(fixed, or reworded) and were left as is. Update or remove them by hand.",
      "",
    );
    lines.push("| File | Rule | Detail |");
    lines.push("| ---- | ---- | ------ |");
    for (const entry of unmatched) {
      lines.push(
        `| \`${entry.file}\` | ${entry.rule} | ${tableCell(entry.detail)} |`,
      );
    }
    lines.push("");
  }

  lines.push("## Rules enforced", "");
  for (const [rule, description] of Object.entries(RULE_DESCRIPTIONS)) {
    lines.push(`- **${rule}** — ${description}`);
  }
  lines.push("");

  return lines.join("\n");
}

function main() {
  const files = walkSrc(SRC_ROOT);
  /** @type {Map<string, Deviation[]>} */
  const byFile = new Map();

  for (const filePath of files.sort()) {
    const { relPath, deviations } = scanFile(filePath);
    if (deviations.length > 0) {
      byFile.set(relPath, deviations);
    }
  }

  const rationaleEntries = loadRationale();
  const { lookup, unmatched } = matchRationale(byFile, rationaleEntries);
  const markdown = formatBacklog(byFile, files.length, lookup, unmatched);
  // Write only on a real change, so an unchanged run leaves the tree clean.
  const previous = existsSync(BACKLOG_PATH)
    ? readFileSync(BACKLOG_PATH, "utf8")
    : null;
  if (markdown !== previous) {
    mkdirSync(dirname(BACKLOG_PATH), { recursive: true });
    writeFileSync(BACKLOG_PATH, markdown, "utf8");
  }

  const total = [...byFile.values()].reduce(
    (sum, list) => sum + list.length,
    0,
  );

  console.log(`Design-system validation complete.`);
  console.log(`  Files scanned: ${files.length}`);
  console.log(`  Deviations:    ${total}`);
  console.log(`  Backlog:       ${relative(REPO_ROOT, BACKLOG_PATH)}`);

  if (unmatched.length > 0) {
    console.warn(
      `\n${relative(REPO_ROOT, RATIONALE_PATH)}: ${unmatched.length} entr${unmatched.length === 1 ? "y" : "ies"} match no current deviation:`,
    );
    for (const entry of unmatched) {
      console.warn(`  - ${entry.file} [${entry.rule}] ${entry.detail}`);
    }
  }

  if (STRICT && total > 0) {
    console.error(`\nds:validate --strict: ${total} deviation(s) found.`);
    process.exit(1);
  }
}

main();
