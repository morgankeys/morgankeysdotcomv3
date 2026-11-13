// Builds the one normalized description of a kit's design system that every
// export target reads. Targets never touch the kit's files directly: if a
// platform needs something new, it is added here once and every target can
// use it.
//
// The kit's own generated CSS is the input, not the Figma token JSON. The CSS
// is what the prototype actually ships (names, units, alpha handling, and
// responsive modes already resolved), so an export built from it cannot drift
// from the kit, and the engine works for any kit that describes its tokens as
// CSS custom properties.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  readCustomProperties,
  stripImports,
  extractComponentCss,
} from "./lib/css.mjs";
import { isColor, toHex } from "./lib/color.mjs";

const TYPE_PROPERTIES = {
  "weight-emphasized": "fontWeightEmphasized",
  "line-height": "lineHeight",
  font: "fontFamily",
  size: "fontSize",
  weight: "fontWeight",
  tracking: "letterSpacing",
  opsz: "opticalSize",
};

export function buildModel(config, root) {
  const read = (path) => {
    const file = resolve(root, path);
    if (!existsSync(file)) {
      const hint = config.prepare
        ? ` Run \`${config.prepare}\` in ${root} first.`
        : "";
      throw new Error(`Design-system source not found: ${file}.${hint}`);
    }
    return readFileSync(file, "utf8");
  };

  const tokenSheets = config.sources.tokens.map(read);
  const baseSheets = (config.sources.base ?? []).map(read);
  const extraSheets = (config.sources.extras ?? []).map(read);

  const colorModes = config.modes.color;
  const windowModes = config.modes.window;
  const contextOf = (decl) => {
    if (decl.media) {
      const mode = windowModes.find((m) => m.media === decl.media);
      return mode && decl.selector === ":root" ? mode.id : null;
    }
    const mode = colorModes.find((m) => m.selector === decl.selector);
    return mode ? mode.id : null;
  };

  // Categories, longest prefix first so `--x-spacing-ui-` style overlaps resolve.
  const categories = Object.entries(config.tokens)
    .map(([id, spec]) => ({ id, ...spec }))
    .sort((a, b) => b.prefix.length - a.prefix.length);

  /** @type {Map<string, {name:string, category:string, key:string, values:Record<string,string>}>} */
  const vars = new Map();
  const declarations = [...tokenSheets, ...baseSheets, ...extraSheets].flatMap(
    readCustomProperties,
  );
  for (const decl of declarations) {
    const context = contextOf(decl);
    if (!context) continue; // scoped to a class or component, not a token mode
    const category = categories.find((c) => decl.name.startsWith(c.prefix));
    if (!category) continue;
    let entry = vars.get(decl.name);
    if (!entry) {
      entry = {
        name: decl.name,
        category: category.id,
        key: decl.name.slice(category.prefix.length),
        values: {},
      };
      vars.set(decl.name, entry);
    }
    entry.values[context] = decl.value;
  }

  const inCategory = (id) => [...vars.values()].filter((v) => v.category === id);
  const defaultColorMode = colorModes[0].id;
  const defaultWindowMode = windowModes[0].id;

  // Window-mode tokens only restate a value where it changes, so fill forward.
  const acrossWindows = (values) => {
    const out = {};
    let last = values[defaultWindowMode] ?? values[defaultColorMode];
    for (const mode of windowModes) {
      last = values[mode.id] ?? last;
      out[mode.id] = last;
    }
    return out;
  };

  // ---------------------------------------------------------------- color ---
  const colorSpec = config.tokens.color;
  const groupOf = (key) =>
    Object.entries(colorSpec.groups ?? {}).find(([, re]) => re.test(key))?.[0] ??
    "core";
  const colors = inCategory("color").map((v) => ({
    name: v.name,
    key: v.key,
    group: groupOf(v.key),
    values: v.values,
    hex: Object.fromEntries(
      Object.entries(v.values).map(([mode, value]) => [mode, toHex(value)]),
    ),
    usage: config.guidance?.colorRoles?.[v.key] ?? "",
  }));

  // ----------------------------------------------------------- typography ---
  const typeProps = { ...TYPE_PROPERTIES, ...(config.tokens.typescale.properties ?? {}) };
  const suffixes = Object.keys(typeProps).sort((a, b) => b.length - a.length);
  const roles = new Map();
  for (const v of inCategory("typescale")) {
    const suffix = suffixes.find((s) => v.key.endsWith(`-${s}`));
    if (!suffix) continue;
    const roleId = v.key.slice(0, -suffix.length - 1);
    if (!roles.has(roleId))
      roles.set(roleId, { id: roleId, vars: {}, modes: {} });
    const role = roles.get(roleId);
    role.vars[typeProps[suffix]] = v.name;
    const perWindow = acrossWindows(v.values);
    for (const mode of windowModes) {
      role.modes[mode.id] ??= {};
      role.modes[mode.id][typeProps[suffix]] = perWindow[mode.id];
    }
  }
  const typography = [...roles.values()].map((role) => ({
    ...role,
    usage: config.guidance?.typeRoles?.[role.id] ?? "",
  }));

  // ------------------------------------------------------ scales and misc ---
  const scale = (id) =>
    inCategory(id).map((v) => ({
      name: v.name,
      key: v.key,
      value: v.values[defaultColorMode] ?? v.values[defaultWindowMode],
      modes: acrossWindows(v.values),
    }));

  const spacingSpec = config.tokens.spacing ?? {};
  const allSpacing = scale("spacing");
  const startsWith = (prefix) => (t) => prefix && t.key.startsWith(prefix);
  const spacing = {
    ui: allSpacing
      .filter(startsWith(spacingSpec.ui))
      .map((t) => ({ ...t, short: t.key.slice(spacingSpec.ui.length) })),
    breakpoints: allSpacing
      .filter(startsWith(spacingSpec.breakpoints))
      .map((t) => ({ ...t, short: t.key.slice(spacingSpec.breakpoints.length) })),
    editorial: allSpacing.filter(
      (t) =>
        !startsWith(spacingSpec.ui)(t) && !startsWith(spacingSpec.breakpoints)(t),
    ),
  };

  const brand = scale("brand").filter((t) => isColor(t.value));

  // ----------------------------------------------------------- components ---
  const components = (config.components ?? []).map((component) => ({
    ...component,
    css: extractComponentCss(read(component.source)),
    tsx: readFileSync(resolve(config.dir, component.react), "utf8"),
  }));

  return {
    name: config.name,
    slug: config.slug,
    version: config.version,
    description: config.description,
    package: config.package,
    homepage: config.homepage,
    config,
    colorModes,
    windowModes,
    defaultColorMode,
    defaultWindowMode,
    darkMode: colorModes.find((m) => m.dark && !m.optional)?.id,
    colors,
    coreColors: colors.filter((c) => c.group === "core"),
    typography,
    shape: scale("shape"),
    spacing,
    elevation: scale("elevation"),
    brand,
    fonts: config.fonts,
    components,
    guidance: config.guidance ?? {},
    shadcn: config.shadcn ?? {},
    /** Raw sheets, for builders that re-bundle the kit's CSS. */
    sheets: {
      tokenDeclarations: tokenSheets.flatMap(readCustomProperties),
      base: baseSheets.map(stripImports).join("\n").trim(),
      extras: extraSheets.map(stripImports).join("\n").trim(),
    },
    /** Look up a color by role key in a given mode, as hex. */
    color(key, mode = defaultColorMode) {
      const token = colors.find((c) => c.key === key);
      if (!token) throw new Error(`Unknown color role "${key}" in export config`);
      return token.hex[mode] ?? token.hex[defaultColorMode];
    },
    /** `var(--…)` for a color role, or the value itself if it is already CSS. */
    colorVar(ref) {
      if (/^(var\(|#|rgb|hsl|oklch)/.test(ref)) return ref;
      const token = colors.find((c) => c.key === ref);
      if (!token) throw new Error(`Unknown color role "${ref}" in export config`);
      return `var(${token.name})`;
    },
  };
}
