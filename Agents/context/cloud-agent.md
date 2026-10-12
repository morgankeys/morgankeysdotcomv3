# Cloud Agent environment

The Cloud Agent development environment is saved in Cursor, not in this repo.
Read this before changing that environment, before adding environment files,
or when a dev server is already running.

Day-to-day commands stay in [`Code/README.md`](../../Code/README.md) and
[`Code/ARCHITECTURE.md`](../../Code/ARCHITECTURE.md). This note is only the
parts those docs do not cover.

## Do not commit an environment file

There is no `.cursor/environment.json`. Cloud Agents boot from the saved
environment. A committed `.cursor/environment.json` overrides it. Do not add
one unless the owner asks to move setup into the repo.

## How the machine is prepared

Install and the dev server run from `Code/`.

Install refreshes dependencies and regenerates design tokens:

```bash
npm ci
npm run tokens
```

`npm run tokens` is required. CSS under `Code/src/styles/tokens/` is
gitignored. Without it, dev, lint, and build fail.

On start, the Astro dev server comes up with telemetry disabled, bound to
`0.0.0.0` port `4321`. Open `http://127.0.0.1:4321/`. If that port is already
in use, the server is already running — do not start a second one. A worktree
uses the next port (`4322`, then `4323`); see
[`git-workflow.md`](git-workflow.md).

`npm ci` may warn that `eslint-plugin-astro` wants a newer Node 22 than the
image provides. Lint, typecheck, and build still pass. Do not change the base
image to silence that warning.

## Secrets are not required for local work

Leave these unset unless the task needs them:

| Variable | When unset |
| --- | --- |
| `PUBLIC_WEB3FORMS_ACCESS_KEY` | Contact form shows its "isn't set up yet" fallback |
| `PUBLIC_GA_MEASUREMENT_ID` | No analytics collection |
| `PUBLIC_SITE_URL` | Canonical site defaults to `https://morgankeys.com` |
| `PUBLIC_ENV` | Treated as non-production |

Details: [`Code/.env.example`](../../Code/.env.example),
[`Docs/deployment.md`](../../Docs/deployment.md),
[`Docs/analytics.md`](../../Docs/analytics.md).

## Pull requests

Opening a pull request needs no extra environment secrets. Ask with `/pr`
([`Agents/skills/pr/SKILL.md`](../skills/pr/SKILL.md)). Pull requests target
`staging`. People merge them. Agents do not delete branches. See
[`Docs/github.md`](../../Docs/github.md).
