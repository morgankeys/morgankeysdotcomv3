# Content review checklist

A running list of content fixes for morgankeys.com, worked through one item at a
time. Check an item off in the same pull request that fixes it, and add a line
under "Done" with the PR.

Each item says who moves it forward:

- **Claude** — an agent can make the change and open a PR for review.
- **Morgan** — needs Morgan's own words, facts, or a decision first. An agent can
  draft options.

Paths are relative to `Code/`.

## Before the next production deploy

- [x] **1. Keep the fictional case study out of production** — Claude
  - Deleted the kit's fictional sample page, `/work/enterprise-design-system/`.
    A build guard now fails any build that emits a `/dev/` page; see
    `Agents/context/dev-only-pages.md`.

## Chart of Accounts case study

`src/components/case-studies/chart-of-accounts.astro`

- [ ] **2. Pay off the "limitations" line** — Morgan
  - "Usability testing" ends with "we later learned that there were
    limitations," but no later section names them. One sentence tying it to
    the Customer Success section would close the loop.
- [ ] **3. Put the period inside the closing quote** — Claude
  - In "Impact", `that's how it works”.` should read `that's how it works.”`

## Discoverability

- [ ] **4. Add social preview tags** — Claude
  - The home page has no Open Graph or Twitter tags, no preview image, and no
    canonical link, so shared links render as bare text. Add them in
    `src/layouts/BaseLayout.astro`. The portrait in `src/assets/home/carousel/`
    can be the preview image.
- [ ] **5. Make the page title descriptive** — Morgan to confirm wording
  - "Portfolio | Morgan Keys" could be "Morgan Keys | Product Designer, AI
    Builder". Set in `src/pages/index.astro`.
- [ ] **6. Align the meta description** — Morgan to confirm wording
  - The default in `src/layouts/BaseLayout.astro` says "creative technologist";
    the site says "AI Builder" everywhere else.
- [ ] **7. Add GitHub to the contact socials** — Morgan to decide
  - GitHub is in the header socials but not the "Ready to chat?" block in
    `src/pages/index.astro`.

## Copy

- [ ] **8. Flesh out the Google case studies** — Morgan
  - Business Home and AI Prototyping Kit lead the carousel but open to "Case
    study in progress". Even three or four bullets on problem, what you built,
    and outcome would help. If NDA limits detail, say so instead of "in
    progress". Files: `src/components/case-studies/business-home.astro`,
    `src/components/case-studies/ai-prototyping-kit.astro`.
- [ ] **9. Make the intro concrete** — Morgan, Claude can draft
  - `introCard.body` in `src/pages/index.astro` leans on abstractions
    ("curiosity, constant improvement, and craft"). The patent, the $42,000
    standalone contract, and the six-week Google launch are stronger openers.
- [ ] **10. Fix quick-facts grammar** — Claude can draft
  - "AI-enabled builder of rich prototypes, experience shipping to production"
    is a comma splice. "B2B and SaaS, highly regulated environments" reads as a
    broken list. `quickFacts` in `src/pages/index.astro`.
- [ ] **11. Vary older-project verbs** — Claude can draft
  - Boardable Surveys opens two sentences with "Created"; AI Minutes pairs
    "Created" with "Also designed". `projects` in `src/pages/index.astro`.
- [ ] **12. Rename undersold section headings** — Morgan to decide
  - "Older projects" invites skimming ("Selected work", "Earlier work").
    "Curriculum vitae" is stiffer than the page's voice ("Background").
- [ ] **13. Write descriptive alt text** — Claude
  - Deck and older-project images use title-only alt text such as "Cisco
    cybersecurity" and "Design system overview". Match the case-study heroes,
    which describe what is on screen. `src/pages/index.astro`.

## Housekeeping

- [ ] **14. Resolve the contact-form design-system deviation** — Claude
  - `npm run ds:validate` flags `var(--contact-form-height)` in
    `src/pages/index.astro`. Replace it with a token or log it in
    `Docs/Design system/deviations-backlog.md`.
- [ ] **15. Confirm the patent record** — Morgan
  - Open [US 10,552,995](https://patents.google.com/patent/US10552995B2/en) and
    check the inventors list includes you. It was confirmed only through
    search results.
- [ ] **16. Delete the merged `fix/coa-copy-edits` branch on GitHub** — Morgan
- [x] **17. Keep the standalone case-study kit** — Morgan
  - Decided to keep `src/layouts/CaseStudyLayout.astro` and its primitives
    (`Section`, `Container`, `Prose`, `Figure`, `Lightbox`, `Tag`) for building
    future case studies, though no page uses them yet. Don't remove them as
    dead code.

## Done

- Contact form reads its Web3Forms key from the environment and shows a
  fallback when unset.
- External links open in a new tab.
- Chart of Accounts placeholder paragraphs replaced with real copy.
- Chart of Accounts copy polish and granted-patent link
  (morgankeys/morgankeysdotcomv3#17).
- Fictional sample case study removed from the site.
