# Git workflow

How work moves from a chat into a reviewable commit. Load this at the start of any chat
that will edit files.

## Branch per chat

Never commit to `main`. Before the first edit of substantive work, branch off an
up-to-date `main`:

```bash
git switch main && git pull --ff-only
git switch -c feat/case-study-cards
```

Branch names are `<type>/<slug>`, lowercase and hyphenated. Types:

| Type | For |
| -------- | ----------------------------------------------------- |
| `feat` | New pages, components, or capabilities |
| `fix` | Bug fixes and layout/style corrections |
| `docs` | `Docs/`, `Agents/`, and README changes |
| `chore` | Dependencies, config, tooling, housekeeping |
| `tokens` | Token pipeline changes and Figma export regenerations |

Read-only chats — questions, code tours, reviews — do not need a branch. Only branch when
you are about to write.

Check `git status` before the first edit. If the tree is already dirty, stop and tell the
user rather than branching on top of or sweeping up their in-progress work.

## Commit style

One logical change per commit. A token regeneration and an unrelated component tweak are
two commits, not one.

Subject line: imperative mood, 72 characters max, no trailing period. Add a body only when
the "why" is not obvious, as a few short bullets.

```
Add brand tone overlays to case study cards

- Overlay color comes from the new brand-tone token set
- Cards fall back to the neutral surface when no tone is set
```

Early history in this repo (for example `deb8c1c` and `424afc1`) has multi-sentence
run-on subject lines that summarize an entire session. That is the pattern we are moving
away from — do not imitate it.

## Stop before push

Hard boundary: the agent creates the branch and commits. The human pushes and opens the
pull request.

Do not run `git push`, `gh pr create`, or anything else that writes to the remote unless
the user explicitly asks in that turn. When the work is done, report the branch name and
the commits on it so the user can take it from there.

## Parallel chats use worktrees

A clone can only have one branch checked out, so two concurrent chats in the same
directory will fight over the index, leave each other's changes staged, and yank the
branch out from under a running dev server. Give each concurrent thread its own worktree —
a separate directory with its own branch, sharing this repo's object store.

```bash
# from the main checkout
git worktree add ../morgankeysdotcomv3-<slug> -b <type>/<slug> main
cd ../morgankeysdotcomv3-<slug>/Code && npm install
npm run dev -- --port 4322
```

Two things do not carry over from the main checkout:

- **`node_modules/` is not shared.** Each worktree needs its own `npm install` in `Code/`.
- **Dev server ports collide.** The main checkout owns 4321 (Astro's default); additional
  worktrees use 4322, 4323, and so on via `npm run dev -- --port <n>`.

Clean up once the branch is merged:

```bash
git worktree remove ../morgankeysdotcomv3-<slug>
git branch -d <type>/<slug>
```

Worktrees merge back through normal pull requests — there is nothing special about them
from the remote's point of view.

## Rules of thumb

- Rebase onto `main` to pick up upstream changes (`git rebase main`); do not merge `main`
  into a feature branch.
- Never commit generated output. `Code/dist/` and `node_modules/` are already ignored in
  [`.gitignore`](../../.gitignore); if something generated is showing up in `git status`,
  fix the ignore rules rather than committing it.
- Keep a branch scoped to one concern. If a chat wanders into unrelated work, that is a
  signal to finish the current branch and start a new one.
