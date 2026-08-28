#!/usr/bin/env node
/**
 * Design-system validation — scans Code/src for token deviations and updates
 * Docs/Design system/deviations-backlog.md.
 *
 * Usage:
 *   node scripts/ds-validate.mjs          # report only (exit 0)
 *   node scripts/ds-validate.mjs --strict # exit 1 when deviations exist (CI gate)
 */

import {
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

const STRICT = process.argv.includes("--strict");

const SCAN_EXTENSIONS = new Set([".css", ".astro", ".vue"]);
const SKIP_DIRS = new Set(["node_modules", ".astro"]);
const SKIP_PATH_PREFIX = "src/styles/tokens/";
const GLOBAL_CSS_REL = "src/styles/global.css";
const FONTS_CSS_REL = "src/styles/fonts.css";

/** @typedef {{ line: number, rule: string, detail: string }} Deviation */

const RULE_DESCRIPTIONS = {
  "hardcoded-color":
    "Color property uses a literal hex/rgb/hsl/named color instead of `var(--md-…)`.",
  "raw-spacing":
    "Spacing property (margin/padding/gap) uses a raw length instead of `var(--md-sys-spacing-…)`.",
  "raw-border-radius":
    "Border-radius uses a raw length instead of `var(--md-sys-shape-corner-…)`.",
  "non-token-font-family":
    "font-family must resolve through `var(--md-ref-font-…)` or `var(--md-sys-typescale-*-font, …)`.",
  "raw-font-size":
    "font-size uses a raw length instead of `var(--md-sys-typescale-…)`.",
  "non-md-token":
    "CSS variable is not from the MD3 token namespace (`--md-sys-*` / `--md-ref-*`).",
  "global-component-leak":
    "Component-level selector or styling detected in global.css (belongs in scoped component styles).",
};

const ALLOWED_LITERALS = new Set([
  "0",
  "0px",
  "0rem",
  "0em",
  "inherit",
  "initial",
  "unset",
  "revert",
  "revert-layer",
  "auto",
  "none",
  "normal",
  "transparent",
  "currentcolor",
  "100%",
  "100vh",
  "100vw",
  "50%",
  "1fr",
  "min-content",
  "max-content",
  "fit-content",
]);

const COLOR_PROP_RE =
  /^(color|background(-color)?|border(-[a-z]+)?-color|fill|stroke|outline-color|caret-color|column-rule-color)$/i;
const SPACING_PROP_RE =
  /^(margin|padding|gap)(-(top|right|bottom|left|block|inline|block-start|block-end|inline-start|inline-end))?$/i;
const RADIUS_PROP_RE =
  /^border(-(top|bottom)(-(left|right))?)?-radius$|^border-radius$/i;

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

/**
 * @param {string} filePath
 * @param {string} content
 * @returns {{ content: string, lineOffset: number }[]}
 */
function extractStyleSections(filePath, content) {
  const ext = filePath.slice(filePath.lastIndexOf("."));
  if (ext === ".css") {
    return [{ content, lineOffset: 0 }];
  }

  /** @type {{ content: string, lineOffset: number }[]} */
  const sections = [];
  const re = /<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi;
  let match;

  while ((match = re.exec(content)) !== null) {
    const lineOffset = content.slice(0, match.index).split("\n").length;
    sections.push({ content: match[1], lineOffset });
  }

  return sections;
}

/** @param {string} css */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** @param {string} value */
function isMdTokenVar(value) {
  return /var\(\s*--md-(sys|ref)-/.test(value);
}

/** @param {string} value */
function isAllowedLiteral(value) {
  const trimmed = value.trim();
  if (ALLOWED_LITERALS.has(trimmed.toLowerCase())) return true;

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return parts.every(
      (part) =>
        ALLOWED_LITERALS.has(part.toLowerCase()) ||
        /^0(px|rem|em)?$/i.test(part) ||
        isMdTokenVar(part),
    );
  }

  return false;
}

/** @param {string} value */
function hasNonMdVar(value) {
  return /var\(\s*--(?!md-(?:sys|ref)-)[\w-]+/.test(value);
}

/** @param {string} value */
function hasColorLiteral(value) {
  if (/#([0-9a-fA-F]{3,8})\b/.test(value)) return true;
  if (/\brgba?\(/i.test(value)) return true;
  if (/\bhsla?\(/i.test(value)) return true;
  if (/^[a-z]+$/i.test(value.trim()) && !isAllowedLiteral(value)) return true;
  return false;
}

/** @param {string} value */
function hasRawLength(value) {
  return /(?<!var\([^)]*)-?\d*\.?\d+(px|rem|em|pt)\b/i.test(value);
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
  const val = value.trim().replace(/\s+/g, " ");

  if (propLower.startsWith("--") || propLower === "content") return;
  if (relPath === FONTS_CSS_REL) return;

  if (hasNonMdVar(val)) {
    deviations.push({
      line,
      rule: "non-md-token",
      detail: `\`${prop}\` references a non-MD3 variable: \`${val}\`.`,
    });
  }

  if (COLOR_PROP_RE.test(propLower)) {
    if (isMdTokenVar(val) || isAllowedLiteral(val)) return;
    if (hasColorLiteral(val)) {
      deviations.push({
        line,
        rule: "hardcoded-color",
        detail: `\`${prop}\` uses a literal color: \`${val}\`.`,
      });
    }
    return;
  }

  if (SPACING_PROP_RE.test(propLower)) {
    if (isMdTokenVar(val) || isAllowedLiteral(val)) return;
    if (hasRawLength(val)) {
      deviations.push({
        line,
        rule: "raw-spacing",
        detail: `\`${prop}\` uses a raw length: \`${val}\`.`,
      });
    }
    return;
  }

  if (RADIUS_PROP_RE.test(propLower)) {
    if (isMdTokenVar(val) || isAllowedLiteral(val)) return;
    if (hasRawLength(val)) {
      deviations.push({
        line,
        rule: "raw-border-radius",
        detail: `\`${prop}\` uses a raw length: \`${val}\`.`,
      });
    }
    return;
  }

  if (propLower === "font-family") {
    if (isMdTokenVar(val)) return;
    deviations.push({
      line,
      rule: "non-token-font-family",
      detail: `\`${prop}\` must use \`var(--md-ref-font-*)\` or typescale font vars: \`${val}\`.`,
    });
    return;
  }

  if (propLower === "font-size") {
    if (isMdTokenVar(val) || isAllowedLiteral(val)) return;
    if (hasRawLength(val) || /^[\d.]+%$/.test(val)) {
      deviations.push({
        line,
        rule: "raw-font-size",
        detail: `\`${prop}\` uses a raw size: \`${val}\`.`,
      });
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

  const declRe = /([a-z][a-z0-9-]*)\s*:\s*([^;{}]+)/gi;
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
        const prelude = css.slice(ruleStart, i).trim();
        if (prelude && !prelude.startsWith("@")) {
          const line = lineOffset + css.slice(0, ruleStart).split("\n").length;
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
    scanCssContent(section.content, section.lineOffset, relPath, deviations);
  }

  return { relPath, deviations };
}

/**
 * @param {Map<string, Deviation[]>} byFile
 * @param {number} fileCount
 * @returns {string}
 */
function formatBacklog(byFile, fileCount) {
  const timestamp = new Date().toISOString();
  let total = 0;
  /** @type {Map<string, number>} */
  const ruleCounts = new Map();

  for (const deviations of byFile.values()) {
    total += deviations.length;
    for (const d of deviations) {
      ruleCounts.set(d.rule, (ruleCounts.get(d.rule) ?? 0) + 1);
    }
  }

  const lines = [
    "# Design system deviations backlog",
    "",
    "> Auto-generated by `npm run ds:validate` in `Code/`.",
    "> Use as a running to-do list for design-system cleanup (see",
    "> [design-in-code architecture.md](./design-in-code%20architecture.md)).",
    "",
    `**Last run:** ${timestamp}`,
    `**Files scanned:** ${fileCount}`,
    `**Total deviations:** ${total}`,
    "",
  ];

  if (total === 0) {
    lines.push("No deviations found.", "");
    lines.push("## Rules enforced", "");
    for (const [rule, description] of Object.entries(RULE_DESCRIPTIONS)) {
      lines.push(`- **${rule}** — ${description}`);
    }
    lines.push("");
    return lines.join("\n");
  }

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
    lines.push("| Line | Rule | Detail |");
    lines.push("| ---- | ---- | ------ |");
    for (const d of deviations.sort(
      (a, b) => a.line - b.line || a.rule.localeCompare(b.rule),
    )) {
      lines.push(`| ${d.line} | ${d.rule} | ${d.detail} |`);
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

  const markdown = formatBacklog(byFile, files.length);
  mkdirSync(dirname(BACKLOG_PATH), { recursive: true });
  writeFileSync(BACKLOG_PATH, markdown, "utf8");

  const total = [...byFile.values()].reduce(
    (sum, list) => sum + list.length,
    0,
  );

  console.log(`Design-system validation complete.`);
  console.log(`  Files scanned: ${files.length}`);
  console.log(`  Deviations:    ${total}`);
  console.log(`  Backlog:       ${relative(REPO_ROOT, BACKLOG_PATH)}`);

  if (STRICT && total > 0) {
    console.error(`\nds:validate --strict: ${total} deviation(s) found.`);
    process.exit(1);
  }
}

main();
