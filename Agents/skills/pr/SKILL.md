---
name: pr
description: >-
  Commit the current changes, push the branch, and open a pull request, then
  note major conflicts with staging. Use when the user invokes /pr or asks to
  commit, push, and open a PR.
disable-model-invocation: true
---

# /pr

Invoking `/pr` is the explicit ask to commit, push, and open a pull request in this turn. It overrides the rule that otherwise stops before the remote.

Read `Agents/context/git-workflow.md` for commit style and which integration branch to target. Run the conflict check, then ship. Do not resolve conflicts in this skill — report them and continue.

Extra words after `/pr` are the PR title and summary. Otherwise infer both from the diff.

## Safety

- Never commit to `main` or `staging`. If HEAD is either, create a branch first, using the base and name from `Agents/context/git-workflow.md`. Uncommitted work from this chat comes along with `git switch -c`.
- If the diff mixes another conversation's track, ask before committing it into this one.
- Never update git config, skip hooks, or force-push.
- Do not commit secrets (`.env`, credentials) or generated output (`Code/dist/`, `node_modules/`). Leave those unstaged and say so.
- If a commit hook fails, fix the problem and make a new commit. Do not amend.
- One logical change per commit. Split the diff when it is clearly unrelated work; otherwise one commit is enough.

## 1. Commit

In parallel: `git status`, `git diff` (staged and unstaged), `git log -8 --oneline`.

Stage the relevant files and commit. Subject: imperative, 72 characters max, no trailing period. Body only when the why is not obvious. Pass the message with a HEREDOC.

If the tree is clean, skip the commit and continue with what is already on the branch.

If there is nothing to commit and the branch has no commits beyond its base, stop. Say there is nothing to ship.

## 2. Staging conflict check

```bash
git fetch origin
```

Set the pull request base from "Pick the base" in `Agents/context/git-workflow.md`. Always judge merge risk against `origin/staging`, including when the base is `main`.

### This branch vs staging

```bash
git merge-tree --write-tree --name-only --messages origin/staging HEAD
```

A non-zero exit means this branch conflicts with `staging` and cannot merge until that is resolved. List the conflicting files.

If `origin/staging` is not an ancestor of HEAD but the merge is clean, say the branch is behind `staging` and merges cleanly.

### Other open work that could collide

Exclude the current branch, `main`, and `staging`.

Open pull requests:

```bash
gh pr list --state open --json number,title,headRefName,baseRefName,url,updatedAt
```

Remote branches with a tip newer than 14 days and no open PR:

```bash
git for-each-ref --sort=-committerdate --format='%(committerdate:iso-strict) %(refname:short)' refs/remotes/origin
```

Files this branch changes:

```bash
git diff --name-only origin/staging...HEAD
```

For each candidate, files it changes relative to staging:

```bash
git diff --name-only origin/staging...origin/<branch>
```

Keep a candidate only when the two file lists share a path. Then:

```bash
git merge-tree --write-tree --name-only --messages HEAD origin/<branch>
```

- Non-zero exit: **will conflict**. Name the branch or PR, the URL if any, and the conflicting files. Both cannot land on `staging` until this is sorted out.
- Clean merge, shared paths: **same files**. Name the branch or PR and the overlapping paths. Review that overlap before merging onto `staging`.

Skip candidates with no shared paths. If `git fetch` or `gh` fails, say the check did not run. Do not guess.

## 3. Push and open the PR

```bash
git push -u origin HEAD
```

If a PR already exists for this branch, do not open another. Use that URL.

Otherwise:

```bash
gh pr create --base <base> --title "<subject>" --body "$(cat <<'EOF'
## Summary
- ...

## Staging conflicts
- None found.

## Test plan
- [ ] ...

EOF
)"
```

Title matches the commit subject style. Summary is 1–3 bullets. Under Staging conflicts, write `None found.` or one bullet per finding from the check. Test plan is a short checklist for this change.

## 4. Tell the user

Reply with the PR URL, then the staging conflict note: none, or each finding with the other PR or branch and the files. Say when something must be sorted out before this can merge onto `staging`.
