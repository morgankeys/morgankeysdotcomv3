# Stacked modals and the scrollbar jump

A dialog sized to the viewport shifts sideways by about the width of a scrollbar when a
second modal opens or closes on top of it, and the page behind a modal slides sideways by
half a scrollbar as the modal opens and closes. Load this when a modal, lightbox, or zoom
view opens over another one and the one behind changes width, or when the page jumps as
any modal opens or closes.

## The symptom

The dialog underneath grows or shrinks by roughly 15px at the moment the top dialog opens
or closes. A card centered in that dialog jumps with it. Separately, centered page content
(the home page's `.page` column) moves about 7.5px right as a modal opens and back as it
closes. Overlay scrollbars (the usual macOS setting) hide both, because they take no layout
space. They show up when scroll bars are set to always show.

## Why it happens

Hiding the document's overflow removes its scrollbar, and the layout viewport gets wider by
that scrollbar. A dialog with `width: 100%` follows. Putting the scrollbar back narrows the
viewport again.

The jump shows up with two dialogs because each one locks and unlocks the page on its own.
Closing the top dialog unlocks the page even though the one behind is still open, so the
scrollbar returns. The next open hides it again, and the dialog behind grows.

The page behind moves for the same reason: once the scrollbar is gone, the page is wider,
so anything centered in it slides over by half the scrollbar.

## Rules

1. **Lock the page once, for the whole stack.** Hide `overflow` on `documentElement` and
   `body` when the first modal opens.
2. **Unlock only when the last modal closes.** On a `close` event, skip the dialog that is
   closing (it can still report `open` while the event fires) and leave the lock in place
   if any other `dialog` is open.
3. **Don't give each dialog its own lock and unlock.** Two copies drift, and the one that
   always unlocks is what causes the jump.
4. **Pad the root by the scrollbar's width while locked.** Measure
   `innerWidth - documentElement.clientWidth` before hiding overflow, and only on the
   first lock: once the scrollbar is hidden a second lock reads 0. The page keeps its
   width, and the dialogs, which are fixed to the viewport, still span all of it.
   `scrollbar-gutter: stable` also stops the page moving, but the backdrop doesn't cover
   the reserved gutter, so it leaves an undimmed strip down the right edge.

## Recipe

```js
function lockPageScroll() {
  const root = document.documentElement;
  if (root.style.overflow !== "hidden") {
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    if (scrollbarWidth > 0) root.style.paddingRight = `${scrollbarWidth}px`;
  }
  root.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function unlockPageScroll(closing) {
  const anotherOpen = [...document.querySelectorAll("dialog")].some(
    (dialog) => dialog !== closing && dialog.open,
  );
  if (anotherOpen) return;
  document.documentElement.style.overflow = "";
  document.documentElement.style.paddingRight = "";
  document.body.style.overflow = "";
}
```

Call `lockPageScroll` before `showModal()`. Call `unlockPageScroll(event.target)` from a
`close` listener.

## How to verify

With scroll bars set to always show, open a tall dialog, then open and close a second
dialog on top of it. The first dialog's width should stay the same across all three
states. Closing the last dialog should bring the page scrollbar back. The page's centered
content should not move as either dialog opens or closes.

Headless Chromium hides scrollbars, so an automated check measures a scrollbar of 0 and
can't see either jump. In Playwright, launch with
`ignoreDefaultArgs: ['--hide-scrollbars']`.

## Where this came from

The image zoom dialog unlocked the page every time it closed, including while a case study
was still open. The next click hid the scrollbar again and the study grew by about 15px.

Later, opening or closing any overlay nudged the home page sideways by half a scrollbar,
which rule 4 fixed in `src/scripts/page-scroll.ts`.
