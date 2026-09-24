<script setup lang="ts">
/**
 * Button.vue
 *
 * M3 Expressive label button with style, size, and shape variants.
 * Renders as static HTML in Astro pages; works reactively inside Vue islands.
 */

interface Props {
  variant?: "filled" | "tonal" | "outlined" | "elevated" | "text";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "round" | "square";
  as?: "button" | "a";
  href?: string | undefined;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "filled",
  size: "sm",
  shape: "round",
  as: "button",
  href: undefined,
  type: "button",
  disabled: false,
});

const isLink = props.as === "a";
const linkHref = isLink && !props.disabled ? props.href : undefined;
</script>

<template>
  <component
    :is="as"
    class="button"
    data-component="Button"
    :data-variant="variant"
    :data-size="size"
    :data-shape="shape"
    :aria-disabled="disabled && isLink ? true : undefined"
    :disabled="disabled && !isLink ? true : undefined"
    :href="linkHref"
    :type="!isLink ? type : undefined"
  >
    <span class="button__state" aria-hidden="true">
      <span class="button__ripple" />
    </span>
    <span
      v-if="size === 'xs' || size === 'sm'"
      class="button__touch-target"
      aria-hidden="true"
    />
    <span class="button__content">
      <span v-if="$slots.icon" class="button__icon">
        <slot name="icon" />
      </span>
      <span class="button__label">
        <slot />
      </span>
    </span>
  </component>
</template>

<style scoped>
.button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0;
  border: none;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: border-radius 0.2s;
}

.button:disabled,
.button[aria-disabled="true"] {
  cursor: not-allowed;
}

.button__state {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.button__ripple {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  opacity: 0;
  border-radius: var(--md-sys-shape-corner-full);
  transition: opacity 375ms linear;
}

.button[data-ripple] .button__ripple {
  opacity: 1;
  transition-duration: 105ms;
}

.button__state::before,
.button__state::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.button__state::before {
  opacity: 0;
  transition: opacity 0.2s;
}

.button:hover:not(:disabled, [aria-disabled="true"]) .button__state::before {
  opacity: 1;
}

.button:focus-visible .button__state::before {
  opacity: 1;
}

.button:active:not(:disabled, [aria-disabled="true"]) .button__state::before {
  opacity: 1;
}

.button__state::after {
  opacity: 0;
  transition: opacity 375ms;
}

.button:active:not(:disabled, [aria-disabled="true"]) .button__state::after {
  opacity: 1;
  transition-duration: 0s;
}

.button[data-ripple]:active:not(:disabled, [aria-disabled="true"])
  .button__state::after {
  opacity: 0;
  transition-duration: 0s;
}

/* iOS Safari :active was not verified; no speculative touchstart listener. */

.button:focus-visible {
  outline: 3px solid var(--md-sys-color-secondary);
  outline-offset: 2px;
}

.button__touch-target {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  min-height: 48px;
  transform: translateY(-50%);
}

.button__content {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.button__icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.button__icon > :deep(astro-static-slot),
.button__icon > :deep(astro-slot) {
  display: contents;
}

.button__icon :deep(svg) {
  display: block;
  color: inherit;
}

.button__label {
  white-space: nowrap;
}

/* Sizes */
.button[data-size="xs"] {
  height: 32px;
  padding-inline: var(--md-sys-spacing-ui-md);
  gap: var(--md-sys-spacing-ui-xs);
}

.button[data-size="xs"] .button__content {
  gap: var(--md-sys-spacing-ui-xs);
}

.button[data-size="xs"] .button__icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.button[data-size="xs"] .button__label {
  font-family: var(--md-sys-typescale-label-large-font);
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
  line-height: var(--md-sys-typescale-label-large-line-height);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
}

.button[data-size="sm"] {
  height: 40px;
  padding-inline: var(--md-sys-spacing-ui-lg);
  gap: var(--md-sys-spacing-ui-sm);
}

.button[data-size="sm"] .button__content {
  gap: var(--md-sys-spacing-ui-sm);
}

.button[data-size="sm"] .button__icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.button[data-size="sm"] .button__label {
  font-family: var(--md-sys-typescale-label-large-font);
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
  line-height: var(--md-sys-typescale-label-large-line-height);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
}

.button[data-size="md"] {
  height: 56px;
  padding-inline: var(--md-sys-spacing-ui-xl);
  gap: var(--md-sys-spacing-ui-sm);
}

.button[data-size="md"] .button__content {
  gap: var(--md-sys-spacing-ui-sm);
}

.button[data-size="md"] .button__icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.button[data-size="md"] .button__label {
  font-family: var(--md-sys-typescale-title-medium-font);
  font-size: var(--md-sys-typescale-title-medium-size);
  font-weight: var(--md-sys-typescale-title-medium-weight);
  line-height: var(--md-sys-typescale-title-medium-line-height);
  letter-spacing: var(--md-sys-typescale-title-medium-tracking);
}

.button[data-size="lg"] {
  height: 96px;
  padding-inline: var(--md-sys-spacing-ui-3xl);
  gap: var(--md-sys-spacing-ui-md);
}

.button[data-size="lg"] .button__content {
  gap: var(--md-sys-spacing-ui-md);
}

.button[data-size="lg"] .button__icon :deep(svg) {
  width: 32px;
  height: 32px;
}

.button[data-size="lg"] .button__label {
  font-family: var(--md-sys-typescale-headline-small-font);
  font-size: var(--md-sys-typescale-headline-small-size);
  font-weight: var(--md-sys-typescale-headline-small-weight);
  line-height: var(--md-sys-typescale-headline-small-line-height);
  letter-spacing: var(--md-sys-typescale-headline-small-tracking);
}

.button[data-size="xl"] {
  height: 136px;
  padding-inline: var(--md-sys-spacing-ui-4xl);
  gap: var(--md-sys-spacing-ui-lg);
}

.button[data-size="xl"] .button__content {
  gap: var(--md-sys-spacing-ui-lg);
}

.button[data-size="xl"] .button__icon :deep(svg) {
  width: 40px;
  height: 40px;
}

.button[data-size="xl"] .button__label {
  font-family: var(--md-sys-typescale-headline-large-font);
  font-size: var(--md-sys-typescale-headline-large-size);
  font-weight: var(--md-sys-typescale-headline-large-weight);
  line-height: var(--md-sys-typescale-headline-large-line-height);
  letter-spacing: var(--md-sys-typescale-headline-large-tracking);
}

/* Shape: round */
.button[data-shape="round"] {
  border-radius: var(--md-sys-shape-corner-full);
}

/* Shape: square */
.button[data-shape="square"][data-size="xs"],
.button[data-shape="square"][data-size="sm"] {
  border-radius: var(--md-sys-shape-corner-medium);
}

.button[data-shape="square"][data-size="md"] {
  border-radius: var(--md-sys-shape-corner-large);
}

.button[data-shape="square"][data-size="lg"],
.button[data-shape="square"][data-size="xl"] {
  border-radius: var(--md-sys-shape-corner-extra-large);
}

/* Pressed shape morph */
.button:active:not(:disabled, [aria-disabled="true"])[data-size="xs"],
.button:active:not(:disabled, [aria-disabled="true"])[data-size="sm"] {
  border-radius: var(--md-sys-shape-corner-small);
}

.button:active:not(:disabled, [aria-disabled="true"])[data-size="md"] {
  border-radius: var(--md-sys-shape-corner-medium);
}

.button:active:not(:disabled, [aria-disabled="true"])[data-size="lg"],
.button:active:not(:disabled, [aria-disabled="true"])[data-size="xl"] {
  border-radius: var(--md-sys-shape-corner-large);
}

@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;
  }

  .button__ripple {
    display: none;
  }
}

@media (forced-colors: active) {
  .button__ripple {
    display: none;
  }
}

/* Variant: filled */
.button[data-variant="filled"] {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.button[data-variant="filled"] .button__state::before,
.button[data-variant="filled"] .button__state::after {
  background-color: var(--md-sys-color-state-layers-on-primary-opacity-08);
}

.button[data-variant="filled"] .button__ripple {
  background-color: var(--md-sys-color-state-layers-on-primary-opacity-10);
}

.button[data-variant="filled"]:focus-visible .button__state::before,
.button[data-variant="filled"]:active:not(:disabled, [aria-disabled="true"])
  .button__state::before,
.button[data-variant="filled"]:active:not(:disabled, [aria-disabled="true"])
  .button__state::after {
  background-color: var(--md-sys-color-state-layers-on-primary-opacity-10);
}

/* Variant: tonal */
.button[data-variant="tonal"] {
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-secondary-container);
}

.button[data-variant="tonal"] .button__state::before,
.button[data-variant="tonal"] .button__state::after {
  background-color: var(
    --md-sys-color-state-layers-on-secondary-container-opacity-08
  );
}

.button[data-variant="tonal"] .button__ripple {
  background-color: var(
    --md-sys-color-state-layers-on-secondary-container-opacity-10
  );
}

.button[data-variant="tonal"]:focus-visible .button__state::before,
.button[data-variant="tonal"]:active:not(:disabled, [aria-disabled="true"])
  .button__state::before,
.button[data-variant="tonal"]:active:not(:disabled, [aria-disabled="true"])
  .button__state::after {
  background-color: var(
    --md-sys-color-state-layers-on-secondary-container-opacity-10
  );
}

/* Variant: outlined */
.button[data-variant="outlined"] {
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
}

.button[data-variant="outlined"][data-size="lg"],
.button[data-variant="outlined"][data-size="xl"] {
  border-width: 2px;
}

.button[data-variant="outlined"] .button__state::before,
.button[data-variant="outlined"] .button__state::after {
  background-color: var(
    --md-sys-color-state-layers-on-surface-variant-opacity-08
  );
}

.button[data-variant="outlined"] .button__ripple {
  background-color: var(
    --md-sys-color-state-layers-on-surface-variant-opacity-10
  );
}

.button[data-variant="outlined"]:focus-visible .button__state::before,
.button[data-variant="outlined"]:active:not(:disabled, [aria-disabled="true"])
  .button__state::before,
.button[data-variant="outlined"]:active:not(:disabled, [aria-disabled="true"])
  .button__state::after {
  background-color: var(
    --md-sys-color-state-layers-on-surface-variant-opacity-10
  );
}

/* Variant: elevated */
.button[data-variant="elevated"] {
  background-color: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-primary);
}

.button[data-variant="elevated"][data-size="xs"],
.button[data-variant="elevated"][data-size="sm"] {
  box-shadow: var(--md-sys-elevation-light-1-box-shadow);
}

.button[data-variant="elevated"][data-size="md"] {
  box-shadow: var(--md-sys-elevation-light-2-box-shadow);
}

.button[data-variant="elevated"][data-size="lg"],
.button[data-variant="elevated"][data-size="xl"] {
  box-shadow: var(--md-sys-elevation-light-3-box-shadow);
}

.button[data-variant="elevated"] .button__state::before,
.button[data-variant="elevated"] .button__state::after {
  background-color: var(--md-sys-color-state-layers-primary-opacity-08);
}

.button[data-variant="elevated"] .button__ripple {
  background-color: var(--md-sys-color-state-layers-primary-opacity-10);
}

.button[data-variant="elevated"]:focus-visible .button__state::before,
.button[data-variant="elevated"]:active:not(:disabled, [aria-disabled="true"])
  .button__state::before,
.button[data-variant="elevated"]:active:not(:disabled, [aria-disabled="true"])
  .button__state::after {
  background-color: var(--md-sys-color-state-layers-primary-opacity-10);
}

/* Variant: text */
.button[data-variant="text"] {
  background-color: transparent;
  color: var(--md-sys-color-primary);
}

.button[data-variant="text"] .button__state::before,
.button[data-variant="text"] .button__state::after {
  background-color: var(--md-sys-color-state-layers-primary-opacity-08);
}

.button[data-variant="text"] .button__ripple {
  background-color: var(--md-sys-color-state-layers-primary-opacity-10);
}

.button[data-variant="text"]:focus-visible .button__state::before,
.button[data-variant="text"]:active:not(:disabled, [aria-disabled="true"])
  .button__state::before,
.button[data-variant="text"]:active:not(:disabled, [aria-disabled="true"])
  .button__state::after {
  background-color: var(--md-sys-color-state-layers-primary-opacity-10);
}

/* Disabled */
.button:disabled .button__state::before,
.button:disabled .button__state::after,
.button:disabled .button__ripple,
.button[aria-disabled="true"] .button__state::before,
.button[aria-disabled="true"] .button__state::after,
.button[aria-disabled="true"] .button__ripple {
  opacity: 0;
}

.button:disabled[data-variant="filled"],
.button:disabled[data-variant="tonal"],
.button:disabled[data-variant="elevated"],
.button:disabled[data-variant="outlined"],
.button[aria-disabled="true"][data-variant="filled"],
.button[aria-disabled="true"][data-variant="tonal"],
.button[aria-disabled="true"][data-variant="elevated"],
.button[aria-disabled="true"][data-variant="outlined"] {
  background-color: var(--md-sys-color-state-layers-on-surface-opacity-10);
}

.button:disabled[data-variant="elevated"],
.button[aria-disabled="true"][data-variant="elevated"] {
  box-shadow: none;
}

.button:disabled .button__content,
.button[aria-disabled="true"] .button__content {
  color: var(--md-sys-color-on-surface);
  opacity: 0.38;
}
</style>
