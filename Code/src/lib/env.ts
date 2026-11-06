/**
 * env.ts
 *
 * Deploy-environment helpers.
 *
 * Every build is in one of four stages:
 *
 * | Stage         | Where                                   | Badge         |
 * | ------------- | --------------------------------------- | ------------- |
 * | `development` | `npm run dev`                           | "Development" |
 * | `preview`     | Vercel preview of a feature branch      | "Preview"     |
 * | `staging`     | Vercel preview of `staging`             | "Staging"     |
 * | `production`  | Vercel production (`main`), local build | none          |
 *
 * Vercel scopes PUBLIC_ENV per environment: "production" on Production,
 * "staging" on every Preview build, feature branches included.
 * src/lib/deploy-stage.mjs tells a feature preview apart by its branch.
 *
 * Anything that is not production is treated as non-production, so a
 * misconfigured environment fails safe: noindexed and visibly marked, never
 * the reverse.
 */

export const deployEnv = import.meta.env.PUBLIC_ENV ?? "production";

export const isProduction = deployEnv === "production";

/** Not production: noindexed, robots-disallowed, and badged. */
export const isStaging = !isProduction;

export type DeployStage = "development" | "preview" | "staging" | "production";

/** Set at build time by astro.config.mjs from src/lib/deploy-stage.mjs. */
const isFeaturePreview = import.meta.env.FEATURE_PREVIEW === true;

export const deployStage: DeployStage = import.meta.env.DEV
  ? "development"
  : isFeaturePreview
    ? "preview"
    : isProduction
      ? "production"
      : "staging";

/** What the environment badge says; production has no badge. */
export const deployStageLabel: Record<DeployStage, string> = {
  development: "Development",
  preview: "Preview",
  staging: "Staging",
  production: "Production",
};

/**
 * Draft content: work-in-progress case studies, placeholder images,
 * DraftNotes, and the specimen pages under src/pages/dev/. It renders in
 * development and on feature-branch previews, never on staging, production,
 * or a local `npm run build`. See Agents/context/draft-content.md.
 */
export const showDraftContent =
  deployStage === "development" || deployStage === "preview";

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
