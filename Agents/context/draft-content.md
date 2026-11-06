# Draft content

Draft content is anything not ready for visitors:

- a case study still being written (its body in a `drafts/` folder)
- placeholder images
- `DraftNote` open items
- the specimen and sandbox pages in `Code/src/pages/dev/`
- fictional sample material: invented companies, metrics, quotes, lorem ipsum

Read this before adding any of it, or when a pull request's draft check warns or fails.

## Where it renders

| Build | Branch | Drafts |
| --- | --- | --- |
| `npm run dev` | any | Shown |
| Vercel preview | a feature branch | Shown |
| Vercel preview, `staging.morgankeys.com` | `staging` | Hidden |
| Vercel production, `morgankeys.com` | `main` | Hidden |
| Local `npm run build` | any | Hidden |

Feature-branch previews show drafts so a pull request can be reviewed in its own
Vercel preview. Staging and production are public, so they never render them.

`Code/src/lib/draft-content.mjs` decides this at build time from Vercel's
`VERCEL_ENV` and `VERCEL_GIT_COMMIT_REF` and the site's `PUBLIC_ENV`. Every
condition has to hold, so a missing or unexpected variable hides drafts.
Components read the result as `showDraftContent` from `Code/src/lib/env.ts`.

## Where it can merge

| Pull request into | Draft content | Draft check |
| --- | --- | --- |
| `staging` | Allowed, but it is clean-up to do | Warning |
| `main` | Not allowed | Error, the check fails |

Finish or remove drafts on the feature branch where possible. A draft merged into
`staging` stays hidden there, but it blocks the next `staging` → `main` promotion
until it is finished or removed.

CI runs the check on every pull request. Run it locally with:

```bash
cd Code
npm run draft:check                    # list draft content
npm run draft:check -- --base main     # what a PR into main would see
```

It counts files in a `drafts/` folder, `<DraftNote>` uses, and placeholder-image
imports. It skips `src/pages/dev/`, which is part of the kit and always hidden on
staging and production.

## The patterns

### A case study in progress

- Put the long-form body in `Code/src/components/case-studies/drafts/<slug>.astro`.
- In the study's fragment, render it when `showDraftContent` is true, and the
  minimal variant (lead plus a "Case study in progress" banner) otherwise.
- Mark open items with `Code/src/components/case-study/DraftNote.astro`. It
  checks `showDraftContent` itself, so a note left in shipped markup still
  renders nothing on staging or production.
- Use `Code/src/assets/placeholder-raster.jpg` for images not made yet. Give
  each one its planned final caption, and say in its alt text what the real
  image will show.
- To ship, swap in real images, drop the `DraftNote`s, move the body into the
  fragment, and delete the draft file. `npm run draft:check` then lists nothing.

`Code/src/components/case-studies/ai-prototyping-kit.astro` is the working example.

### Specimen and sandbox pages

These are dynamic routes in `Code/src/pages/dev/`. Their `getStaticPaths`
returns no paths unless `showDraftContent`, so staging and production builds
emit nothing for them. `Code/src/pages/dev/[component].astro` is the working
example.

```astro
---
import { showDraftContent } from "../../lib/env";

export function getStaticPaths() {
  if (!showDraftContent) {
    return [];
  }
  return [{ params: { component: "my-specimen" } }];
}
---
```

- **Add a specimen** by adding a path to an existing dev route, not a new file.
- **Never add a static page** such as `src/pages/dev/sandbox.astro`. It builds
  in every environment.
- **Keep fictional sample material in components** that only a dev route
  renders. Real pages never import them.

## Enforcement

- **The draft check** (`Code/scripts/draft-check.mjs`) runs in CI on every pull
  request: a warning into `staging`, an error into `main`.
- **The `/dev/` guard** (`devOnlyPagesGuard` in `Code/astro.config.mjs`) fails any
  build other than a feature-branch preview that emits a page under `/dev/`.
  That covers local builds, CI, staging, and production.
- **The sitemap** leaves out `/dev/` pages, so a preview's sitemap never lists them.

Never remove or weaken these checks. When one fires, fix the content or the
route so it follows the patterns above. Never move a sandbox page out of `dev/`
to get past the guard.

## Why staging is not a preview

- **Staging is public.** `staging.morgankeys.com` is reachable by anyone. Its
  noindex tag keeps it out of search, not away from people.
- **A Vercel build is a production build.** `import.meta.env.DEV` is `false` on
  every Vercel deploy, previews included. That is why previews need the
  branch-based check rather than the dev flag.
- **A folder does not hide a page.** Astro builds every file in `src/pages/`. A
  fictional sample case study once shipped to production and the sitemap this way.

## Checking your work

Simulate each environment locally:

```bash
cd Code
npm run build    # local: drafts hidden, dist/ has no dev/ folder
VERCEL_ENV=preview VERCEL_GIT_COMMIT_REF=feat/my-change PUBLIC_ENV=staging \
  npm run build  # feature preview: drafts shown, dist/dev/ exists
VERCEL_ENV=preview VERCEL_GIT_COMMIT_REF=staging PUBLIC_ENV=staging \
  npm run build  # staging: drafts hidden
```
