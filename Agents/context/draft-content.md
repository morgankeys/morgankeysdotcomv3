# Draft content

Draft content is anything not ready for visitors:

- a case study still being written (its body in a `drafts/` folder)
- a case study hidden with `draft: true` in its registry entry
- placeholder images
- `DraftNote` open items
- the Storybook component catalog served at `/dev/`
- fictional sample material: invented companies, metrics, quotes, lorem ipsum

Read this before adding any of it, or when a pull request's draft check warns or fails.

## Where it renders

| Build                                    | Branch           | Drafts |
| ---------------------------------------- | ---------------- | ------ |
| `npm run dev`                            | any              | Shown  |
| Vercel preview                           | a feature branch | Shown  |
| Vercel preview, `staging.morgankeys.com` | `staging`        | Hidden |
| Vercel production, `morgankeys.com`      | `main`           | Hidden |
| Local `npm run build`                    | any              | Hidden |

Feature-branch previews show drafts so a pull request can be reviewed in its own
Vercel preview. Staging and production are public, so they never render them.

Draft content shows in the `development` and `preview` deploy stages
(`deployStage` in `Code/src/lib/env.ts`, which also drives the environment badge).
`Code/src/lib/deploy-stage.mjs` tells a feature preview from staging at build time,
from Vercel's `VERCEL_ENV` and `VERCEL_GIT_COMMIT_REF` and the site's `PUBLIC_ENV`.
Every condition has to hold, so a missing or unexpected variable makes the build
staging and hides drafts. Components read `showDraftContent` from `env.ts`.

## Where it can merge

| Pull request into | Draft content                     | Draft check            |
| ----------------- | --------------------------------- | ---------------------- |
| `staging`         | Allowed, but it is clean-up to do | Warning                |
| `main`            | Not allowed                       | Error, the check fails |

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
imports. It skips Storybook stories and `src/components/story-samples.ts`, which
only render in the catalog and never on staging or production.

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
  fragment, and delete the draft file. Remove the fragment's `showDraftContent`
  branch too, including any header fields (standfirst, role, highlights) it
  hid outside drafts. `npm run draft:check` then lists nothing.

The AI Prototyping Kit study went through this whole cycle: drafted in #81,
published in the pull request that followed. The history of
`Code/src/components/case-studies/ai-prototyping-kit.astro` shows both states.

### A hidden case study

Set `draft: true` on a study's registry entry (`Code/src/lib/case-studies/<slug>.ts`)
to take the whole study off staging and production: no carousel card, no overlay,
and no `/work/<id>/` page or sitemap entry. It still shows on the dev server and
feature-branch previews. Remove the flag to publish it again.

This is safe to merge into `main`, so the draft check does not flag it: the study
is gated by `showDraftContent` (through `isStudyVisible` in the registry), so
nothing of it reaches a production build. A link to the study's route from
elsewhere would 404 on production while it is hidden.

### The component catalog (Storybook)

Storybook is the component catalog. It is served at `/dev/` on the dev server,
and a feature-branch preview build writes it to `dist/dev`. Staging,
production, and a local `npm run build` do not build it. `scripts/build-storybook-dev.mjs`
throws if `dist/dev` exists on any other build. The `/dev/` page guard in
`Code/astro.config.mjs` still fails a build that emits an Astro page there.

- **Add a component to the catalog** by adding `Component.stories.ts` beside
  the component. `npm run lint` runs `scripts/stories-check.mjs`, which fails
  when a file in `src/components/` has no sibling story.
- **Exempt** a file only by adding it, with a reason, to `EXEMPT` in that
  script. Case-study bodies, `HomePage.astro`, and `GoogleAnalytics.astro` are
  the current exemptions.
- **Never add a static page** such as `src/pages/dev/sandbox.astro`. It builds
  in every environment.
- **Keep sample copy in the story files** (and `src/components/story-samples.ts`).
  Real pages never import them. Placeholder-image imports in those files are
  not draft content; an import from a page still is.

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
