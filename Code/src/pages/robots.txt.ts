import type { APIRoute } from "astro";
import { isProduction } from "../lib/env";

/**
 * robots.txt
 *
 * Generated per environment rather than served from `public/`, which cannot
 * vary between the production and staging builds. Staging is disallowed
 * wholesale so preview deploys never enter a search index.
 */
export const GET: APIRoute = ({ site }) => {
  const body = isProduction
    ? `User-agent: *
Allow: /

Sitemap: ${new URL("sitemap-index.xml", site)}
`
    : `User-agent: *
Disallow: /
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
