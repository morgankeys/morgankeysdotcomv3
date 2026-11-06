// @ts-check
/**
 * deploy-stage.mjs
 *
 * Build-time half of the deploy stage (src/lib/env.ts has the rest): is this
 * a Vercel preview of a feature branch?
 *
 * Every Vercel deploy is a production build, so `import.meta.env.DEV` cannot
 * tell a feature preview from staging. The branch can. Vercel sets
 * VERCEL_ENV and VERCEL_GIT_COMMIT_REF on every build; PUBLIC_ENV is this
 * site's own per-scope variable (Docs/deployment.md), and a production value
 * there wins over everything else.
 *
 * Each condition below has to hold, so a missing or unexpected variable
 * makes the build staging (noindexed, drafts hidden) rather than a preview.
 *
 * Plain .mjs so astro.config.mjs can import it before Vite is running. The
 * config passes the result to the site as `import.meta.env.FEATURE_PREVIEW`.
 */

/** Branches with their own public deploys: never a feature preview. */
export const PROTECTED_BRANCHES = ["main", "staging"];

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
