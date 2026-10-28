# Stacked modals and the scrollbar jump

A dialog sized to the viewport shifts sideways by about the width of a scrollbar when a
second modal opens or closes on top of it. Load this when a modal, lightbox, or zoom view
opens over another one and the one behind changes width.

## The symptom

The dialog underneath grows or shrinks by roughly 15px at the moment the top dialog opens
or closes. A card centered in that dialog jumps with it. Overlay scrollbars (the usual
macOS setting) hide the effect, because they take no layout space. It shows up when scroll
bars are set to always show.

## Why it happens

Hiding the document's overflow removes its scrollbar, and the layout viewport gets wider by
that scrollbar. A dialog with `width: 100%` follows. Putting the scrollbar back narrows the
viewport again.

The jump shows up with two dialogs because each one locks and unlocks the page on its own.
Closing the top dialog unlocks the page even though the one behind is still open, so the
scrollbar returns. The next open hides it again, and the dialog behind grows.

## Rules

1. **Lock the page once, for the whole stack.** Hide `overflow` on `documentElement` and
   `body` when the first modal opens.
2. **Unlock only when the last modal closes.** On a `close` event, skip the dialog that is
   closing (it can still report `open` while the event fires) and leave the lock in place
   if any other `dialog` is open.
3. **Don't give each dialog its own lock and unlock.** Two copies drift, and the one that
   always unlocks is what causes the jump.

## Recipe

```js
function lockPageScroll() {
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function unlockPageScroll(closing) {
  const anotherOpen = [...document.querySelectorAll("dialog")].some(
    (dialog) => dialog !== closing && dialog.open,
  );
  if (anotherOpen) return;
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}
```

Call `lockPageScroll` before `showModal()`. Call `unlockPageScroll(event.target)` from a
`close` listener.

## How to verify

With scroll bars set to always show, open a tall dialog, then open and close a second
dialog on top of it. The first dialog's width should stay the same across all three
states. Closing the last dialog should bring the page scrollbar back.

## Where this came from

The image zoom dialog unlocked the page every time it closed, including while a case study
was still open. The next click hid the scrollbar again and the study grew by about 15px.
