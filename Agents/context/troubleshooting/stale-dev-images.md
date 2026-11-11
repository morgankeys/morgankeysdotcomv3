# Stale images on the dev server

## The symptom

You replace an image file and the local dev server keeps showing the old one. It
shows most often in a zoom or lightbox view, which loads the image later from
script. A hard refresh may not help. Production deploys show the new image.

It only happens when the new file keeps the old file's name and pixel size.
Rename it or change its size and the new image shows at once.

## Why it happens

The dev server's image optimizer builds each rendition's URL from the source
path, its size, and the output options. The file's contents are not part of it.
It serves those URLs with a long cache lifetime, like
`Cache-Control: public, max-age=31536000`. So a same-name, same-size replacement
produces the same URL, and the browser is entitled to reuse the copy it already
has for a year.

Production builds are not affected. They write each rendition to a filename that
includes a hash of the source contents, so a changed image always gets a new URL.

## Rules

- On the dev server only, serve optimized images with `Cache-Control: no-store`.
  Leave production caching alone; its hashed filenames already make it safe.
- If you can't change the server, rename the image when you replace it.

## Recipe

A dev-server middleware that rewrites the header on image-endpoint responses
(Vite/Connect style):

```js
server.middlewares.use((req, res, next) => {
  if (req.url?.startsWith("/_image")) {
    const setHeader = res.setHeader.bind(res);
    res.setHeader = (name, value) =>
      setHeader(
        name,
        name.toLowerCase() === "cache-control" ? "no-store" : value,
      );
  }
  next();
});
```

## Trade-offs to know about

The browser re-downloads optimized images on every dev page load. That is a
little slower locally, and it never affects a deploy.

## How to verify

```bash
curl -sI "http://127.0.0.1:4321/_image?href=…" | grep -i cache-control
# cache-control: no-store
```

Then replace an image with another of the same name and size, reload, and open
its zoom view. It should show the new image.

## Where this came from

A replaced case-study image in the AI Prototyping Kit draft kept showing its old
version in the zoom overlay. The fix is `devImageNoCache` in `Code/astro.config.mjs`.
