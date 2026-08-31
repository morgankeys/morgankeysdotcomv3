# AGENTS.md

Front door for any AI agent working in this prototyping kit. Read this first, then load
what you need from `Agents/`.

## What this repo is

A prototyping kit. Work is organized into four top-level, peer folders:

| Folder     | Purpose                                                                    |
| ---------- | ------------------------------------------------------------------------- |
| `Code/`    | The entire codebase for the prototype being built.                        |
| `Docs/`    | Human-level documentation and resources.                                  |
| `Export/`  | Built versions of the prototype, staged for manual transfer to a server. |
| `Agents/`  | Instructions, skills, context, and prompts for AI agents (this material). |

You may read and manage **all four** folders, not just `Code/`.

## Where to look

- **Skills** — reusable capabilities: `Agents/skills/`
- **Context** — conventions, architecture, background to load before acting: `Agents/context/`
- **Prompts** — task templates and reusable prompts: `Agents/prompts/`
- **Index** — what's available and when to use it: `Agents/README.md`

## Context loading: on-demand vs always

Load deep context **on demand** to reduce token costs. Use this routing table:

| If your task involves... | Read this first |
| --- | --- |
| Any work in `Code/` (editing, adding, or debugging code) | `Code/ARCHITECTURE.md` |
| Styling components or writing CSS | `Agents/context/design-system.md` |
| Regenerating tokens from a new Figma export | `Agents/skills/design-tokens/SKILL.md` |
| Understanding token conventions or the opacity transform | `Agents/context/design-tokens.md` |
| Quick commands or getting started | `Code/README.md` |

When a `.cursor/rules/*.mdc` file auto-attaches because you're editing a relevant file, trust it — it has the just-in-time rules you need.

## Non-negotiable rules

These apply across all tasks. They are phrased as portable principles so they survive file moves and kit reuse.

1. **Never hand-edit generated files.** If a file's header says `GENERATED` or `do not edit by hand`, regenerate it with the documented command instead. (Example: design token CSS is generated from Figma exports via `npm run tokens`.)
2. **Never weaken lint or validation rules to suppress design-system deviations.** If a linter flags a hardcoded value or missing token, fix the root cause or log the deviation to the project's deviation backlog — do not disable the rule or add an ignore comment.
3. **Component styles must be scoped and token-driven.** Use scoped `<style>` blocks and CSS custom properties only. No inline styles, no hardcoded colors/spacing/radii.
4. **Never simplify or remove the opacity/alpha guard in the token color transform.** The color transform in the token pipeline preserves alpha channels for tokens with `alpha < 1`. If the build-time regression guard fails, fix the transform — do not bypass the check.
5. **Build output is generated, not source.** The `Export/` folder is a drop zone for built artifacts. Write to it via build scripts, never hand-edit its contents.

## Operating notes

- Keep `Code/`, `Docs/`, and `Export/` in sync when a change spans them (e.g. a new
  feature usually touches code, docs, and eventually an export).
- When you learn a durable convention, record it in `Agents/context/` so the next agent
  inherits it.
