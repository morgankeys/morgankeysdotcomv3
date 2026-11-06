// @ts-check
/**
 * draft-content.mjs
 *
 * Decides whether a build may show draft content: work-in-progress case
 * studies, placeholder images, DraftNotes, and the specimen pages under
 * src/pages/dev/. See Agents/context/draft-content.md.
 *
 * Draft content renders in two places:
 *  - the local dev server (`import.meta.env.DEV`, checked in src/lib/env.ts)
 *  - Vercel preview deploys of feature branches, so a pull request can be
 *    reviewed in its own preview
 *
 * It never renders on `staging` or `main` deploys, or in a local
 * `npm run build`. Each condition below has to hold, so a missing or
 * unexpected variable leaves drafts out rather than in.
 *
 * Plain .mjs so astro.config.mjs can import it before Vite is running.
 */

/** Branches whose deploys are public: drafts never render on them. */
export const PROTECTED_BRANCHES = ["main", "staging"];

/**
 * True when this is a Vercel preview build of a feature branch.
 *
 * Vercel sets VERCEL_ENV and VERCEL_GIT_COMMIT_REF on every build. PUBLIC_ENV
 * is this site's own per-scope variable (Docs/deployment.md); a production
 * value there wins over everything else.
 *
 * @param {Record<string, string | undefined>} env usually `process.env`
 * @returns {boolean}
 */
export function isDraftPreviewBuild(env) {
  if (env.PUBLIC_ENV === "production") return false;
  if (env.VERCEL_ENV !== "preview") return false;

  const branch = env.VERCEL_GIT_COMMIT_REF?.trim();
  if (!branch) return false;

  return !PROTECTED_BRANCHES.includes(branch);
}
