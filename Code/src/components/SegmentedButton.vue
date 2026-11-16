<script setup lang="ts">
/**
 * SegmentedButton.vue
 *
 * Dune "Segmented button", single-select: a row of 2–5 outlined segments where
 * exactly one is selected. The selected segment fills with secondary-container
 * and, when it shows a label, swaps its icon for a check mark.
 *
 * It is a radio group, not a row of toggles: the group is one tab stop, and
 * the arrow keys, Home, and End move the selection, as with native radios.
 * Use it inside a Vue island with `v-model`; the parent owns the value.
 *
 * Icons come from the scoped `icon` slot, which receives `{ value, selected }`,
 * so the parent can draw a different glyph per option. With `iconOnly`, labels
 * become each segment's accessible name and native tooltip.
 */

import { ref } from "vue";

export interface SegmentedOption {
  value: string;
  label: string;
}

interface Props {
  /** Accessible name for the group. */
  label: string;
  options: SegmentedOption[];
  modelValue: string;
  /** Hide labels; segments show only their icon. */
  iconOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  iconOnly: false,
});

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const segments = ref<HTMLButtonElement[]>([]);

function select(index: number, focus = false) {
  const option = props.options[index];
  if (!option) return;
  if (option.value !== props.modelValue) {
    emit("update:modelValue", option.value);
  }
  if (focus) segments.value[index]?.focus();
}

function onKeydown(event: KeyboardEvent, index: number) {
  const last = props.options.length - 1;
  const next: Record<string, number> = {
    ArrowRight: index === last ? 0 : index + 1,
    ArrowDown: index === last ? 0 : index + 1,
    ArrowLeft: index === 0 ? last : index - 1,
    ArrowUp: index === 0 ? last : index - 1,
    Home: 0,
    End: last,
  };
  if (!(event.key in next)) return;
  event.preventDefault();
  select(next[event.key], true);
}

/** The selected segment is the group's tab stop; with none, the first is. */
function tabIndexFor(value: string, index: number) {
  const hasSelection = props.options.some((o) => o.value === props.modelValue);
  if (value === props.modelValue || (!hasSelection && index === 0)) return 0;
  return -1;
}
</script>

<template>
  <div
    class="segmented-button"
    data-component="SegmentedButton"
    role="radiogroup"
    :aria-label="label"
    :data-icon-only="iconOnly ? 'true' : undefined"
  >
    <button
      v-for="(option, index) in options"
      :key="option.value"
      ref="segments"
      class="segmented-button__segment"
      type="button"
      role="radio"
      :aria-checked="option.value === modelValue"
      :aria-label="iconOnly ? option.label : undefined"
      :title="iconOnly ? option.label : undefined"
      :tabindex="tabIndexFor(option.value, index)"
      @click="select(index)"
      @keydown="onKeydown($event, index)"
    >
      <span class="segmented-button__container">
        <span
          v-if="!iconOnly && option.value === modelValue"
          class="segmented-button__icon"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M9.55 18 3.85 12.3l1.43-1.43 4.27 4.28 9.17-9.18 1.43 1.43z"
            />
          </svg>
        </span>
        <span
          v-else-if="$slots.icon"
          class="segmented-button__icon"
          aria-hidden="true"
        >
          <slot
            name="icon"
            :value="option.value"
            :selected="option.value === modelValue"
          />
        </span>
        <span v-if="!iconOnly" class="segmented-button__label">
          {{ option.label }}
        </span>
      </span>
    </button>
  </div>
</template>

<style scoped>
.segmented-button {
  display: inline-flex;
}

/* The segment is the 48px hit area; its container is the 40px visual. */
.segmented-button__segment {
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--dune-sys-color-on-surface);
  cursor: pointer;
}

.segmented-button__segment:focus-visible {
  outline: none;
}

.segmented-button__container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--dune-sys-spacing-ui-sm);
  min-width: 48px;
  height: 40px;
  padding-inline: var(--dune-sys-spacing-ui-md);
  overflow: hidden;
  border: 1px solid var(--dune-sys-color-outline);
  border-inline-end-width: 0;
  transition: background-color 0.2s;
}

.segmented-button__segment:first-child .segmented-button__container {
  border-start-start-radius: var(--dune-sys-shape-corner-full);
  border-end-start-radius: var(--dune-sys-shape-corner-full);
}

.segmented-button__segment:last-child .segmented-button__container {
  border-inline-end-width: 1px;
  border-start-end-radius: var(--dune-sys-shape-corner-full);
  border-end-end-radius: var(--dune-sys-shape-corner-full);
}

.segmented-button[data-icon-only] .segmented-button__container {
  padding-inline: var(--dune-sys-spacing-ui-sm);
}

/* State layer */
.segmented-button__container::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--dune-sys-color-state-layers-on-surface-opacity-08);
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.segmented-button__segment:hover .segmented-button__container::before {
  opacity: 1;
}

.segmented-button__segment:focus-visible .segmented-button__container::before,
.segmented-button__segment:active .segmented-button__container::before {
  background-color: var(--dune-sys-color-state-layers-on-surface-opacity-10);
  opacity: 1;
}

.segmented-button__segment:focus-visible .segmented-button__container {
  outline: var(--dune-sys-state-focus-indicator-thickness) solid
    var(--dune-sys-color-secondary);
  outline-offset: var(--dune-sys-state-focus-indicator-outer-offset);
}

/* Selected */
.segmented-button__segment[aria-checked="true"] .segmented-button__container {
  background-color: var(--dune-sys-color-secondary-container);
  color: var(--dune-sys-color-on-secondary-container);
}

.segmented-button__segment[aria-checked="true"]
  .segmented-button__container::before {
  background-color: var(
    --dune-sys-color-state-layers-on-secondary-container-opacity-08
  );
}

.segmented-button__segment[aria-checked="true"]:focus-visible
  .segmented-button__container::before,
.segmented-button__segment[aria-checked="true"]:active
  .segmented-button__container::before {
  background-color: var(
    --dune-sys-color-state-layers-on-secondary-container-opacity-10
  );
}

.segmented-button__icon {
  position: relative;
  display: inline-flex;
}

.segmented-button__icon :deep(svg) {
  display: block;
  width: 18px;
  height: 18px;
}

.segmented-button__label {
  position: relative;
  font-family: var(--dune-sys-typescale-label-large-font);
  font-size: var(--dune-sys-typescale-label-large-size);
  font-weight: var(--dune-sys-typescale-label-large-weight);
  line-height: var(--dune-sys-typescale-label-large-line-height);
  letter-spacing: var(--dune-sys-typescale-label-large-tracking);
}

@media (prefers-reduced-motion: reduce) {
  .segmented-button__container,
  .segmented-button__container::before {
    transition: none;
  }
}
</style>
