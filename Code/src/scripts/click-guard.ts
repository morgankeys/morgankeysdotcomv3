/**
 * click-guard.ts
 *
 * Stops a double-click that dismisses an overlay from also acting on the page
 * underneath. The first click closes the overlay; without this, the second
 * lands on whatever is now under the pointer: a carousel card opens another
 * case study, or the case study behind a zoomed image closes too.
 *
 * Call `swallowFollowUpClicks()` right after a click closes an overlay. Later
 * clicks in that same multi-click (`event.detail > 1`) are cancelled in the
 * capture phase, before any other handler or link sees them. The first click
 * that starts a new sequence, or a keyboard activation (`detail` 0), disarms
 * the guard and goes through as normal.
 */

let armed = false;

export function swallowFollowUpClicks(): void {
  armed = true;
}

window.addEventListener(
  "click",
  (event) => {
    if (!armed) return;
    if (event.detail > 1) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    armed = false;
  },
  true,
);
