# Managing the GitHub repo

Notes for the people who own `morgankeys/morgankeysdotcomv3`: how branches flow
to production, which repo settings matter, and routine upkeep.

Related docs:

- [`deployment.md`](deployment.md): how Vercel turns branches into the staging
  and production sites, and the environment variables.
- [`Agents/context/git-workflow.md`](../Agents/context/git-workflow.md): the
  rules agents follow for branches, commits, and pull requests. The same
  conventions suit people too.

## Branch model

| Branch          | Role                                                  | Deploys to                     |
| --------------- | ----------------------------------------------------- | ------------------------------ |
| `main`          | Production                                            | https://morgankeys.com         |
| `staging`       | Integration; every change lands here first            | https://staging.morgankeys.com |
| `<type>/<slug>` | One track of work, e.g. `fix/contact-github`          | Vercel preview URL             |
| `claude/<name>` | Branches that Claude Code sessions name automatically | Vercel preview URL             |

- **All work merges into `staging`** through a pull request.
- **Only the promotion PR targets `main`.** Never merge a feature branch
  straight into `main`. It makes `main` and `staging` diverge, and every later
  promotion has to reconcile them. This has happened once already: PR #9
  merged into `main` directly.

## Promoting staging to production

1. Check https://staging.morgankeys.com looks right.
2. Open a pull request from `staging` into `main`. CI runs on it.
3. Merge it with **Create a merge commit**. Never squash or rebase a promotion:
   that rewrites `staging`'s commits into new ones on `main`, the two branches
   stop sharing history, and the next promotion conflicts.

Promote often. Small promotions are easy to review and easy to roll back in
Vercel. As of 2026-09-28, `main` had not moved since 2026-09-23 and was 69
commits behind `staging`.

## What CI checks

`.github/workflows/ci.yml` runs on every pull request into `staging` or `main`:
`npm ci`, `npm run lint`, `npm run check`, `npm run build`, and
`npm run ds:validate`, then `git diff --exit-code` to fail the run
if the build or validation changed any tracked file. Validation prints the deviation
list as a warning and exits 0 when deviations exist; a stale committed backlog is what
fails that job. `--strict` is a local-only flag and is not part of CI. The workflow does not run on direct pushes, so a push straight to
`staging` deploys without those checks.

CI uses no secrets. Site configuration, including the Web3Forms key, lives in
Vercel's environment variables; see `deployment.md`.

## Recommended settings

These are the settings worth having. GitHub doesn't expose most of them to agent
sessions, so check them yourself in the repo's **Settings**.

| Setting                            | Where                         | Recommended                                                                    | Why                                                           |
| ---------------------------------- | ----------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Automatically delete head branches | General > Pull Requests       | On                                                                             | Branches disappear when their PR merges                       |
| Allow merge commits                | General > Pull Requests       | On                                                                             | Promotions must use merge commits                             |
| Protect `main`                     | Rules > Rulesets, or Branches | Require a pull request and the `verify` check; block force pushes and deletion | Production only changes through a reviewed, passing promotion |
| Protect `staging`                  | Rules > Rulesets, or Branches | Block force pushes and deletion; consider requiring the `verify` check         | Keeps the integration branch's history intact                 |

As of 2026-09-28, GitHub's API reported both `main` and `staging` as
unprotected, although `deployment.md` says `main` is protected. Rulesets may not
show up in that API, so confirm under **Settings > Rules**.

## Branch cleanup

A merged branch's work already lives in `staging`, so deleting the branch loses
nothing. To list and delete every fully merged branch:

```bash
git fetch --prune origin
git branch -r --merged origin/staging | grep -vE 'origin/(main|staging|HEAD)' \
  | sed 's#origin/##' | xargs git push origin --delete
```

Branches the command skips are unmerged. Check them before deleting: open the
branch on GitHub and see whether its commits are still needed.

With **Automatically delete head branches** on, this is rarely needed.

## Working with agents

- **Agents open pull requests; people merge them.** An agent pushes a branch and
  opens a PR only when asked (the `/pr` skill). Merging and promoting to
  production are always done by a person.
- **Agent sessions can't delete branches.** Claude Code cloud sessions can push
  branches but get a 403 when deleting one, so branch cleanup is a person's job.
- **Agent rules live in the repo.** `AGENTS.md` is the entry point, and changes
  to how agents work go through pull requests like any other change.
