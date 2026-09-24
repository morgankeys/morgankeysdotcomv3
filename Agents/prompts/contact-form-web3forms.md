# Finish the contact form (Web3Forms)

A ready-to-run task prompt. Paste everything below the line into a fresh agent chat.
The agent needs no prior context; every decision is already made here.

---

## Goal

Make the existing contact form on the home page actually send messages, using
Web3Forms, with the access key read from an environment variable instead of
hardcoded, a honeypot spam check, a staging-aware subject line, and a graceful
fallback when the key is missing.

## Before you start

1. Read `AGENTS.md` at the repo root, then `Agents/context/git-workflow.md`, then
   `Code/ARCHITECTURE.md`. Follow their rules. The ones that matter most here:
   - Never commit to `main`. Create a branch named `feat/contact-form-web3forms`
     off `main` before your first edit.
   - Never push. Commit on the branch and report the commits when done.
   - No inline styles (`style="..."`). No hardcoded colors, spacing, radii, or font
     values in CSS. Use `var(--md-sys-...)` tokens only.
   - Do not touch anything in `Code/src/styles/tokens/`.
2. Run `git status`. If the working tree is not clean, stop and tell the user.
3. Run these once so the project builds before you change anything:
   ```bash
   cd Code && npm install && npm run tokens
   ```

## Inputs

- The Web3Forms access key. The user has one. Do not ask for it and do not paste
  it into any file that is tracked by git. It goes only in `Code/.env`, which is
  gitignored. If `Code/.env` does not exist, create it with a placeholder value and
  tell the user to fill it in.

## Files you will touch

| File                                   | Change                                     |
| -------------------------------------- | ------------------------------------------ |
| `Code/src/components/ContactForm.vue`  | Read key from env, honeypot, subject, fallback |
| `Code/.env.example`                    | New. Documents the variable name.          |
| `Docs/deployment.md`                   | Add the variable to the env table.         |

Do not change any other file. In particular, do not change `Code/src/pages/index.astro`.
It already renders the form and links to it correctly.

## Steps

### 1. Create `Code/.env.example`

Create this file with exactly this content:

```
# Web3Forms access key for the contact form. Public by design (it is sent from
# the browser). Create one at https://web3forms.com. Set the same variable in
# Vercel for Production and Preview. Without it the form falls back to a
# "not configured" message.
PUBLIC_WEB3FORMS_ACCESS_KEY=
```

Confirm that `git status` shows it as a new untracked file (the root `.gitignore`
has an exception for `.env.example`). If `Code/.env` does not exist, copy the
example to `Code/.env` and tell the user to add their key there. Never commit
`Code/.env`.

### 2. Change the script block of `ContactForm.vue`

Open `Code/src/components/ContactForm.vue`. Make these changes in the
`<script setup lang="ts">` block.

**2a.** Replace the hardcoded key. Delete these three lines:

```ts
// Create a Web3Forms access key for morgan.keys@gmail.com at https://web3forms.com
// Messages are delivered to that address
const ACCESS_KEY = 'REPLACE_WITH_WEB3FORMS_ACCESS_KEY';
```

and put this in their place:

```ts
import { isStaging } from '../lib/env';

// Public by design: Web3Forms keys are meant to be sent from the browser.
// Set PUBLIC_WEB3FORMS_ACCESS_KEY in Code/.env locally and in Vercel per
// environment. See Code/.env.example and Docs/deployment.md.
const ACCESS_KEY: string | undefined = import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY;
const isConfigured = Boolean(ACCESS_KEY);
```

Move the `import { isStaging }` line up so it sits directly under the existing
`import { ref } from 'vue';` line. Imports must come before other statements.

**2b.** Add a honeypot ref. Directly after `const message = ref('');` add:

```ts
// Honeypot. Hidden from people, filled in by bots. Web3Forms rejects the
// submission when this field has a value.
const botcheck = ref(false);
```

**2c.** Change the request body. Inside `handleSubmit`, replace the object passed
to `JSON.stringify` with:

```ts
{
  access_key: ACCESS_KEY,
  name: name.value,
  email: email.value,
  message: message.value,
  subject: `${isStaging ? '[staging] ' : ''}New message from morgankeys.com`,
  from_name: name.value,
  // Empty when a person submits. Any value marks the submission as spam.
  botcheck: botcheck.value ? 'on' : '',
}
```

**2d.** Guard against a missing key. Make the first line of `handleSubmit`:

```ts
if (!isConfigured || !validate()) return;
```

That replaces the existing `if (!validate()) return;` line.

### 3. Change the template block of `ContactForm.vue`

**3a.** Add the honeypot field. Directly above the `<div class="actions">`
element, add:

```html
<label class="honeypot" aria-hidden="true">
  Leave this box unchecked
  <input v-model="botcheck" type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" />
</label>
```

**3b.** Add the fallback. Wrap the whole existing `<form ...>...</form>` so that it
only renders when configured, and render a message otherwise. The template root
should end up looking like this (keep all the existing form contents unchanged
inside the `<form>`):

```html
<template>
  <form v-if="isConfigured" class="contact-form" @submit.prevent="handleSubmit">
    ...existing fields, honeypot, actions, success and error messages...
  </form>
  <p v-else class="unconfigured">
    The message form is not set up yet. Please reach out through one of the links above.
  </p>
</template>
```

### 4. Change the style block of `ContactForm.vue`

Add these two rules at the end of the `<style scoped>` block:

```css
/* Honeypot: removed from layout and the accessibility tree; bots still see it. */
.honeypot {
  display: none;
}

.unconfigured {
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  font-weight: var(--md-sys-typescale-body-large-weight);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  color: var(--md-sys-color-on-surface-variant);
}
```

Do not use `style="display: none"` on the honeypot element. Inline styles are
banned in this repo.

### 5. Update `Docs/deployment.md`

Find the "Environment variables" table. It currently has two rows,
`PUBLIC_SITE_URL` and `PUBLIC_ENV`. Add a third row:

```
| `PUBLIC_WEB3FORMS_ACCESS_KEY` | Web3Forms key | Web3Forms key (same or a second key) |
```

Then, after the paragraph that explains `PUBLIC_ENV`, add this paragraph:

```
`PUBLIC_WEB3FORMS_ACCESS_KEY` is the Web3Forms access key the contact form
(`Code/src/components/ContactForm.vue`) sends with each submission. It is public
by design and safe to expose to the browser. When it is unset the form renders a
"not set up yet" message instead of a form that would fail. Staging submissions
carry a `[staging]` prefix in the email subject; using a second key for Preview
keeps test messages out of the production inbox entirely. Locally, put it in
`Code/.env` (gitignored); `Code/.env.example` lists the name.
```

Keep the table's column alignment consistent with the existing rows.

### 6. Verify

Run all of these from `Code/`. Every one must pass. Do not weaken any lint rule
or add ignore comments to make them pass; fix the code instead.

```bash
npx prettier --write src/components/ContactForm.vue
npm run lint
npm run build
npm run ds:validate -- --strict
```

Then confirm the two runtime paths:

1. **Unconfigured.** Temporarily make sure `Code/.env` has no value for
   `PUBLIC_WEB3FORMS_ACCESS_KEY`, run `npm run dev`, open
   `http://localhost:4321/#contact`, and confirm the "not set up yet" text appears
   where the form would be.
2. **Configured.** Put a value in `Code/.env` (the user's real key if present,
   otherwise any non-empty string), restart the dev server (Astro reads `.env` at
   startup only), and confirm the form renders with Name, Email, Message, and Send.
   The honeypot checkbox must not be visible. If a real key is present, submit a
   test message and confirm the success state appears.

If you cannot open a browser, use `curl http://localhost:4321/ | grep -c unconfigured`
for the unconfigured case. For the configured case, note that the form is a Vue
island, so the fields only render after hydration; `curl` alone cannot confirm it.
Say so in your report rather than claiming it was verified.

### 7. Commit

Two commits on the branch, in this order, following the style in
`Agents/context/git-workflow.md`:

1. `Read Web3Forms key from env and add honeypot to contact form`
   (covers `ContactForm.vue` and `Code/.env.example`)
2. `Document PUBLIC_WEB3FORMS_ACCESS_KEY in deployment guide`
   (covers `Docs/deployment.md`)

Do not push. Report the branch name and both commit hashes.

## Out of scope

Do not do any of these, even if you notice them. Mention them in your report
instead.

- The social links in `Code/src/pages/index.astro` all point to `#`. They need real
  URLs from the user.
- The Resume button points to `/resume.pdf`, which does not exist in
  `Code/public/`. The user needs to supply the file.
- Adding a CAPTCHA. The honeypot is enough until spam is actually a problem.
- Setting the variable in Vercel. The user does that in the Vercel dashboard.

## Done when

- [ ] `ContactForm.vue` has no hardcoded key and reads `PUBLIC_WEB3FORMS_ACCESS_KEY`.
- [ ] The form renders the "not set up yet" text when the variable is empty.
- [ ] The honeypot field exists, is sent as `botcheck`, and is hidden via a scoped class.
- [ ] Staging builds prefix the subject with `[staging]`.
- [ ] `Code/.env.example` exists and is tracked; `Code/.env` is not tracked.
- [ ] `Docs/deployment.md` documents the variable.
- [ ] `npm run lint`, `npm run build`, and `npm run ds:validate -- --strict` all pass.
- [ ] Two commits on `feat/contact-form-web3forms`, nothing pushed.
