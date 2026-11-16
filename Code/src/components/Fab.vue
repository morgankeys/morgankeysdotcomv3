<script setup lang="ts">
/**
 * Fab.vue
 *
 * Dune "FAB" and "Extended FAB": the floating action button for a screen's one
 * primary action. Icon via the default slot. With `extended`, the `label`
 * shows beside the icon; otherwise it is only the accessible name.
 *
 * Sizes follow Dune: `sm` (56px, Dune "Default"/"Small"), `md` (80px), and
 * `lg` (96px). Colors are the six Dune roles: the three containers (the usual
 * choice) and the three solid roles for extra emphasis. The FAB rests at
 * elevation 3 and lifts to 4 on hover.
 *
 * Renders as static HTML in Astro pages; works reactively inside Vue islands.
 */

interface Props {
  label: string;
  as?: "button" | "a";
  href?: string | undefined;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg";
  color?:
    | "primary-container"
    | "secondary-container"
    | "tertiary-container"
    | "primary"
    | "secondary"
    | "tertiary";
  /** Show the label beside the icon (Dune "Extended FAB"). */
  extended?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
  href: undefined,
  type: "button",
  size: "sm",
  color: "primary-container",
  extended: false,
});

const isLink = props.as === "a";
</script>

<template>
  <component
    :is="as"
    class="fab"
    data-component="Fab"
    :data-size="size"
    :data-color="color"
    :data-extended="extended ? 'true' : undefined"
    :aria-label="extended ? undefined : label"
    :href="isLink ? href : undefined"
    :type="!isLink ? type : undefined"
  >
    <span class="fab__icon" aria-hidden="true">
      <slot />
    </span>
    <span v-if="extended" class="fab__label">{{ label }}</span>
  </component>
</template>

<style scoped>
.fab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
  overflow: hidden;
  border: none;
  box-shadow: var(--dune-sys-elevation-light-3-box-shadow);
  text-decoration: none;
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    border-radius 0.2s;
}

/* State layer */
.fab::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.fab:hover {
  box-shadow: var(--dune-sys-elevation-light-4-box-shadow);
}

.fab:hover::before,
.fab:focus-visible::before,
.fab:active::before {
  opacity: 1;
}

.fab:focus-visible {
  outline: var(--dune-sys-state-focus-indicator-thickness) solid
    var(--dune-sys-color-secondary);
  outline-offset: var(--dune-sys-state-focus-indicator-outer-offset);
}

.fab__icon,
.fab__label {
  position: relative;
}

.fab__icon {
  display: inline-flex;
}

.fab__icon > :deep(astro-static-slot),
.fab__icon > :deep(astro-slot) {
  display: contents;
}

.fab__icon :deep(svg) {
  display: block;
}

/* Sizes */
.fab[data-size="sm"] {
  min-width: 56px;
  height: 56px;
  border-radius: var(--dune-sys-shape-corner-large);
}

.fab[data-size="sm"] .fab__icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.fab[data-size="md"] {
  min-width: 80px;
  height: 80px;
  border-radius: var(--dune-sys-shape-corner-large-increased);
}

.fab[data-size="md"] .fab__icon :deep(svg) {
  width: 28px;
  height: 28px;
}

.fab[data-size="lg"] {
  min-width: 96px;
  height: 96px;
  border-radius: var(--dune-sys-shape-corner-extra-large);
}

.fab[data-size="lg"] .fab__icon :deep(svg) {
  width: 36px;
  height: 36px;
}

/*
 * Extended. Dune pads 16, 26, and 28px; the UI scale has no 26 or 28 step,
 * so md and lg snap to ui-xl (24px), as Button does for its odd values.
 */
.fab[data-extended][data-size="sm"] {
  gap: var(--dune-sys-spacing-ui-sm);
  padding-inline: var(--dune-sys-spacing-ui-lg);
}

.fab[data-extended][data-size="md"] {
  gap: var(--dune-sys-spacing-ui-md);
  padding-inline: var(--dune-sys-spacing-ui-xl);
}

.fab[data-extended][data-size="lg"] {
  gap: var(--dune-sys-spacing-ui-lg);
  padding-inline: var(--dune-sys-spacing-ui-xl);
}

.fab[data-size="sm"] .fab__label {
  font-family: var(--dune-sys-typescale-title-medium-font);
  font-size: var(--dune-sys-typescale-title-medium-size);
  font-weight: var(--dune-sys-typescale-title-medium-weight);
  line-height: var(--dune-sys-typescale-title-medium-line-height);
  letter-spacing: var(--dune-sys-typescale-title-medium-tracking);
}

.fab[data-size="md"] .fab__label {
  font-family: var(--dune-sys-typescale-title-large-font);
  font-size: var(--dune-sys-typescale-title-large-size);
  font-weight: var(--dune-sys-typescale-title-large-weight);
  line-height: var(--dune-sys-typescale-title-large-line-height);
  letter-spacing: var(--dune-sys-typescale-title-large-tracking);
}

.fab[data-size="lg"] .fab__label {
  font-family: var(--dune-sys-typescale-headline-small-font);
  font-size: var(--dune-sys-typescale-headline-small-size);
  font-weight: var(--dune-sys-typescale-headline-small-weight);
  line-height: var(--dune-sys-typescale-headline-small-line-height);
  letter-spacing: var(--dune-sys-typescale-headline-small-tracking);
}

/* Colors: container, content, and the matching state layers. */
.fab[data-color="primary-container"] {
  background-color: var(--dune-sys-color-primary-container);
  color: var(--dune-sys-color-on-primary-container);
}

.fab[data-color="primary-container"]::before {
  background-color: var(
    --dune-sys-color-state-layers-on-primary-container-opacity-08
  );
}

.fab[data-color="primary-container"]:active::before {
  background-color: var(
    --dune-sys-color-state-layers-on-primary-container-opacity-10
  );
}

.fab[data-color="secondary-container"] {
  background-color: var(--dune-sys-color-secondary-container);
  color: var(--dune-sys-color-on-secondary-container);
}

.fab[data-color="secondary-container"]::before {
  background-color: var(
    --dune-sys-color-state-layers-on-secondary-container-opacity-08
  );
}

.fab[data-color="secondary-container"]:active::before {
  background-color: var(
    --dune-sys-color-state-layers-on-secondary-container-opacity-10
  );
}

.fab[data-color="tertiary-container"] {
  background-color: var(--dune-sys-color-tertiary-container);
  color: var(--dune-sys-color-on-tertiary-container);
}

.fab[data-color="tertiary-container"]::before {
  background-color: var(
    --dune-sys-color-state-layers-on-tertiary-container-opacity-08
  );
}

.fab[data-color="tertiary-container"]:active::before {
  background-color: var(
    --dune-sys-color-state-layers-on-tertiary-container-opacity-10
  );
}

.fab[data-color="primary"] {
  background-color: var(--dune-sys-color-primary);
  color: var(--dune-sys-color-on-primary);
}

.fab[data-color="primary"]::before {
  background-color: var(--dune-sys-color-state-layers-on-primary-opacity-08);
}

.fab[data-color="primary"]:active::before {
  background-color: var(--dune-sys-color-state-layers-on-primary-opacity-10);
}

.fab[data-color="secondary"] {
  background-color: var(--dune-sys-color-secondary);
  color: var(--dune-sys-color-on-secondary);
}

.fab[data-color="secondary"]::before {
  background-color: var(--dune-sys-color-state-layers-on-secondary-opacity-08);
}

.fab[data-color="secondary"]:active::before {
  background-color: var(--dune-sys-color-state-layers-on-secondary-opacity-10);
}

.fab[data-color="tertiary"] {
  background-color: var(--dune-sys-color-tertiary);
  color: var(--dune-sys-color-on-tertiary);
}

.fab[data-color="tertiary"]::before {
  background-color: var(--dune-sys-color-state-layers-on-tertiary-opacity-08);
}

.fab[data-color="tertiary"]:active::before {
  background-color: var(--dune-sys-color-state-layers-on-tertiary-opacity-10);
}

@media (prefers-reduced-motion: reduce) {
  .fab,
  .fab::before {
    transition: none;
  }
}
</style>
