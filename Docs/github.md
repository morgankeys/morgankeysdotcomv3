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
  promotion has to reconcile them. This has happened twice: PR #9 and PR #54
  merged into `main` directly.

## Merge methods

The squash happens once, on the way into `staging`. After that, commits are
never rewritten again.

| Pull request          | Merge with                 | Result                                                  |
| --------------------- | -------------------------- | ------------------------------------------------------- |
| Feature → `staging`   | **Squash and merge**       | One clean commit per PR, titled after the PR            |
| `staging` → `main`    | **Create a merge commit**  | `main` gets `staging`'s exact commits plus a merge marker |

Why it works: a squash creates a brand-new commit. Doing that on the feature
branch is harmless, because the branch is deleted afterward and nothing else
depends on its commits. Doing it on the promotion is not: `main` gets a new
commit with the same content as `staging`'s commits, Git treats them as
unrelated, and the next promotion conflicts. PR #53 did this.

Watch for:

- **GitHub remembers your last merge method.** After squashing a feature PR,
  the promotion PR's button defaults to **Squash and merge**. Switch it to
  **Create a merge commit** every time, or enforce it with rulesets (see
  [Recommended settings](#recommended-settings)).
- **Stacked branches.** If branch B was cut from unmerged branch A, B still
  carries A's original commits after A is squashed into `staging`. Rebase only
  B's own commits: `git rebase --onto origin/staging <last commit of A> B`.
- **Hotfixes.** Don't commit to `main` directly. Land the fix in `staging` and
  promote. If something must go to `main` first, merge `main` back into
  `staging` right away with a merge commit.
- **Reading `main`'s history.** `git log --first-parent main` lists one line
  per promotion; plain `git log main` also shows each squashed feature.

## Promoting staging to production

1. Check https://staging.morgankeys.com looks right.
2. Open a pull request from `staging` into `main`. CI runs on it.
3. Merge it with **Create a merge commit**. Never squash or rebase a promotion
   (see [Merge methods](#merge-methods)).

## Fixing a diverged `main` and `staging`

Symptom: a promotion PR shows changes that are already on `main`, or conflicts
on files nobody touched.

1. Check that `main` has everything `staging` has. Find the commit on `main`
   that should match `staging` (usually the squashed promotion) and confirm
   `git diff origin/staging <that commit>` prints nothing. If it prints
   something, that work exists only on `staging`; land it on `main` first.
2. Check that no open branch was cut from `staging`'s orphaned commits:
   `git branch -r --contains <first staging-only commit>`. Rebase any that
   were onto `main` afterward.
3. Reset `staging` to `main` and force-push. If `staging` blocks force pushes,
   lift that rule for this one push and restore it after.

   ```bash
   git fetch origin
   git push --force-with-lease=staging:origin/staging origin/main:refs/heads/staging
   ```

4. Rebase open feature branches onto the new `staging` if their PRs show
   unexpected commits.

Merging `main` into `staging` instead avoids the force push, but it usually
conflicts and leaves both copies of the work in `staging`'s history.

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
| Allow squash merging               | General > Pull Requests       | On, with the default commit message set to the PR title                        | Feature PRs squash into `staging`                             |
| Protect `main`                     | Rules > Rulesets, or Branches | Require a pull request and the `verify` check; allowed merge methods: merge only; block force pushes and deletion | Production only changes through a reviewed, passing promotion, and a promotion can't be squashed |
| Protect `staging`                  | Rules > Rulesets, or Branches | Allowed merge methods: squash only; block force pushes and deletion; consider requiring the `verify` check | One commit per feature, and the integration branch's history stays intact |

As of 2026-09-28, GitHub's API reported both `main` and `staging` as
unprotected, although `deployment.md` says `main` is protected. Rulesets may not
show up in that API, so confirm under **Settings > Rules**.

## Branch cleanup

A merged branch's work already lives in `staging`, so deleting the branch loses
nothing. Squash-merged branches never show as merged to Git, so the command
below only finds branches merged some other way; check the rest against their
closed PRs. To list and delete every fully merged branch:

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
