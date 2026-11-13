// Design-system export config for this prototype.
//
// The export engine lives in Agents/skills/design-system-export/ and is the
// same for every kit. Everything that is specific to *this* design system is
// in this file and in ./react/: where the tokens are, what the roles mean, how
// they map onto the conventions other platforms expect, and which components
// ship. Run it with `npm run ds:export` (see the skill for targets and flags).

const pkg = {
  // The npm scope must be one you can publish to. Change it before publishing.
  name: "@morgankeys/dune-design-system",
  license: "UNLICENSED",
};

export default {
  name: "DUNE",
  slug: "dune",
  version: "0.1.0",
  description:
    "A warm, editorial Material 3 system: sand-toned surfaces, a serif display face, and a quiet blue accent.",
  homepage: "https://morgankeys.com",
  package: pkg,
  // Specimen line on the generated style-guide page.
  sampleText: "Sand, stone, and a quiet blue",

  // Printed when a source file is missing (the token CSS is gitignored).
  prepare: "npm run tokens",

  sources: {
    // Parsed into the model and re-emitted, mode by mode.
    tokens: [
      "src/styles/tokens/_color.css",
      "src/styles/tokens/_typescale.css",
      "src/styles/tokens/_shape.css",
      "src/styles/tokens/_spacing.css",
      "src/styles/tokens/_font.css",
    ],
    // Shipped as the base layer with its @imports removed.
    base: ["src/styles/global.css"],
    // Shipped as-is after the tokens.
    extras: ["src/styles/brand.css"],
  },

  modes: {
    // `selector` is how the kit writes the mode; `exportSelector` is what the
    // exports use, so they also answer to the `.dark` class other stacks toggle.
    color: [
      { id: "light", label: "Light", selector: ":root" },
      {
        id: "dark",
        label: "Dark",
        dark: true,
        selector: ':root[data-theme="dark"]',
        exportSelector: ':root[data-theme="dark"], .dark',
      },
      {
        id: "light-medium-contrast",
        label: "Light, medium contrast",
        optional: true,
        selector: ':root[data-contrast="medium"]',
      },
      {
        id: "light-high-contrast",
        label: "Light, high contrast",
        optional: true,
        selector: ':root[data-contrast="high"]',
      },
      {
        id: "dark-medium-contrast",
        label: "Dark, medium contrast",
        optional: true,
        dark: true,
        selector: ':root[data-theme="dark"][data-contrast="medium"]',
        exportSelector:
          ':root[data-theme="dark"][data-contrast="medium"], .dark[data-contrast="medium"]',
      },
      {
        id: "dark-high-contrast",
        label: "Dark, high contrast",
        optional: true,
        dark: true,
        selector: ':root[data-theme="dark"][data-contrast="high"]',
        exportSelector:
          ':root[data-theme="dark"][data-contrast="high"], .dark[data-contrast="high"]',
      },
    ],
    window: [
      { id: "compact", label: "Compact", media: null, from: "0" },
      {
        id: "medium",
        label: "Medium",
        media: "(min-width: 37.5em)",
        from: "600px",
      },
      {
        id: "expanded",
        label: "Expanded",
        media: "(min-width: 52.5em)",
        from: "840px",
      },
    ],
  },

  tokens: {
    color: {
      prefix: "--dune-sys-color-",
      // Everything else is a core role.
      groups: {
        stateLayers: /^state-layers-/,
        palettes: /^palettes-/,
        tints: /^surfaces-/,
        addOns: /^add-ons-/,
      },
    },
    typescale: { prefix: "--dune-sys-typescale-" },
    shape: { prefix: "--dune-sys-shape-corner-" },
    spacing: {
      prefix: "--dune-sys-spacing-",
      ui: "ui-",
      breakpoints: "breakpoints-",
    },
    elevation: { prefix: "--dune-sys-elevation-" },
    brand: { prefix: "--md-ref-brand-" },
    font: { prefix: "--md-ref-font-" },
  },

  fonts: [
    {
      family: "Platypi",
      role: "brand",
      variable: "--md-ref-font-brand",
      use: "Display, headlines, section headings, quotes, and metrics.",
      fallback: "Georgia, serif",
      weights: [400, 500, 600, 700],
      google: true,
    },
    {
      family: "Instrument Sans",
      role: "plain",
      variable: "--md-ref-font-plain",
      use: "Body copy, UI labels, titles, and captions.",
      fallback: "system-ui, sans-serif",
      weights: [400, 500, 600, 700],
      google: true,
    },
    {
      family: "IBM Plex Mono",
      role: "mono",
      variable: "--md-ref-font-mono",
      use: "Inline code and tabular figures.",
      fallback: "ui-monospace, monospace",
      weights: [400, 500],
      google: true,
    },
  ],

  // shadcn/ui semantic variable -> color role (or any CSS value). Most of the
  // target platforms generate shadcn + Tailwind by default, so this mapping is
  // what puts everything they generate on-system without further prompting.
  shadcn: {
    radius: "medium",
    colors: {
      background: "surface",
      foreground: "on-surface",
      card: "surface-container-low",
      "card-foreground": "on-surface",
      popover: "surface-container",
      "popover-foreground": "on-surface",
      primary: "primary",
      "primary-foreground": "on-primary",
      secondary: "surface-container",
      "secondary-foreground": "on-surface",
      muted: "surface-container",
      "muted-foreground": "on-surface-variant",
      accent: "surface-container-high",
      "accent-foreground": "on-surface",
      destructive: "error",
      "destructive-foreground": "on-error",
      border: "outline-variant",
      input: "outline",
      ring: "secondary",
      "chart-1": "var(--md-ref-brand-rust)",
      "chart-2": "var(--md-ref-brand-teal)",
      "chart-3": "var(--md-ref-brand-ochre)",
      "chart-4": "var(--md-ref-brand-dusk)",
      "chart-5": "var(--md-ref-brand-sun)",
      sidebar: "surface-container-low",
      "sidebar-foreground": "on-surface",
      "sidebar-primary": "primary",
      "sidebar-primary-foreground": "on-primary",
      "sidebar-accent": "surface-container-high",
      "sidebar-accent-foreground": "on-surface",
      "sidebar-border": "outline-variant",
      "sidebar-ring": "secondary",
    },
  },

  // Tailwind radius step -> shape token.
  tailwind: {
    radius: {
      xs: "extra-small",
      sm: "small",
      md: "medium",
      lg: "large",
      xl: "large-increased",
      "2xl": "extra-large",
      "3xl": "extra-large-increased",
      "4xl": "extra-extra-large",
    },
  },

  // DESIGN.md has one value per token. Which modes supply it, and which scale
  // steps get the short names its spec suggests.
  designMd: {
    windowMode: "expanded",
    typography: [
      "display-large",
      "display-medium",
      "display-small",
      "headline-large",
      "headline-medium",
      "headline-small",
      "title-large",
      "title-medium",
      "title-small",
      "body-large",
      "body-medium",
      "body-small",
      "label-large",
      "label-medium",
      "label-small",
      "title",
      "standfirst",
      "section",
      "subsection",
      "body",
      "eyebrow",
      "caption",
      "quote",
      "metric",
      "code-inline",
    ],
    components: {
      "button-filled": {
        backgroundColor: "{colors.primary}",
        textColor: "{colors.on-primary}",
        typography: "{typography.label-large}",
        rounded: "{rounded.full}",
        height: "40px",
        padding: "0 16px",
      },
      "button-tonal": {
        backgroundColor: "{colors.surface-container}",
        textColor: "{colors.on-surface}",
        typography: "{typography.label-large}",
        rounded: "{rounded.full}",
        height: "40px",
        padding: "0 16px",
      },
      "button-outlined": {
        backgroundColor: "transparent",
        textColor: "{colors.on-surface-variant}",
        typography: "{typography.label-large}",
        rounded: "{rounded.full}",
        height: "40px",
        padding: "0 16px",
      },
      "button-elevated": {
        backgroundColor: "{colors.surface-container-low}",
        textColor: "{colors.primary}",
        typography: "{typography.label-large}",
        rounded: "{rounded.full}",
        height: "40px",
        padding: "0 16px",
      },
      "button-text": {
        backgroundColor: "transparent",
        textColor: "{colors.primary}",
        typography: "{typography.label-large}",
        rounded: "{rounded.full}",
        height: "40px",
        padding: "0 16px",
      },
      "button-filled-pressed": {
        backgroundColor: "{colors.primary}",
        textColor: "{colors.on-primary}",
        rounded: "{rounded.small}",
      },
      "icon-button-tonal": {
        backgroundColor: "{colors.surface-container}",
        textColor: "{colors.on-surface}",
        rounded: "{rounded.full}",
        size: "40px",
      },
      "icon-button-filled": {
        backgroundColor: "{colors.primary}",
        textColor: "{colors.on-primary}",
        rounded: "{rounded.full}",
        size: "40px",
      },
      tag: {
        backgroundColor: "{colors.surface-container}",
        textColor: "{colors.on-surface-variant}",
        typography: "{typography.label-medium}",
        rounded: "{rounded.full}",
        padding: "4px 12px",
      },
      card: {
        backgroundColor: "{colors.surface-container-low}",
        textColor: "{colors.on-surface}",
        rounded: "{rounded.large}",
        padding: "24px",
      },
      "input-field": {
        backgroundColor: "{colors.surface}",
        textColor: "{colors.on-surface}",
        typography: "{typography.body-large}",
        rounded: "{rounded.small}",
        height: "48px",
        padding: "0 16px",
      },
    },
  },

  components: [
    {
      name: "Button",
      source: "src/components/Button.vue",
      react: "react/Button.tsx",
      summary:
        "Label button in five emphasis levels. The default action control.",
      props: [
        {
          name: "variant",
          type: '"filled" | "tonal" | "outlined" | "elevated" | "text"',
          default: '"filled"',
          description:
            "Emphasis. `filled` for the one primary action in a view, `tonal` for secondary actions, `outlined` or `text` for the rest, `elevated` only on busy or image backgrounds.",
        },
        {
          name: "size",
          type: '"xs" | "sm" | "md" | "lg" | "xl"',
          default: '"sm"',
          description:
            "Heights 32, 40, 56, 96, and 136px. Use `sm` in app UI, `md` for a hero call to action. `lg` and `xl` are display sizes.",
        },
        {
          name: "shape",
          type: '"round" | "square"',
          default: '"round"',
          description: "Fully rounded pill, or a rounded rectangle.",
        },
        {
          name: "as",
          type: '"button" | "a"',
          default: '"button"',
          description: "Render a link styled as a button. Requires `href`.",
        },
        {
          name: "href",
          type: "string",
          description: 'Link target when `as="a"`.',
        },
        {
          name: "type",
          type: '"button" | "submit" | "reset"',
          default: '"button"',
          description: "Native button type.",
        },
        { name: "disabled", type: "boolean", default: "false" },
        {
          name: "icon",
          type: "ReactNode",
          description:
            "Leading icon. Pass an inline SVG that uses `currentColor`; the button sizes it.",
        },
      ],
      usage: `<Button onClick={save}>Save changes</Button>
<Button variant="tonal">Cancel</Button>
<Button variant="outlined" as="a" href="/pricing">See pricing</Button>
<Button size="md" icon={<ArrowIcon />}>Get started</Button>`,
      // Self-contained JSX for the generated style-guide page.
      showcase: `<Button>Filled</Button>
<Button variant="tonal">Tonal</Button>
<Button variant="outlined">Outlined</Button>
<Button variant="elevated">Elevated</Button>
<Button variant="text">Text</Button>
<Button disabled>Disabled</Button>
<Button size="xs">Extra small</Button>
<Button size="md" shape="square">Medium square</Button>`,
      notes: [
        "Use one `filled` button per view. A second primary action is a sign the view is doing two jobs.",
        "Labels are sentence case and start with a verb: “Save changes”, not “SAVE” or “Changes”.",
        "Do not restyle with utility classes for color, radius, or height. Pick a variant, size, and shape instead.",
        "Hover, focus, pressed, and disabled states are built in. Pressing morphs the corner radius; do not add your own transitions.",
      ],
    },
    {
      name: "IconButton",
      source: "src/components/IconButton.vue",
      react: "react/IconButton.tsx",
      summary: "Icon-only button for compact, familiar actions.",
      props: [
        {
          name: "label",
          type: "string",
          description:
            "Required. Accessible name, since there is no visible text.",
        },
        {
          name: "variant",
          type: '"filled" | "tonal" | "outlined" | "standard"',
          default: '"tonal"',
          description:
            "`standard` has no container and suits toolbars; `tonal` is the default standalone style.",
        },
        {
          name: "size",
          type: '"xs" | "sm" | "md" | "lg" | "xl"',
          default: '"sm"',
          description:
            "Container 32, 40, 56, 96, and 136px. The hit area is never smaller than 48px.",
        },
        { name: "shape", type: '"round" | "square"', default: '"round"' },
        {
          name: "width",
          type: '"narrow" | "default" | "wide"',
          default: '"default"',
        },
        { name: "as", type: '"button" | "a"', default: '"button"' },
        { name: "href", type: "string" },
        {
          name: "type",
          type: '"button" | "submit" | "reset"',
          default: '"button"',
        },
        { name: "disabled", type: "boolean", default: "false" },
      ],
      usage: `<IconButton label="Close" onClick={close}>
  <CloseIcon />
</IconButton>
<IconButton label="Next" variant="filled" size="md">
  <ArrowIcon />
</IconButton>`,
      showcase: `<IconButton label="Add" variant="filled">
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" /></svg>
</IconButton>
<IconButton label="Add">
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" /></svg>
</IconButton>
<IconButton label="Add" variant="outlined">
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" /></svg>
</IconButton>
<IconButton label="Add" variant="standard">
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" /></svg>
</IconButton>
<IconButton label="Add" variant="filled" size="md" shape="square">
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" /></svg>
</IconButton>`,
      notes: [
        "Always pass `label`. Use it for the action (“Close dialog”), not the icon (“X”).",
        "Only for actions whose icon is unambiguous: close, back, next, menu, search, theme. Otherwise use a `Button` with a label.",
        "Children are a single inline SVG that uses `currentColor`.",
      ],
    },
    {
      name: "Tag",
      source: "src/components/Tag.astro",
      react: "react/Tag.tsx",
      summary: "Small pill label for categories and metadata. Not interactive.",
      props: [
        {
          name: "className",
          type: "string",
          description: "Layout classes only (margin, alignment).",
        },
      ],
      usage: `<Tag>Design systems</Tag>
<Tag>2026</Tag>`,
      showcase: `<Tag>Design systems</Tag>
<Tag>Prototyping</Tag>
<Tag>2026</Tag>`,
      notes: [
        "Tags are static labels. For a removable or selectable chip, build one from the chip recipe; do not add click handlers to `Tag`.",
        "Keep to one to three words, sentence case.",
      ],
    },
  ],

  guidance: {
    overview: [
      "DUNE is a Material 3 system tuned for editorial, portfolio, and product-prototype work. It reads as calm and considered: warm sand surfaces instead of white, near-black brown text instead of pure black, and a single desaturated blue for action.",
      "Hierarchy comes from typography and tonal surface steps, not from borders, shadows, or saturated color. Platypi, a serif display face, carries headings and numbers; Instrument Sans carries everything you read or operate.",
      "The system is token-driven end to end. Every color, type setting, radius, and spacing value is a CSS custom property, light and dark are both first-class, and type and spacing respond across three window classes without per-component breakpoints.",
    ],
    principles: [
      "**Warm, not white.** Pages sit on `surface` (a pale sand). Never use pure white or pure black as a page or text color.",
      "**One accent.** `primary` blue marks the main action and links. Everything else is neutral. Rust, ochre, and teal exist as brand tones for large editorial panels and charts, not for UI controls.",
      "**Tone over lines.** Separate regions by stepping the surface container (`surface-container-low` to `-highest`) before reaching for a border, and reach for a border before a shadow.",
      "**Serif for voice, sans for work.** Headings, pull quotes, and big numbers are Platypi. Body, labels, buttons, and form fields are Instrument Sans.",
      "**Round and soft.** Interactive controls are fully rounded pills. Containers use generous corner radii (16px and up).",
    ],
    colorRoles: {
      primary: "Main action fill, links, active indicators.",
      "on-primary": "Text and icons on `primary`.",
      "primary-container": "Highlighted selection, informational callouts.",
      "on-primary-container": "Text and icons on `primary-container`.",
      secondary: "Focus rings and warm accents (amber-brown).",
      "on-secondary": "Text and icons on `secondary`.",
      "secondary-container": "Warm highlight fill, badges.",
      "on-secondary-container": "Text and icons on `secondary-container`.",
      tertiary: "Sparing complementary accent (ochre).",
      "on-tertiary": "Text and icons on `tertiary`.",
      "tertiary-container": "Complementary highlight fill.",
      "on-tertiary-container": "Text and icons on `tertiary-container`.",
      error: "Destructive actions and error text.",
      "on-error": "Text and icons on `error`.",
      "error-container": "Error message background.",
      "on-error-container": "Text and icons on `error-container`.",
      surface: "Page background.",
      "on-surface": "Primary text and icons.",
      "on-surface-variant": "Secondary text, captions, placeholder, icons.",
      "surface-container-lowest": "Lifted elements on a container (rare).",
      "surface-container-low": "Cards and panels.",
      "surface-container": "Tonal buttons, tags, menus, popovers.",
      "surface-container-high": "Hovered rows, nested panels, dialogs.",
      "surface-container-highest": "Strongest neutral fill, input fill.",
      "surface-dim": "Dimmed page background.",
      "surface-bright": "Brightened page background.",
      outline: "Input borders and other borders that carry meaning.",
      "outline-variant": "Dividers and decorative borders.",
      "inverse-surface": "Toasts, tooltips, snackbars.",
      "inverse-on-surface": "Text on `inverse-surface`.",
      "inverse-primary": "Links and actions on `inverse-surface`.",
      scrim: "Backdrop behind dialogs and overlays, with opacity.",
      shadow: "Shadow color only.",
      background: "Legacy alias. Use `surface` for pages.",
      "on-background": "Legacy alias. Use `on-surface`.",
    },
    colorNotes: [
      "Always pair a fill with its `on-` role: `on-primary` on `primary`, `on-surface` on any `surface*`. Never put a fill role on text.",
      "Interactive states are overlays, not new colors. Layer the matching state-layer token over the element: `--dune-sys-color-state-layers-<content-role>-opacity-08` on hover, `-10` on focus and press, `-16` while dragging. `<content-role>` is the color of the element's text or icon (for example `on-primary` for a filled button).",
      "Disabled controls use `on-surface` at 38% opacity for content and `state-layers-on-surface-opacity-10` for the fill.",
      "Dark mode is a full second set of values under the same names. Never hardcode a hex; reference the token so both themes work.",
      "Brand tones (`--md-ref-brand-night`, `-dusk`, `-teal`, `-rust`, `-ochre`, `-sun`) do not change between light and dark. Use them for large editorial panels, hero bands, and charts. Text on them is `--md-ref-brand-on-dark`, except on `sun`, which takes `--md-ref-brand-on-light`.",
    ],
    typeRoles: {
      "display-large": "Largest hero statements.",
      "display-medium": "Hero headings.",
      "display-small": "Large page headings.",
      "headline-large": "Page and section headings in app UI.",
      "headline-medium": "Section headings.",
      "headline-small": "Card and dialog headings.",
      "title-large": "Prominent UI titles.",
      "title-medium": "List item and card titles, medium buttons.",
      "title-small": "Dense UI titles, table headers.",
      "body-large": "Default UI body text, inputs.",
      "body-medium": "Secondary UI text, dense tables.",
      "body-small": "Helper and supporting text.",
      "label-large": "Buttons, tabs, menu items.",
      "label-medium": "Tags, chips, small controls.",
      "label-small": "Badges, overlines.",
      title: "Article or page title (maps to h1).",
      standfirst: "Introductory paragraph under a title.",
      byline: "Author, date, and metadata line.",
      section: "Section heading in long-form content (maps to h2).",
      subsection: "Subsection heading (maps to h3).",
      body: "Long-form reading text.",
      eyebrow: "Uppercase kicker above a title.",
      caption: "Image captions and footnote-sized text.",
      quote: "Pull quotes.",
      attribution: "Quote attribution.",
      metric: "Big numbers and key figures.",
      "list-item": "Editorial list text.",
      "list-marker": "List numerals and markers.",
      footnote: "Footnotes.",
      "code-inline": "Inline code.",
    },
    typeNotes: [
      "Pick a role by what the text is, not by which size looks closest, then take all five properties (family, size, weight, line-height, tracking) from that one role.",
      "Sizes are already responsive: display, headline, and editorial heading roles grow at 600px and 840px. Do not add breakpoint-specific font sizes.",
      "Use `-weight-emphasized` (600) for emphasis inside a role. Do not introduce other weights.",
      "Eyebrows are the only uppercase text. Everything else, including buttons, is sentence case.",
      "Product UI uses the Material roles (headline, title, body, label). Long-form content uses the editorial roles (title, standfirst, section, body, caption).",
    ],
    layout: [
      "Use the `ui` spacing scale for all padding, gaps, and margins inside and between components. Steps from `ui-md` up widen automatically on larger windows, so one value works at every size.",
      "Use the editorial spacing tokens only for the vertical rhythm between blocks of prose (title to standfirst, body to section, and so on).",
      "Content sits in a centered container: 80rem by default, 60rem for reading, 100rem for wide layouts, with `ui-xl` side padding that grows to `ui-3xl` from 768px.",
      "Layout breakpoints are 640, 768, 1024, 1280, and 1536px (Tailwind's defaults). Type and spacing tokens switch separately at 600px and 840px.",
      "Prefer generous whitespace. Sections are separated by `ui-4xl` or `ui-5xl`, cards inside a grid by `ui-lg` or `ui-xl`.",
    ],
    elevation: [
      "Depth is tonal first. Raise something by moving it one step up the surface-container ramp, not by adding a shadow.",
      "Shadows are reserved for things that float above content: elevated buttons, menus, dialogs, and images that need to lift off the page. Use the elevation tokens; never write a custom `box-shadow`.",
      "Overlays sit on a `scrim` backdrop.",
    ],
    shapes: [
      "Buttons, icon buttons, tags, and chips are fully rounded (`full`).",
      "Inputs and small controls use `small` (8px). Cards and panels use `large` (16px). Dialogs, sheets, and hero media use `extra-large` (28px).",
      "Use one radius per component. Nested corners step down one size from their container.",
      "Shape tokens are for `border-radius` only, never for spacing.",
    ],
    dos: [
      "Reference tokens for every color, font setting, radius, and spacing value.",
      "Use the shipped `Button`, `IconButton`, and `Tag` components instead of rebuilding them.",
      "Put pages on `surface` and cards on `surface-container-low`.",
      "Set headings in Platypi and everything else in Instrument Sans.",
      "Give every interactive element visible hover, focus, and pressed states using state layers.",
      "Use a 3px `secondary` outline with a 2px offset for keyboard focus.",
      "Check both light and dark themes.",
      "Keep interactive targets at least 48px tall or wide, even when the visual control is smaller.",
    ],
    donts: [
      "Do not hardcode hex colors, pixel font sizes, or one-off radii and spacing.",
      "Do not use pure white (`#FFFFFF`) backgrounds or pure black text.",
      "Do not introduce new accent colors, gradients, or glassmorphism.",
      "Do not use shadows to separate cards from the page. Use a tonal step.",
      "Do not uppercase button labels or headings.",
      "Do not use Platypi for body copy, labels, or form fields.",
      "Do not use the brand tones for buttons, links, or status colors.",
      "Do not edit or fork the library components. Compose them.",
    ],
    // How to build what the library does not ship, so generated UI stays on-system.
    recipes: [
      {
        name: "Card",
        body: "Fill `surface-container-low`, text `on-surface`, radius `large`, padding `ui-xl`, no border, no shadow. Title in `title-medium` or `headline-small`, supporting text in `body-medium` colored `on-surface-variant`. An interactive card gets the `on-surface` state layer on hover.",
      },
      {
        name: "Text field",
        body: "Height 48px, radius `small`, 1px `outline` border, fill `surface`, text `body-large` in `on-surface`, placeholder `on-surface-variant`, horizontal padding `ui-lg`. Label above in `label-large`. On focus the border becomes 2px `primary`. Errors use `error` for border and helper text.",
      },
      {
        name: "Chip (selectable)",
        body: "Height 32px, radius `full`, `label-large`. Unselected: 1px `outline-variant` border, text `on-surface-variant`. Selected: fill `secondary-container`, text `on-secondary-container`, no border.",
      },
      {
        name: "Dialog",
        body: "Fill `surface-container-high`, radius `extra-large`, padding `ui-xl`, elevation level 3, over a `scrim` backdrop at 32% opacity. Heading `headline-small`, body `body-medium`, actions right-aligned as `text` and `filled` buttons.",
      },
      {
        name: "Navigation bar",
        body: "Fill `surface`, height 64px, bottom divider 1px `outline-variant` only when content scrolls beneath it. Links in `label-large` colored `on-surface-variant`; the current page is `on-surface` with a `secondary-container` pill behind it.",
      },
      {
        name: "List row",
        body: "Minimum height 56px, padding `ui-md` by `ui-lg`, title `body-large`, supporting text `body-medium` in `on-surface-variant`, rows separated by a 1px `outline-variant` divider. Hover applies the `on-surface` state layer.",
      },
      {
        name: "Metric",
        body: "Number in `metric` (Platypi), label beneath in `label-medium` colored `on-surface-variant`. Group metrics in a row with `ui-2xl` gaps and no card chrome.",
      },
      {
        name: "Editorial hero",
        body: "Eyebrow, then `title`, then `standfirst`, spaced with the editorial tokens. A full-bleed band may sit on a brand tone with `--md-ref-brand-on-tone` text.",
      },
    ],
  },
};
