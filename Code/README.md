# Portfolio Prototype

Token-driven Astro + Vue portfolio built on a Material Design 3 design system.

## Quick Start

```bash
# Install dependencies
npm install

# Generate design tokens from Figma exports
npm run tokens

# Start development server
npm run dev
# → http://localhost:4321

# Build for production
npm run build
# → Export/site/
```

## Project Structure

- **`src/`** — Pages, layouts, components, styles, and assets
- **`tokens/`** — Style Dictionary configuration and build scripts
- **`scripts/`** — Design-system validation and dev utilities
- **`Export/site/`** — Production build output

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Build for production (runs `tokens` first) |
| `npm run preview` | Preview production build locally |
| `npm run tokens` | Regenerate CSS custom properties from Figma tokens |
| `npm run lint` | Run ESLint + Stylelint |
| `npm run format` | Format code with Prettier |
| `npm run ds:validate` | Validate design-system compliance and update backlog |

## Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for:

- Token pipeline and custom transforms
- Opacity-safe color handling (critical for State Layers)
- Styling rules and validation workflow
- Component APIs and usage examples
- Image handling with astro:assets
- FOUC prevention strategy

## Design System

The codebase enforces strict token usage via Stylelint and custom validation. All color, spacing, border-radius, and typography must use CSS custom properties from the generated token files (`src/styles/tokens/`).

Deviations are tracked in [`Docs/Design system/deviations-backlog.md`](../Docs/Design%20system/deviations-backlog.md).

## Stack

- **Astro 5** — Static-first framework with built-in image optimization
- **Vue 3** — Interactive islands (theme toggle, lightbox)
- **Style Dictionary 4** — Token pipeline with DTCG support
- **TypeScript** — Type safety across components
- **Sharp** — Image processing for responsive srcset generation
- **Fonts** — Self-hosted Platypi, Instrument Sans, IBM Plex Mono via `@fontsource`

## Browser Support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge). Uses:

- CSS custom properties
- CSS `rgb(r g b / a)` color syntax (for alpha-bearing tokens)
- `astro:assets` pipeline (WebP, responsive srcset)

## Folder Context

This repo is a **prototyping kit** with four top-level peer folders:

- **`Code/`** (this folder) — The full prototype codebase
- **`Docs/`** — Human-level documentation and resources
- **`Export/`** — Built versions staged for manual transfer
- **`Agents/`** — AI agent instructions, skills, context, and prompts

See repo-root [`AGENTS.md`](../AGENTS.md) for the full layout and conventions.
