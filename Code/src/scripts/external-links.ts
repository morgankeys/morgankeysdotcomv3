/**
 * external-links.ts
 *
 * Opens http(s) links that leave this site in a new tab. Same-origin paths,
 * in-page hashes, and mailto/tel links stay in the current tab.
 *
 * Marks anchors already in the document, watches for ones Vue islands add
 * later, and sets the target during the click so a hydration pass cannot
 * navigate away in the same tab.
 */

function isExternal(anchor: HTMLAnchorElement): boolean {
  if (anchor.hasAttribute("download")) return false;

  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  return url.origin !== window.location.origin;
}

function mark(anchor: HTMLAnchorElement): void {
  if (!isExternal(anchor)) return;
  anchor.target = "_blank";
  const rel = new Set(anchor.rel.split(/\s+/).filter(Boolean));
  rel.add("noopener");
  rel.add("noreferrer");
  anchor.rel = [...rel].join(" ");
}

function markAll(root: ParentNode): void {
  root.querySelectorAll("a[href]").forEach((node) => {
    if (node instanceof HTMLAnchorElement) mark(node);
  });
}

markAll(document);

const observer = new MutationObserver((records) => {
  for (const record of records) {
    record.addedNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node instanceof HTMLAnchorElement) mark(node);
      markAll(node);
    });
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener(
  "click",
  (event) => {
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest("a");
    if (anchor instanceof HTMLAnchorElement) mark(anchor);
  },
  true,
);
