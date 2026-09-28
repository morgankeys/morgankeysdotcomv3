# Dev-only pages

Sandbox, test, specimen, and sample pages exist for building the site, not for
visitors. They render under `npm run dev` and nowhere else: not in a local
production build, not on staging, not in production.

Read this before adding any page that is not meant for visitors, or any page
under `Code/src/pages/dev/`.

## Why this matters

- **Staging is public.** `staging.morgankeys.com` is reachable by anyone. Its
  noindex tag keeps it out of search, not away from people.
- **Staging and production are both production builds.** Vercel runs
  `astro build` for each, so `import.meta.env.DEV` is `false` on both. "Dev"
  means your local `astro dev` server only.
- **A folder does not hide a page.** Astro builds every file in `src/pages/`.
  A fictional sample case study once shipped to production and the sitemap
  this way.

## The pattern

Dev-only pages are dynamic routes in `Code/src/pages/dev/`. Their
`getStaticPaths` returns no paths outside dev, so a build emits nothing for them.
`Code/src/pages/dev/[component].astro` is the working example.

```astro
---
export function getStaticPaths() {
  if (!import.meta.env.DEV) {
    return [];
  }
  return [{ params: { component: "my-specimen" } }];
}
---
```

- **Add a specimen** by adding a path to an existing dev route, not a new file.
- **Never add a static page** such as `src/pages/dev/sandbox.astro`. It builds
  in every environment.
- **Keep sample content in components.** Fictional or placeholder material
  (invented companies, metrics, quotes, lorem ipsum) lives in a component that
  only a dev route renders. It never sits in a page file of its own.
- **Real pages never import sample components.**

## Enforcement

`devOnlyPagesGuard` in `Code/astro.config.mjs` fails any build that emits a page
under `/dev/`. It runs on every `npm run build`, so CI and both Vercel
environments stop before a sandbox page can deploy.

When the guard fires, fix the route so it follows the pattern above. Never
remove, weaken, or bypass the guard, and never move a sandbox page out of
`dev/` to get past it.

The guard only watches `/dev/`. A sandbox page placed anywhere else is still a
mistake that no check catches, which is why sandbox pages go in `dev/` only.

## Checking your work

```bash
cd Code
npm run build   # must pass, and dist/ must contain no dev/ folder
npm run dev     # the dev page renders at /dev/<name>
```

## Sharing a sandbox page on staging

That is not supported. If a work-in-progress page needs review on staging, ask
the human first. It then becomes a real page with real content, and it should
say it is a draft.
