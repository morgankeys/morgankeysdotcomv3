# Deployment: staging and production

The site deploys from GitHub to Vercel. One Vercel project serves both
environments, distinguished by branch.

| Branch         | Vercel environment | URL                                   | Draft content |
| -------------- | ------------------ | ------------------------------------- | ------------- |
| `main`         | Production         | https://morgankeys.com                | Hidden        |
| `staging`      | Preview            | https://staging.morgankeys.com        | Hidden        |
| feature branch | Preview            | a per-branch `*.vercel.app` preview   | Shown         |

Vercel allows exactly one production branch per project. `staging` is therefore
a Preview deployment with a domain pinned to the branch, so the hostname always
serves the newest `staging` commit rather than a per-commit `*.vercel.app` URL.

## Everyday flow

```
feature branch  ->  PR into staging  ->  auto-deploys to staging.morgankeys.com
                ->  PR staging into main  ->  production
```

Pushing straight to `staging` works too; `main` is protected and moves only
through a PR.

## Draft content on previews

A feature branch's Vercel preview shows draft content: case studies in progress,
placeholder images, open-item notes, and the specimen pages under `/dev/`. That
lets a pull request be reviewed in its own preview. Staging and production
never show it.

The build decides from Vercel's system variables `VERCEL_ENV` and
`VERCEL_GIT_COMMIT_REF` (exposed by default), plus `PUBLIC_ENV`. Drafts show
only on a `preview` build of a branch other than `staging` or `main`, and never
when `PUBLIC_ENV` is `production`. If Vercel stops exposing those variables,
previews fall back to hiding drafts.

CI grades draft content by the pull request's target: a warning into `staging`,
an error into `main`. See
[`Agents/context/draft-content.md`](../Agents/context/draft-content.md).

## Environment variables

Set in Vercel under Settings -> Environment Variables, scoped per environment.

| Variable                      | Production                 | Preview                          |
| ----------------------------- | -------------------------- | -------------------------------- |
| `PUBLIC_SITE_URL`             | `https://morgankeys.com`   | `https://staging.morgankeys.com` |
| `PUBLIC_ENV`                  | `production`               | `staging`                        |
| `PUBLIC_WEB3FORMS_ACCESS_KEY` | production Web3Forms key   | staging Web3Forms key            |
| `PUBLIC_GA_MEASUREMENT_ID`    | GA4 measurement ID (`G-…`) | unset                            |

`PUBLIC_SITE_URL` feeds Astro's `site` (`Code/astro.config.mjs`), which drives
canonical URLs and the generated sitemap. Without it, a staging build would
advertise the production domain.

`PUBLIC_ENV` drives `Code/src/lib/env.ts`. Anything other than `production`
counts as non-production (staging, or a feature preview by its branch), so a
missing or misconfigured value fails safe — noindexed and visibly marked, never
the reverse. Feature-branch previews share the Preview scope, so they also get
`PUBLIC_ENV=staging`; the branch check is what labels them "Preview".

`PUBLIC_WEB3FORMS_ACCESS_KEY` is the Web3Forms access key the contact form
(`Code/src/components/ContactForm.vue`) sends with each submission. It is public
by design and safe to expose to the browser. When it is unset the form renders a
"not set up yet" message instead of a form that would fail. Use a separate key
for Preview so staging test messages don't land in the production inbox. Locally,
put it in `Code/.env` (gitignored); `Code/.env.example` lists the name.

## How staging is kept out of search

Staging is publicly reachable but not indexable, via two independent guards:

1. `Code/src/pages/robots.txt.ts` generates `robots.txt` per environment —
   `Allow: /` plus the sitemap on production, `Disallow: /` on staging. It is an
   endpoint rather than a file in `public/` because a static file cannot vary
   between builds.
2. `BaseLayout.astro` emits `<meta name="robots" content="noindex, nofollow">`
   on staging, covering a page reached directly.

An `EnvironmentBadge` pill in the top-right corner names the environment and
branch, `{environment}: {branch}`, so a tab is never mistaken for the live site:

| Badge                  | Where                                                     |
| ---------------------- | --------------------------------------------------------- |
| `Development: <branch>` | `npm run dev`                                            |
| `Vercel: <branch>`     | any Vercel preview, e.g. `Vercel: staging` on staging     |
| `Prod: <branch>`       | a production build served anywhere but Vercel             |
| none                   | the live site: production on Vercel, or a build of `main` |

The text is `environmentBadge` in `Code/src/lib/env.ts`. Vercel is detected by
the `VERCEL=1` variable it sets on every build. The branch comes from
`VERCEL_GIT_COMMIT_REF` on Vercel, the GitHub Actions variables in CI, and Git
locally. The dev server reads it once at startup, so restart it after switching
branches. A production build whose branch can't be told shows no badge.

## Analytics

Vercel Web Analytics is per project, and one project serves both environments.
`BaseLayout.astro` renders `<Analytics />` (from `@vercel/analytics/astro`) only
when `isProduction` is true, so staging and local builds never send events and
staging traffic cannot skew production numbers.

Enable it once under the project's Analytics tab. To verify, load
https://morgankeys.com and look for `/_vercel/insights/script.js` in the Network
tab; it must be absent on staging.morgankeys.com. Install `@vercel/analytics`
with `npm i --force` if npm reports a peer-dependency conflict on optional
framework peers (Svelte, Vue Router, and so on).

Google Analytics 4 is also production only. It is gated on `isProduction` and
on `PUBLIC_GA_MEASUREMENT_ID`, which is set in the Production scope alone. The
event catalog, the GA4 admin setup, and how to exclude your own visits are in
[`analytics.md`](analytics.md).

## Verifying a change to this setup

```bash
cd Code
npm run build                                            # production
PUBLIC_SITE_URL=https://staging.morgankeys.com \
  PUBLIC_ENV=staging npm run build                       # staging
```

Check `dist/robots.txt` and the `robots` meta tag in `dist/index.html` differ
between the two.

## One-time Vercel setup

1. Settings -> Domains -> add `staging.morgankeys.com`, set it to track the
   `staging` Git branch rather than production.
2. Settings -> Environment Variables -> add the variables above, scoping
   each to Production and Preview respectively.
3. GitHub -> Settings -> Branches -> protect `main`, requiring a PR.

Root Directory stays `Code` and Output Directory `dist` for both environments.
