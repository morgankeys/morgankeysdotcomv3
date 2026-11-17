<script setup lang="ts">
/**
 * Tooltip.vue
 *
 * Dune "Plain tooltip": a small inverse-surface label under its trigger. Wrap
 * the trigger in the default slot and pass `text`. It shows after a short
 * delay on hover and at once on keyboard focus, and Escape hides it until the
 * pointer or focus leaves (WCAG 1.4.13).
 *
 * The tooltip repeats the trigger's accessible name (an icon button's
 * `label`), so it is hidden from assistive tech rather than wired up with
 * `aria-describedby`; screen readers already hear the name. Don't put
 * information in a tooltip that the trigger doesn't already carry.
 *
 * `align` keeps it on screen near a page edge: `center` (default) centers it
 * on the trigger, `start` and `end` line it up with that edge.
 */

import { ref, onBeforeUnmount } from "vue";

withDefaults(
  defineProps<{ text: string; align?: "center" | "start" | "end" }>(),
  {
    align: "center",
  },
);

const dismissed = ref(false);
const hovered = ref(false);
const focused = ref(false);

/*
 * A hovered trigger usually doesn't have focus, so Escape is heard on the
 * document while the pointer or focus is inside, not on the wrapper.
 */
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") dismissed.value = true;
}

function sync() {
  const active = hovered.value || focused.value;
  if (active) {
    document.addEventListener("keydown", onKeydown);
  } else {
    document.removeEventListener("keydown", onKeydown);
    dismissed.value = false;
  }
}

function setHovered(value: boolean) {
  hovered.value = value;
  sync();
}

function setFocused(value: boolean) {
  focused.value = value;
  sync();
}

onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));
</script>

<template>
  <span
    class="tooltip"
    data-component="Tooltip"
    :data-align="align"
    :data-dismissed="dismissed ? 'true' : undefined"
    @pointerenter="setHovered(true)"
    @pointerleave="setHovered(false)"
    @focusin="setFocused(true)"
    @focusout="setFocused(false)"
  >
    <slot />
    <span class="tooltip__label" aria-hidden="true">{{ text }}</span>
  </span>
</template>

<style scoped>
.tooltip {
  position: relative;
  display: inline-flex;
}

.tooltip__label {
  position: absolute;
  top: 100%;
  z-index: 20;
  max-width: 200px;
  margin-top: var(--dune-sys-spacing-ui-xs);
  padding: var(--dune-sys-spacing-ui-xs) var(--dune-sys-spacing-ui-sm);
  border-radius: var(--dune-sys-shape-corner-extra-small);
  background-color: var(--dune-sys-color-inverse-surface);
  color: var(--dune-sys-color-inverse-on-surface);
  font-family: var(--dune-sys-typescale-body-small-font);
  font-size: var(--dune-sys-typescale-body-small-size);
  font-weight: var(--dune-sys-typescale-body-small-weight);
  line-height: var(--dune-sys-typescale-body-small-line-height);
  letter-spacing: var(--dune-sys-typescale-body-small-tracking);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;

  /* Hide at once; the show rule below adds the hover delay. */
  transition:
    opacity 0.1s ease,
    visibility 0.1s;
}

.tooltip[data-align="center"] .tooltip__label {
  left: 50%;
  translate: -50% 0;
}

.tooltip[data-align="start"] .tooltip__label {
  left: 0;
}

.tooltip[data-align="end"] .tooltip__label {
  right: 0;
}

.tooltip:hover .tooltip__label {
  opacity: 1;
  visibility: visible;
  transition-delay: 0.5s;
}

.tooltip:has(:focus-visible) .tooltip__label {
  opacity: 1;
  visibility: visible;
  transition-delay: 0s;
}

.tooltip[data-dismissed] .tooltip__label {
  opacity: 0;
  visibility: hidden;
  transition-delay: 0s;
}

@media (prefers-reduced-motion: reduce) {
  .tooltip__label {
    transition: none;
  }
}
</style>
