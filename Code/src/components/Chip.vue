<script setup lang="ts">
/**
 * Chip.vue
 *
 * Dune chips: `assist` (Assistive chip) and `filter` (Filter chip), outlined or
 * `elevated`. 32px tall with an 8px corner and label-large text.
 *
 * - `as="span"` (the default) is a static label, like a case study's tags. It
 *   has no hover, press, or focus states.
 * - `as="button"` or `as="a"` makes it interactive: Dune's state layer on
 *   hover and press, and the focus indicator on keyboard focus.
 * - `filter` chips are toggles: pass `selected` and the chip fills with
 *   secondary-container, shows a check mark, and reports `aria-pressed`. The
 *   parent owns `selected`.
 *
 * A leading icon goes in the `icon` slot (18px); a selected filter chip shows
 * the check mark in its place.
 */

interface Props {
  variant?: "assist" | "filter";
  as?: "span" | "button" | "a";
  href?: string | undefined;
  elevated?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "assist",
  as: "span",
  href: undefined,
  elevated: false,
  selected: false,
  disabled: false,
});

const interactive = props.as !== "span";
const isLink = props.as === "a";
const isToggle = props.variant === "filter" && props.as === "button";
</script>

<template>
  <component
    :is="as"
    class="chip"
    data-component="Chip"
    :data-variant="variant"
    :data-elevated="elevated ? 'true' : undefined"
    :data-selected="variant === 'filter' && selected ? 'true' : undefined"
    :data-interactive="interactive ? 'true' : undefined"
    :type="as === 'button' ? 'button' : undefined"
    :href="isLink && !disabled ? href : undefined"
    :disabled="as === 'button' && disabled ? true : undefined"
    :aria-disabled="isLink && disabled ? true : undefined"
    :aria-pressed="isToggle ? selected : undefined"
  >
    <span
      v-if="variant === 'filter' && selected"
      class="chip__icon"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.55 18 3.85 12.3l1.43-1.43 4.27 4.28 9.17-9.18 1.43 1.43z" />
      </svg>
    </span>
    <span v-else-if="$slots.icon" class="chip__icon" aria-hidden="true">
      <slot name="icon" />
    </span>
    <span class="chip__label"><slot /></span>
  </component>
</template>

<style scoped>
.chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--dune-sys-spacing-ui-sm);
  height: 32px;
  padding-inline: var(--dune-sys-spacing-ui-lg);
  overflow: hidden;
  border: 1px solid var(--dune-sys-color-outline-variant);
  border-radius: var(--dune-sys-shape-corner-small);
  background-color: transparent;
  color: var(--dune-sys-color-on-surface);
  font-family: var(--dune-sys-typescale-label-large-font);
  font-size: var(--dune-sys-typescale-label-large-size);
  font-weight: var(--dune-sys-typescale-label-large-weight);
  line-height: var(--dune-sys-typescale-label-large-line-height);
  letter-spacing: var(--dune-sys-typescale-label-large-tracking);
  text-decoration: none;
  white-space: nowrap;
}

/* A leading icon or check mark tightens the start padding to 8px. */
.chip:has(.chip__icon) {
  padding-inline-start: var(--dune-sys-spacing-ui-sm);
}

.chip[data-variant="filter"] {
  color: var(--dune-sys-color-on-surface-variant);
}

.chip[data-elevated] {
  border-color: transparent;
  background-color: var(--dune-sys-color-surface-container-low);
  box-shadow: var(--dune-sys-elevation-light-1-box-shadow);
}

.chip[data-selected] {
  border-color: transparent;
  background-color: var(--dune-sys-color-secondary-container);
  color: var(--dune-sys-color-on-secondary-container);
}

.chip__icon {
  position: relative;
  display: inline-flex;
  color: var(--dune-sys-color-primary);
}

.chip[data-selected] .chip__icon {
  color: inherit;
}

.chip__icon > :deep(astro-static-slot),
.chip__icon > :deep(astro-slot) {
  display: contents;
}

.chip__icon :deep(svg) {
  display: block;
  width: 18px;
  height: 18px;
}

.chip__label {
  position: relative;
}

/* ---- Interactive: state layer and focus indicator ---------------------- */

.chip[data-interactive] {
  cursor: pointer;
}

.chip[data-interactive]::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--dune-sys-color-state-layers-on-surface-opacity-08);
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.chip[data-interactive]:hover::before {
  opacity: 1;
}

.chip[data-interactive]:focus-visible::before,
.chip[data-interactive]:active::before {
  background-color: var(--dune-sys-color-state-layers-on-surface-opacity-10);
  opacity: 1;
}

.chip[data-variant="filter"][data-interactive]::before {
  background-color: var(
    --dune-sys-color-state-layers-on-surface-variant-opacity-08
  );
}

.chip[data-variant="filter"][data-interactive]:focus-visible::before,
.chip[data-variant="filter"][data-interactive]:active::before {
  background-color: var(
    --dune-sys-color-state-layers-on-surface-variant-opacity-10
  );
}

.chip[data-selected][data-interactive]::before {
  background-color: var(
    --dune-sys-color-state-layers-on-secondary-container-opacity-08
  );
}

.chip[data-selected][data-interactive]:focus-visible::before,
.chip[data-selected][data-interactive]:active::before {
  background-color: var(
    --dune-sys-color-state-layers-on-secondary-container-opacity-10
  );
}

.chip[data-interactive]:focus-visible {
  outline: var(--dune-sys-state-focus-indicator-thickness) solid
    var(--dune-sys-color-secondary);
  outline-offset: var(--dune-sys-state-focus-indicator-outer-offset);
}

/* ---- Disabled ---------------------------------------------------------- */

.chip:disabled,
.chip[aria-disabled="true"] {
  border-color: var(--dune-sys-color-state-layers-on-surface-opacity-10);
  background-color: transparent;
  box-shadow: none;
  color: var(--dune-sys-color-on-surface);
  cursor: not-allowed;
}

.chip:disabled > *,
.chip[aria-disabled="true"] > * {
  opacity: 0.38;
}

.chip[data-interactive]:is(:disabled, [aria-disabled="true"])::before {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .chip::before {
    transition: none;
  }
}
</style>
