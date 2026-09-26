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
| Creating a branch, committing, or separating tracks of work | `Agents/context/git-workflow.md` |
| `/pr` — commit, push, and open a pull request | `Agents/skills/pr/SKILL.md` |
| Any work in `Code/` (editing, adding, or debugging code) | `Code/ARCHITECTURE.md` |
| Styling components or writing CSS | `Agents/context/design-system.md` |
| Implementing a page or feature from Figma | `Agents/context/design-system.md` |
| Regenerating tokens from a new Figma export | `Agents/skills/design-tokens/SKILL.md` |
| Understanding token conventions or the opacity transform | `Agents/context/design-tokens.md` |
| Quick commands or getting started | `Code/README.md` |
| Deploying, or anything about the staging/production environments | `Docs/deployment.md` |
| Site copy or content fixes, or "what's left" on the content review | `Docs/content-review.md` |

When a `.cursor/rules/*.mdc` file auto-attaches because you're editing a relevant file, trust it — it has the just-in-time rules you need.

## Non-negotiable rules

These apply across all tasks. They are phrased as portable principles so they survive file moves and kit reuse.

1. **Never hand-edit generated files.** If a file's header says `GENERATED` or `do not edit by hand`, regenerate it with the documented command instead. (Example: design token CSS is generated from Figma exports via `npm run tokens`.)
2. **Never weaken lint or validation rules to suppress design-system deviations.** If a linter flags a hardcoded value or missing token, fix the root cause or log the deviation to the project's deviation backlog — do not disable the rule or add an ignore comment.
3. **Component styles must be scoped and token-driven.** Use scoped `<style>` blocks and CSS custom properties only. No inline styles, no hardcoded colors/spacing/radii.
4. **Never simplify or remove the opacity/alpha guard in the token color transform.** The color transform in the token pipeline preserves alpha channels for tokens with `alpha < 1`. If the build-time regression guard fails, fix the transform — do not bypass the check.
5. **Build output is generated, not source.** This site's Astro build writes to `Code/dist/` (gitignored). Regenerate with `npm run build` in `Code/`; never hand-edit it. The kit-level `Export/` folder is for other staged artifacts, not this Astro outDir.
6. **Keep tracks of work organized, and stop before the remote.** Each track stays recognizable in its branch, commits, and pull request. Never commit to `main`. Never push or open a PR unless asked (`/pr` counts — `Agents/skills/pr/SKILL.md`). Detail is in `Agents/context/git-workflow.md`.

## Operating notes

- Keep `Code/` and `Docs/` in sync when a change spans them. Production HTML lives in
  `Code/dist/` after a build, not in `Export/`.
- When you learn a durable convention, record it in `Agents/context/` so the next agent
  inherits it.
