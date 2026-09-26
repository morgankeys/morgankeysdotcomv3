# Git workflow

How a track of work becomes commits and a pull request. Read this before creating a branch or committing.

Each track stays recognizable in its branch, its commits, and its pull request. Stay on the current branch when this chat belongs to that track. When the checkout has another conversation's changes, or this chat is a different track, ask before mixing them.

## Creating a branch

- This chat continues the branch already checked out: stay on it.
- `HEAD` is `main` or `staging`: create a feature branch before committing. Uncommitted work from this chat comes along with `git switch -c`.
- Another conversation's changes are in the checkout, or this chat is a different track: ask first. Separate with a new branch, separate commits, or by leaving the other work untouched.

Read-only chats do not need a branch. Never commit to `main`.

### Pick the base

Do this when creating a branch. This repo deploys through `staging` first, then `main` (see [`Docs/deployment.md`](../../Docs/deployment.md)). Branching off `main` while `staging` is ahead drops preview-only changes.

```bash
git fetch origin
git switch main && git pull --ff-only
git switch staging && git pull --ff-only
```

| `main` vs `staging` | Branch from |
| ------------------- | ----------- |
| Same commit | `main` |
| `staging` is ahead of `main` | `staging` |
| They diverged | Stop and ask which base to use |

```bash
git rev-parse main staging
# Same hash → branch from main. Different, and main is an ancestor of staging → branch from staging.
git merge-base --is-ancestor main staging && test "$(git rev-parse main)" != "$(git rev-parse staging)"
```

When `staging` is the base, open the pull request into `staging`.

```bash
git switch staging   # or main, per the table above
git switch -c feat/case-study-cards
```

Branch names are `<type>/<slug>`, lowercase and hyphenated.

| Type | For |
| -------- | ----------------------------------------------------- |
| `feat` | New pages, components, or capabilities |
| `fix` | Bug fixes and layout/style corrections |
| `docs` | `Docs/`, `Agents/`, and README changes |
| `chore` | Dependencies, config, tooling, housekeeping |
| `tokens` | Token pipeline changes and Figma export regenerations |

## Commit style

One logical change per commit. A token regeneration and an unrelated component tweak are two commits.

Subject line: imperative mood, 72 characters max, no trailing period. Add a body only when the "why" is not obvious, as a few short bullets.

```
Add brand tone overlays to case study cards

- Overlay color comes from the new brand-tone token set
- Cards fall back to the neutral surface when no tone is set
```

Early history in this repo (for example `deb8c1c` and `424afc1`) has multi-sentence run-on subject lines that summarize an entire session. That is the pattern we are moving away from — do not imitate it.

## Stop before push

The agent creates the branch and the commits. The human pushes and opens the pull request.

Do not run `git push`, `gh pr create`, or anything else that writes to the remote unless the user asks in that turn. Invoking `/pr` is that ask — follow [`Agents/skills/pr/SKILL.md`](../skills/pr/SKILL.md). Without `/pr`, report the branch name and the commits so the user can take it from there.

## Two chats editing at once

Use a worktree when two chats must edit this repo at the same time. One checkout has one branch, so those chats would otherwise overwrite each other's files and the dev server.

```bash
# base is staging or main, per "Pick the base" above
git worktree add ../morgankeysdotcomv3-<slug> -b <type>/<slug> staging
cd ../morgankeysdotcomv3-<slug>/Code && npm install
npm run dev -- --port 4322
```

`node_modules/` is not shared. The main checkout owns port 4321; the next worktree uses 4322, then 4323.

After the branch is merged:

```bash
git worktree remove ../morgankeysdotcomv3-<slug>
git branch -d <type>/<slug>
```

## Rules of thumb

- Rebase onto the branch you branched from (`main` or `staging`). Do not merge the integration branch into a feature branch.
- Never commit generated output. `Code/dist/` and `node_modules/` are ignored in [`.gitignore`](../../.gitignore). If generated files show up in `git status`, fix the ignore rules.
