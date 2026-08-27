# Agents

Curated home for everything an AI agent needs to work in this kit. This folder is a
first-class peer of `Code/`, `Docs/`, and `Export/` — both humans and agents are expected
to read and maintain it.

The repo-root `AGENTS.md` is the entry point agents load first; it points here.

## Layout

```
Agents/
├── skills/        Reusable capabilities, one folder per skill (see example-skill/)
├── context/       Conventions, architecture, and background to load before acting
├── prompts/       Task templates and reusable prompts
└── README.md      This index
```

## When to use each

- **skills/** — A repeatable, self-contained capability with clear trigger conditions
  (e.g. "package the prototype for export"). Each skill lives in its own folder with a
  `SKILL.md`. Copy `example-skill/` as a starting point.
- **context/** — Durable knowledge: coding conventions, folder structure decisions,
  architecture notes, gotchas. Load relevant files before making changes. Add to it when
  you learn something the next agent should know.
- **prompts/** — Ready-to-run task templates (e.g. "prepare a release", "review the
  Docs for drift"). Keep them parameterized and short.

## Conventions

- Skill folder names: lowercase, hyphenated (`export-prototype`, not `Export Prototype`).
- One `SKILL.md` per skill folder; supporting files live alongside it.
- Keep this README's layout section up to date when you add a new subfolder.
