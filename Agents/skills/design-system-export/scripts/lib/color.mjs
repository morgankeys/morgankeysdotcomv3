// Color helpers. The export formats disagree about what a color looks like
// (DESIGN.md wants hex, CSS keeps whatever the kit emitted), so everything
// goes through one parsed representation.

/** @returns {{r:number,g:number,b:number,a:number} | null} */
export function parseColor(value) {
  const v = value.trim().toLowerCase();
  let m = /^#([0-9a-f]{3,8})$/.exec(v);
  if (m) {
    let hex = m[1];
    if (hex.length === 3 || hex.length === 4)
      hex = [...hex].map((c) => c + c).join("");
    if (hex.length !== 6 && hex.length !== 8) return null;
    const n = (i) => parseInt(hex.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? n(6) / 255 : 1 };
  }
  m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[/,]\s*([\d.]+%?))?\s*\)$/.exec(
    v,
  );
  if (m) {
    const alpha = m[4]
      ? m[4].endsWith("%")
        ? parseFloat(m[4]) / 100
        : parseFloat(m[4])
      : 1;
    return { r: +m[1], g: +m[2], b: +m[3], a: alpha };
  }
  return null;
}

export function isColor(value) {
  return parseColor(value) !== null;
}

const hex2 = (n) => Math.round(n).toString(16).padStart(2, "0").toUpperCase();

/** `#RRGGBB`, or `#RRGGBBAA` when the color is translucent. */
export function toHex(value) {
  const c = parseColor(value);
  if (!c) return value;
  const base = `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}`;
  return c.a < 1 ? base + hex2(c.a * 255) : base;
}

function luminance({ r, g, b }) {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** WCAG contrast ratio between two opaque colors, or null if either is unparseable. */
export function contrast(a, b) {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return null;
  const [hi, lo] = [luminance(ca), luminance(cb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
