// Minimal CSS reader for the exporter. It only needs two things from a
// stylesheet: every custom-property declaration with the context it was
// declared in (selector + enclosing @media), and the contents of a
// component's <style> block. A full CSS parser would be a dependency for no gain.

export function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/**
 * Every `--name: value` in the sheet, in source order.
 * @returns {{name: string, value: string, selector: string, media: string | null}[]}
 */
export function readCustomProperties(source) {
  const css = stripComments(source);
  const out = [];
  const stack = []; // enclosing preludes, outermost first
  let buffer = "";

  const flush = () => {
    const text = buffer.trim();
    buffer = "";
    const match = /^(--[\w-]+)\s*:\s*([\s\S]+)$/.exec(text);
    if (!match || stack.length === 0) return;
    const media = stack.find((p) => p.startsWith("@media"));
    const selector = stack.filter((p) => !p.startsWith("@")).join(" ");
    out.push({
      name: match[1],
      value: match[2].replace(/\s+/g, " ").trim(),
      selector,
      media: media ? media.replace(/^@media\s*/, "").trim() : null,
    });
  };

  for (const char of css) {
    if (char === "{") {
      stack.push(buffer.replace(/\s+/g, " ").trim());
      buffer = "";
    } else if (char === "}") {
      flush();
      stack.pop();
    } else if (char === ";") {
      flush();
    } else {
      buffer += char;
    }
  }
  return out;
}

/** Drop `@import` statements so a sheet can be re-bundled in a different order. */
export function stripImports(css) {
  return css.replace(/^\s*@import\s+[^;]+;\s*$/gm, "");
}

/**
 * Pull the stylesheet out of a single-file component (.vue / .astro) and make
 * it plain CSS: framework-only pseudo-selectors are unwrapped.
 */
export function extractComponentCss(source) {
  const blocks = [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)];
  if (blocks.length === 0) return source; // already a .css file
  return blocks
    .map((m) => dedent(m[1]))
    .join("\n")
    .replace(/:deep\(([^)]+)\)/g, "$1")
    .replace(/:global\(([^)]+)\)/g, "$1")
    .trim();
}

export function dedent(text) {
  const lines = text.replace(/^\n+|\s+$/g, "").split("\n");
  const indent = Math.min(
    ...lines.filter((l) => l.trim()).map((l) => /^ */.exec(l)[0].length),
  );
  return lines.map((l) => l.slice(indent)).join("\n");
}

export function indent(text, spaces = 2) {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((l) => (l.trim() ? pad + l : l))
    .join("\n");
}
