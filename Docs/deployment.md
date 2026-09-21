# Deployment: staging and production

The site deploys from GitHub to Vercel. One Vercel project serves both
environments, distinguished by branch.

| Branch    | Vercel environment | URL                        |
| --------- | ------------------ | -------------------------- |
| `main`    | Production         | https://morgankeys.com     |
| `staging` | Preview            | https://staging.morgankeys.com |

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

## Environment variables

Set in Vercel under Settings -> Environment Variables, scoped per environment.

| Variable          | Production               | Preview                        |
| ----------------- | ------------------------ | ------------------------------ |
| `PUBLIC_SITE_URL` | `https://morgankeys.com` | `https://staging.morgankeys.com` |
| `PUBLIC_ENV`      | `production`             | `staging`                      |

`PUBLIC_SITE_URL` feeds Astro's `site` (`Code/astro.config.mjs`), which drives
canonical URLs and the generated sitemap. Without it, a staging build would
advertise the production domain.

`PUBLIC_ENV` drives `Code/src/lib/env.ts`. Anything other than `production`
counts as staging, so a missing or misconfigured value fails safe — noindexed
and visibly marked, never the reverse.

## How staging is kept out of search

Staging is publicly reachable but not indexable, via two independent guards:

1. `Code/src/pages/robots.txt.ts` generates `robots.txt` per environment —
   `Allow: /` plus the sitemap on production, `Disallow: /` on staging. It is an
   endpoint rather than a file in `public/` because a static file cannot vary
   between builds.
2. `BaseLayout.astro` emits `<meta name="robots" content="noindex, nofollow">`
   on staging, covering a page reached directly.

A `StagingBanner` pill in the bottom-right corner marks non-production deploys
so a staging tab is never mistaken for the live site.

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
2. Settings -> Environment Variables -> add the two variables above, scoping
   each to Production and Preview respectively.
3. GitHub -> Settings -> Branches -> protect `main`, requiring a PR.

Root Directory stays `Code` and Output Directory `dist` for both environments.
