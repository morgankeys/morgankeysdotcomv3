/**
 * figma-capture.ts
 *
 * Dev-only "capture to Figma" button from the figma-capture-button package.
 * Under `npm run dev`, a draggable pink button sits in the bottom-right
 * corner. Click it, then pick Entire screen or Select element, and paste into
 * any Figma file (⌘V) to get editable layers. Ctrl+C captures the entire
 * screen directly.
 *
 * The capture itself is Figma's html-to-design script, which the package
 * loads from mcp.figma.com. `import.meta.env.DEV` is `false` in every build,
 * so neither the button nor that request reaches staging or production.
 */

if (import.meta.env.DEV) {
  import("figma-capture-button/auto");
}
