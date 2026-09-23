<script setup lang="ts">
/**
 * IconButton.vue
 *
 * M3 Expressive icon button with style, size, shape, and width variants.
 * Renders as static HTML in Astro pages; works reactively inside Vue islands.
 */

interface Props {
  label: string;
  as?: "button" | "a";
  href?: string | undefined;
  type?: "button" | "submit" | "reset";
  variant?: "filled" | "tonal" | "outlined" | "standard";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "round" | "square";
  width?: "narrow" | "default" | "wide";
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
  href: undefined,
  type: "button",
  variant: "tonal",
  size: "sm",
  shape: "round",
  width: "default",
  disabled: false,
});

const isLink = props.as === "a";
const linkHref = isLink && !props.disabled ? props.href : undefined;
</script>

<template>
  <component
    :is="as"
    class="icon-button"
    data-component="IconButton"
    :data-variant="variant"
    :data-size="size"
    :data-shape="shape"
    :data-width="width"
    :aria-label="label"
    :aria-disabled="disabled && isLink ? true : undefined"
    :disabled="disabled && !isLink ? true : undefined"
    :href="linkHref"
    :type="!isLink ? type : undefined"
  >
    <span class="icon-button__container">
      <slot />
    </span>
  </component>
</template>

<style scoped>
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 48px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  text-decoration: none;
}

.icon-button:disabled,
.icon-button[aria-disabled="true"] {
  cursor: not-allowed;
}

.icon-button__container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  transition: border-radius 0.2s;
}

.icon-button__container::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.icon-button:hover:not(:disabled, [aria-disabled="true"])
  .icon-button__container::before {
  opacity: 1;
}

.icon-button:focus-visible .icon-button__container::before {
  opacity: 1;
}

.icon-button:active:not(:disabled, [aria-disabled="true"])
  .icon-button__container::before {
  opacity: 1;
}

.icon-button:focus-visible .icon-button__container {
  outline: 3px solid var(--md-sys-color-secondary);
  outline-offset: 2px;
}

.icon-button__container > :deep(astro-static-slot),
.icon-button__container > :deep(astro-slot) {
  display: contents;
}

.icon-button__container :deep(svg) {
  display: block;
  color: inherit;
}

/* Sizes (default width) */
.icon-button[data-size="xs"] .icon-button__container {
  height: 32px;
  width: 32px;
}

.icon-button[data-size="xs"] .icon-button__container :deep(svg) {
  width: 20px;
  height: 20px;
}

.icon-button[data-size="sm"] .icon-button__container {
  height: 40px;
  width: 40px;
}

.icon-button[data-size="sm"] .icon-button__container :deep(svg) {
  width: 24px;
  height: 24px;
}

.icon-button[data-size="md"] .icon-button__container {
  height: 56px;
  width: 56px;
}

.icon-button[data-size="md"] .icon-button__container :deep(svg) {
  width: 24px;
  height: 24px;
}

.icon-button[data-size="lg"] .icon-button__container {
  height: 96px;
  width: 96px;
}

.icon-button[data-size="lg"] .icon-button__container :deep(svg) {
  width: 32px;
  height: 32px;
}

.icon-button[data-size="xl"] .icon-button__container {
  height: 136px;
  width: 136px;
}

.icon-button[data-size="xl"] .icon-button__container :deep(svg) {
  width: 40px;
  height: 40px;
}

/* Width overrides */
.icon-button[data-size="xs"][data-width="narrow"] .icon-button__container {
  width: 28px;
}

.icon-button[data-size="xs"][data-width="wide"] .icon-button__container {
  width: 40px;
}

.icon-button[data-size="sm"][data-width="narrow"] .icon-button__container {
  width: 32px;
}

.icon-button[data-size="sm"][data-width="wide"] .icon-button__container {
  width: 52px;
}

.icon-button[data-size="md"][data-width="narrow"] .icon-button__container {
  width: 48px;
}

.icon-button[data-size="md"][data-width="wide"] .icon-button__container {
  width: 72px;
}

.icon-button[data-size="lg"][data-width="narrow"] .icon-button__container {
  width: 64px;
}

.icon-button[data-size="lg"][data-width="wide"] .icon-button__container {
  width: 128px;
}

.icon-button[data-size="xl"][data-width="narrow"] .icon-button__container {
  width: 104px;
}

.icon-button[data-size="xl"][data-width="wide"] .icon-button__container {
  width: 184px;
}

/* Shape: round */
.icon-button[data-shape="round"] .icon-button__container {
  border-radius: var(--md-sys-shape-corner-full);
}

/* Shape: square */
.icon-button[data-shape="square"][data-size="xs"] .icon-button__container,
.icon-button[data-shape="square"][data-size="sm"] .icon-button__container {
  border-radius: var(--md-sys-shape-corner-medium);
}

.icon-button[data-shape="square"][data-size="md"] .icon-button__container {
  border-radius: var(--md-sys-shape-corner-large);
}

.icon-button[data-shape="square"][data-size="lg"] .icon-button__container,
.icon-button[data-shape="square"][data-size="xl"] .icon-button__container {
  border-radius: var(--md-sys-shape-corner-extra-large);
}

/* Pressed shape morph */
.icon-button:active:not(:disabled, [aria-disabled="true"])[data-size="xs"]
  .icon-button__container,
.icon-button:active:not(:disabled, [aria-disabled="true"])[data-size="sm"]
  .icon-button__container {
  border-radius: var(--md-sys-shape-corner-small);
}

.icon-button:active:not(:disabled, [aria-disabled="true"])[data-size="md"]
  .icon-button__container {
  border-radius: var(--md-sys-shape-corner-medium);
}

.icon-button:active:not(:disabled, [aria-disabled="true"])[data-size="lg"]
  .icon-button__container,
.icon-button:active:not(:disabled, [aria-disabled="true"])[data-size="xl"]
  .icon-button__container {
  border-radius: var(--md-sys-shape-corner-large);
}

/* Variant: filled */
.icon-button[data-variant="filled"] .icon-button__container {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.icon-button[data-variant="filled"] .icon-button__container::before {
  background-color: var(--md-sys-color-state-layers-on-primary-opacity-08);
}

.icon-button[data-variant="filled"]:focus-visible .icon-button__container::before,
.icon-button[data-variant="filled"]:active:not(:disabled, [aria-disabled="true"])
  .icon-button__container::before {
  background-color: var(--md-sys-color-state-layers-on-primary-opacity-10);
}

/* Variant: tonal */
.icon-button[data-variant="tonal"] .icon-button__container {
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-secondary-container);
}

.icon-button[data-variant="tonal"] .icon-button__container::before {
  background-color: var(
    --md-sys-color-state-layers-on-secondary-container-opacity-08
  );
}

.icon-button[data-variant="tonal"]:focus-visible .icon-button__container::before,
.icon-button[data-variant="tonal"]:active:not(:disabled, [aria-disabled="true"])
  .icon-button__container::before {
  background-color: var(
    --md-sys-color-state-layers-on-secondary-container-opacity-10
  );
}

/* Variant: outlined */
.icon-button[data-variant="outlined"] .icon-button__container {
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
}

.icon-button[data-variant="outlined"] .icon-button__container::before {
  background-color: var(
    --md-sys-color-state-layers-on-surface-variant-opacity-08
  );
}

.icon-button[data-variant="outlined"]:focus-visible .icon-button__container::before,
.icon-button[data-variant="outlined"]:active:not(:disabled, [aria-disabled="true"])
  .icon-button__container::before {
  background-color: var(
    --md-sys-color-state-layers-on-surface-variant-opacity-10
  );
}

/* Variant: standard */
.icon-button[data-variant="standard"] .icon-button__container {
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
}

.icon-button[data-variant="standard"] .icon-button__container::before {
  background-color: var(
    --md-sys-color-state-layers-on-surface-variant-opacity-08
  );
}

.icon-button[data-variant="standard"]:focus-visible .icon-button__container::before,
.icon-button[data-variant="standard"]:active:not(:disabled, [aria-disabled="true"])
  .icon-button__container::before {
  background-color: var(
    --md-sys-color-state-layers-on-surface-variant-opacity-10
  );
}

/* Disabled */
.icon-button:disabled .icon-button__container::before,
.icon-button[aria-disabled="true"] .icon-button__container::before {
  opacity: 0;
}

.icon-button:disabled[data-variant="filled"] .icon-button__container,
.icon-button:disabled[data-variant="tonal"] .icon-button__container,
.icon-button[aria-disabled="true"][data-variant="filled"] .icon-button__container,
.icon-button[aria-disabled="true"][data-variant="tonal"] .icon-button__container {
  background-color: var(--md-sys-color-state-layers-on-surface-opacity-10);
}

.icon-button:disabled .icon-button__container :deep(svg),
.icon-button[aria-disabled="true"] .icon-button__container :deep(svg) {
  color: var(--md-sys-color-on-surface);
  opacity: 0.38;
}
</style>
