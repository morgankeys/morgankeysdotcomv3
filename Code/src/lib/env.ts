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
