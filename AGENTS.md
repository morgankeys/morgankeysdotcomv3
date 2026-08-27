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

## Operating notes

- Keep `Code/`, `Docs/`, and `Export/` in sync when a change spans them (e.g. a new
  feature usually touches code, docs, and eventually an export).
- Treat `Export/` as an output drop zone: write built artifacts there, don't hand-edit them.
- When you learn a durable convention, record it in `Agents/context/` so the next agent
  inherits it.
