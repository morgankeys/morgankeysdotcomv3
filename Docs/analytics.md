# Analytics: Google Analytics 4

The site sends pageviews and a set of custom events to one GA4 property, on
production only. Vercel Web Analytics runs alongside it and works the same way
(see [`deployment.md`](deployment.md#analytics)).

## Production only

`PUBLIC_GA_MEASUREMENT_ID` is set in Vercel's **Production** scope only.
`gaMeasurementId` in `Code/src/lib/env.ts` also requires `isProduction`. So
even if the variable ends up in Preview or in a local `.env`, staging and local
builds render no Google tag and send nothing.

| Build                          | Google tag                                             |
| ------------------------------ | ------------------------------------------------------ |
| Production with the ID         | Loaded                                                 |
| Production without the ID      | None                                                   |
| Staging (`PUBLIC_ENV=staging`) | None                                                   |
| `npm run dev`                  | None; events are logged to the browser console instead |

To check, load https://morgankeys.com and look for
`googletagmanager.com/gtag/js?id=G-…` in the Network tab. It must not appear
on staging.morgankeys.com.

### Keeping your own visits out

Visit `https://morgankeys.com/?analytics=off` once in each browser you use. It
stores a flag in localStorage and sets Google's `ga-disable-<ID>` switch, so
that browser sends nothing. The console confirms it on every page. Visit
`?analytics=on` to undo it. The parameter is removed from the address bar
straight away.

## How it's built

| Piece                                                                 | Role                                                                                                                                                                                                 |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Code/src/components/GoogleAnalytics.astro`                           | Boots gtag in `<head>`: opt-out check, `theme_preference` / `color_scheme` user properties, `config` (sends `page_view`).                                                                            |
| `Code/src/lib/analytics.ts`                                           | `track(name, params)`. The `AnalyticsEvents` interface is the typed catalog of every event, and a new event must be added there before it will compile. Also holds `placementOf` and `VisibleTimer`. |
| `Code/src/scripts/analytics.ts`                                       | Delegated, site-wide: overlays, links, section reach.                                                                                                                                                |
| `case-study-overlay.ts`                                               | Dispatches `overlayopen` and passes the close method to `dialog.close()`.                                                                                                                            |
| `Carousel.vue`, `ThemeToggle.vue`, `ContactForm.vue`, `image-zoom.ts` | Send their own events.                                                                                                                                                                               |

Markup hooks:

- `data-analytics-overlay="case_study|intro|contact"` on each overlay `<dialog>`.
- `data-analytics-section="…"` on each home-page region. It is used for
  `section_view` and as the `placement` of anything clicked inside it.

New case studies, decks, prototypes, and social links are tracked
automatically. Links are classified by URL, and overlays by their attribute.

**No personal data.** Nothing a visitor types (name, email, message) is sent.
Google's terms forbid it.

## Event catalog

`placement` is where a click happened: a section (`carousel`, `sidebar`,
`decks`, `demos`, `background`, `earlier_work`, `contact`) or the id of the
overlay it was in (for example `chart-of-accounts`). It is `url` when an
overlay was opened from the address bar.

### Overlays (case studies, intro, contact)

| Event             | Parameters                                                                                                                                                                  | Fires when                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `overlay_open`    | `overlay_id`, `overlay_type`, `open_source` (`click` / `deep_link` / `hash_change`), `placement`                                                                            | Any overlay opens                                                               |
| `overlay_scroll`  | `overlay_id`, `overlay_type`, `percent_scrolled` (25/50/75/90)                                                                                                              | Each depth milestone, once per open (not for contact)                           |
| `case_study_read` | `overlay_id`, `visible_seconds`                                                                                                                                             | A case study reaches 90% depth after at least 10 visible seconds, once per open |
| `overlay_close`   | `overlay_id`, `overlay_type`, `close_method` (`button` / `backdrop` / `escape` / `swipe` / `navigation` / `page_exit`), `visible_seconds`, `percent_scrolled` (max reached) | Any overlay closes, or the tab is closed while one is open                      |

`visible_seconds` counts only time when the tab is in the foreground.
`navigation` means another overlay was opened from inside this one, for
example a case study's "Contact me".

### Links

| Event            | Extra parameters                     | Matched by                                             |
| ---------------- | ------------------------------------ | ------------------------------------------------------ |
| `resume_open`    | —                                    | `docs.google.com/document/…`                           |
| `deck_open`      | —                                    | `figma.com/deck/…`                                     |
| `prototype_open` | —                                    | `figma.com/make/…` or `/proto/…`                       |
| `social_click`   | `network`                            | GitHub, LinkedIn, X, Substack, Threads                 |
| `link_click`     | `link_type` (`outbound` / `in_page`) | Anything else, for example the patent link or `#demos` |

All of these also carry `link_text`, `link_url` (with the query string
removed), and `placement`. Middle-clicks count as well.

### Inline decks

| Event             | Parameters                                                                                                    | Fires when                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `deck_embed_load` | `outcome` (`ready` / `timeout`), `trigger` (`auto` on desktop / `tap` on phones), `load_seconds`, `placement` | An inline Figma deck finishes loading, or gives up after 20 seconds, once per page load. On phones `load_seconds` runs from the tap |

What visitors do inside the deck is not visible to the site. The "Open the
deck in Figma" link under it still reports `deck_open`.

### Page and components

| Event                | Parameters                                                                             | Fires when                                                            |
| -------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `page_view`          | GA default                                                                             | Page load                                                             |
| `section_view`       | `section`                                                                              | A section's top reaches the upper half of the viewport, once per load |
| `carousel_navigate`  | `method` (`next` / `prev` / `dot` / `swipe`), `slide_index` (1 = intro), `slide_title` | The carousel settles on a new slide                                   |
| `theme_change`       | `theme` (`system` / `dark` / `light`)                                                  | Theme toggle clicked                                                  |
| `image_zoom_open`    | `image_alt`, `placement`                                                               | A zoomable image opens                                                |
| `image_zoom_close`   | `max_zoom` (1–3), `visible_seconds`                                                    | The zoom viewer closes                                                |
| `contact_form_start` | `form_location` (`page` / `overlay`)                                                   | First keystroke in a form                                             |
| `contact_form_error` | `form_location`, `error_type` (`validation` / `api` / `network`), `fields`             | Submit fails                                                          |
| `generate_lead`      | `form_location`                                                                        | Message sent successfully                                             |
| `contact_form_reset` | `form_location`                                                                        | "Send another message"                                                |

User properties: `theme_preference` (`system` / `dark` / `light`) and
`color_scheme` (the OS setting).

## One-time GA4 setup

In [analytics.google.com](https://analytics.google.com), under Admin for the
property:

1. **Data streams → Web → Enhanced measurement.** Keep _Page views_,
   _Scrolls_, and _File downloads_. Turn **off**:
   - _Outbound clicks_: `resume_open`, `deck_open`, and the other link events
     replace it with better names. Leaving it on double-counts every link as
     `click`.
   - _Form interactions_: its `form_start` fires on focus, and the contact
     overlay autofocuses, so it inflates starts. `contact_form_start` and
     `generate_lead` replace it.
   - _Site search_ and _Video engagement_: the site has neither.
   - Under Page views → Advanced, _Page changes based on browser history
     events_: `#demos` and overlay hashes would otherwise log extra page views.
2. **Data display → Events → Key events.** Mark `generate_lead`,
   `resume_open`, and `case_study_read`. Once each has fired once you can also
   mark `deck_open` and `prototype_open`. An event appears in the list only
   after it has fired; to add one sooner, create it as a new key event by name.
3. **Data display → Custom definitions.** Register these so parameters show up
   in reports and explorations (names must match exactly):
   - Event-scoped dimensions: `overlay_id`, `overlay_type`, `open_source`,
     `placement`, `close_method`, `section`, `network`, `link_type`, `method`,
     `slide_title`, `theme`, `image_alt`, `form_location`, `error_type`,
     `fields`
   - Event-scoped metrics: `visible_seconds` (unit: seconds), `slide_index`,
     `max_zoom`
   - User-scoped dimensions: `theme_preference`, `color_scheme`
   - `percent_scrolled`, `link_text`, and `link_url` are built-in; don't
     register them.
4. **Data collection and modification → Data retention.** Raise event data
   retention from 2 to **14 months**. Explorations can only look back as far
   as this setting.
5. **Data collection → Google signals**: leave off. It adds nothing on a
   portfolio and triggers extra consent requirements.

### Reports worth saving

- **Which case studies land:** Explore → Free form. Rows: `overlay_id`.
  Values: event count filtered to `overlay_open` and to `case_study_read`, plus
  the average of `visible_seconds`.
- **Where opens come from:** `overlay_open` by `placement` × `open_source`.
- **Contact funnel:** Explore → Funnel: `overlay_open` (contact) or
  `section_view` (contact) → `contact_form_start` → `generate_lead`.
- **How far down the page people get:** `section_view` by `section`, as a
  share of `page_view`.

## Privacy: cookies in the US only

There is no consent banner. Instead, `GoogleAnalytics.astro` sets Google
Consent Mode defaults before the tag configures:

- **Everywhere:** `analytics_storage`, `ad_storage`, `ad_user_data`, and
  `ad_personalization` are `denied`.
- **US only:** `analytics_storage` is `granted`, because a region-specific
  default overrides the global one.

Google works out the visitor's region from their IP when it serves gtag.js,
so this works on a static site with no server code.

| Visitor                             | Cookies                   | What GA receives                                                                        |
| ----------------------------------- | ------------------------- | --------------------------------------------------------------------------------------- |
| US                                  | `_ga` first-party cookies | Full data: users, sessions, and every event above                                       |
| Everywhere else (EU, UK, and so on) | None                      | Cookieless pings: events without a client ID, so no returning-user or session stitching |

What this means for reports:

- Non-US users and sessions are **undercounted**. Each hit looks like a new
  anonymous visitor. Event counts (how many `case_study_read`, `generate_lead`,
  and so on) are still recorded.
- Under Admin → Data display → Reporting identity, choose **Blended**. GA4
  then fills the gap with behavioral modeling once the property has enough
  traffic. Google's threshold is about 1,000 events a day from denied users,
  so a small portfolio may never qualify, which is fine.

To check it, use Chrome DevTools → Application → Cookies on morgankeys.com.
Browsing from the US you should see `_ga` and `_ga_<ID>`. Through a VPN exit in
the EU or UK you should see neither.

The `gcs` parameter on each `collect` request in the Network tab shows the
consent state as `G1` + ad storage + analytics storage (1 granted, 0 denied).
Ad storage is always denied, so expect `gcs=G101` from the US and `gcs=G100`
everywhere else. A `cid=` parameter also appears only when the cookie is set.

**Stricter option.** Cookieless pings still send requests, with the visitor's
IP, to Google. If you ever want _nothing_ to reach Google from outside the US,
the tag must not load there at all. That needs a server-side country check, for
example Vercel Routing Middleware reading `x-vercel-ip-country`. This site does
not currently do that.
