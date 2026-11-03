/**
 * site.ts
 *
 * Site-wide page titles and description. BaseLayout sets them in <head>, and
 * the case-study overlays reuse them to retitle the tab as a study's route
 * opens and closes, so the two never disagree.
 */

/** Full title for the home page, and for any page that sets no `title`. */
export const SITE_TITLE = "Morgan Keys | Product Designer, AI Builder";

export const SITE_DESCRIPTION =
  "Product designer and AI builder who turns messy B2B problems into clear, shipped products.";

/** A page's full title, e.g. "Cisco XDR | Morgan Keys". */
export function pageTitle(title?: string): string {
  return title ? `${title} | Morgan Keys` : SITE_TITLE;
}
