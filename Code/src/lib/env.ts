/**
 * env.ts
 *
 * Deploy-environment helpers. Vercel scopes PUBLIC_ENV per environment:
 * unset (or "production") on Production, "staging" on Preview builds.
 * Anything that is not production is treated as staging so a misconfigured
 * environment fails safe — noindexed and visibly marked, never the reverse.
 */

export const deployEnv = import.meta.env.PUBLIC_ENV ?? "production";

export const isProduction = deployEnv === "production";

export const isStaging = !isProduction;

/**
 * Draft content: work-in-progress case studies, placeholder images,
 * DraftNotes, and the specimen pages under src/pages/dev/. It renders on the
 * local dev server and on Vercel previews of feature branches, never on
 * staging, production, or a local `npm run build`. DRAFT_PREVIEW is set at
 * build time by astro.config.mjs from src/lib/draft-content.mjs.
 * See Agents/context/draft-content.md.
 */
export const showDraftContent =
  import.meta.env.DEV || import.meta.env.DRAFT_PREVIEW === true;

/**
 * GA4 measurement ID, production only. PUBLIC_GA_MEASUREMENT_ID is set in
 * Vercel's Production scope; gating on isProduction as well means staging and
 * local builds never load the tag, even if the variable leaks into Preview or
 * a local .env. Unset or malformed also means no tag.
 */
const rawMeasurementId = (
  import.meta.env.PUBLIC_GA_MEASUREMENT_ID ?? ""
).trim();

export const gaMeasurementId =
  isProduction && /^G-[A-Z0-9]+$/.test(rawMeasurementId)
    ? rawMeasurementId
    : undefined;
