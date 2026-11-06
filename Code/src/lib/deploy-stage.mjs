// @ts-check
/**
 * deploy-stage.mjs
 *
 * Build-time facts about where this build runs, read once by
 * astro.config.mjs and passed to the site as `import.meta.env.*` values
 * (src/lib/env.ts reads them):
 *
 *  - FEATURE_PREVIEW: a Vercel preview of a feature branch
 *  - DEPLOY_HOST:     "vercel" or "other"
 *  - DEPLOY_BRANCH:   the Git branch, or "" when it can't be told
 *
 * Every Vercel deploy is a production build, so `import.meta.env.DEV` cannot
 * tell a feature preview from staging. The branch can. Vercel sets VERCEL,
 * VERCEL_ENV, and VERCEL_GIT_COMMIT_REF on every build; PUBLIC_ENV is this
 * site's own per-scope variable (Docs/deployment.md), and a production value
 * there wins over everything else.
 *
 * Each condition has to hold, so a missing or unexpected variable makes the
 * build staging (noindexed, drafts hidden) rather than a preview.
 *
 * Plain .mjs so astro.config.mjs can import it before Vite is running.
 */
import { execFileSync } from "node:child_process";

/** Branches with their own public deploys: never a feature preview. */
export const PROTECTED_BRANCHES = ["main", "staging"];

/**
 * True when the build runs on Vercel, which sets VERCEL=1 on every build.
 *
 * @param {Record<string, string | undefined>} env usually `process.env`
 * @returns {boolean}
 */
export function isVercelBuild(env) {
  return env.VERCEL === "1";
}

/**
 * The Git branch being built. Vercel and GitHub Actions name it in the
 * environment (their checkouts can be detached); otherwise ask Git. Read
 * once when the dev server or build starts, so restart the dev server after
 * switching branches.
 *
 * @param {Record<string, string | undefined>} env usually `process.env`
 * @returns {string} the branch, or "" when it can't be told
 */
export function detectBranch(env) {
  const fromEnv =
    env.VERCEL_GIT_COMMIT_REF || env.GITHUB_HEAD_REF || env.GITHUB_REF_NAME;
  if (fromEnv?.trim()) return fromEnv.trim();

  try {
    const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    // A detached checkout reports "HEAD", which names no branch.
    return branch === "HEAD" ? "" : branch;
  } catch {
    return "";
  }
}

/**
 * True when this is a Vercel preview build of a feature branch.
 *
 * @param {Record<string, string | undefined>} env usually `process.env`
 * @returns {boolean}
 */
export function isFeaturePreviewBuild(env) {
  if (env.PUBLIC_ENV === "production") return false;
  if (env.VERCEL_ENV !== "preview") return false;

  const branch = env.VERCEL_GIT_COMMIT_REF?.trim();
  if (!branch) return false;

  return !PROTECTED_BRANCHES.includes(branch);
}
