<script setup lang="ts">
/**
 * FabMenu.vue
 *
 * Dune "FAB menu": a FAB that opens a short stack of related actions above
 * it. Closed, the toggle is a 56px container-colored FAB; open, it morphs into
 * a round close button in the solid color role, and the items (56px pills in
 * the container color) fade in above it, aligned to its trailing edge.
 *
 * Use it in a Vue island. Items are links (`href`) or buttons; a button item
 * emits `select` with the item. Choosing an item, Escape, or a click outside
 * closes the menu; Escape returns focus to the toggle. The items follow the
 * toggle in the DOM, so Tab reaches them next even though they sit above it.
 *
 * Icons: the default slot is the closed toggle's glyph; the scoped `icon`
 * slot (`{ item }`) draws each item's glyph.
 */

import { ref, useId, onMounted, onBeforeUnmount } from "vue";

export interface FabMenuItem {
  label: string;
  href?: string;
  /** Free-form key to tell items apart in a `select` handler. */
  value?: string;
}

interface Props {
  /** Accessible name of the closed toggle. */
  label: string;
  /** Accessible name of the open toggle. */
  closeLabel?: string;
  items: FabMenuItem[];
  color?: "primary" | "secondary" | "tertiary";
}

withDefaults(defineProps<Props>(), {
  closeLabel: "Close menu",
  color: "primary",
});

const emit = defineEmits<{ select: [item: FabMenuItem] }>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const toggle = ref<HTMLButtonElement | null>(null);
const menuId = useId();

function setOpen(value: boolean, refocus = false) {
  open.value = value;
  if (refocus) toggle.value?.focus();
}

function choose(item: FabMenuItem) {
  if (!item.href) emit("select", item);
  setOpen(false);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && open.value) {
    event.stopPropagation();
    setOpen(false, true);
  }
}

function onPointerDown(event: PointerEvent) {
  if (!open.value || !root.value) return;
  if (event.target instanceof Node && !root.value.contains(event.target)) {
    setOpen(false);
  }
}

onMounted(() => document.addEventListener("pointerdown", onPointerDown));
onBeforeUnmount(() =>
  document.removeEventListener("pointerdown", onPointerDown),
);
</script>

<template>
  <div
    ref="root"
    class="fab-menu"
    data-component="FabMenu"
    :data-color="color"
    :data-open="open ? 'true' : 'false'"
    @keydown="onKeydown"
  >
    <button
      ref="toggle"
      class="fab-menu__toggle interactive focus-ring"
      type="button"
      :aria-label="open ? closeLabel : label"
      :aria-expanded="open"
      :aria-controls="menuId"
      @click="setOpen(!open)"
    >
      <span class="state-layer" aria-hidden="true" />
      <span class="fab-menu__toggle-icon" aria-hidden="true">
        <svg v-if="open" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6z"
          />
        </svg>
        <slot v-else />
      </span>
    </button>

    <ul :id="menuId" class="fab-menu__items" :inert="!open">
      <li v-for="item in items" :key="item.value ?? item.label">
        <component
          :is="item.href ? 'a' : 'button'"
          class="fab-menu__item interactive focus-ring"
          :href="item.href"
          :type="item.href ? undefined : 'button'"
          @click="choose(item)"
        >
          <span class="state-layer" aria-hidden="true" />
          <span
            v-if="$slots.icon"
            class="fab-menu__item-icon"
            aria-hidden="true"
          >
            <slot name="icon" :item="item" />
          </span>
          <span class="fab-menu__item-label">{{ item.label }}</span>
        </component>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Column-reverse puts the items above the toggle while keeping DOM order. */
.fab-menu {
  display: inline-flex;
  flex-direction: column-reverse;
  align-items: flex-end;
  gap: var(--dune-sys-spacing-ui-sm);
}

.fab-menu__toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  padding: 0;
  overflow: hidden;
  border: none;
  border-radius: var(--dune-sys-shape-corner-large);
  box-shadow: var(--dune-sys-elevation-light-3-box-shadow);
  cursor: pointer;
  transition:
    border-radius 0.2s,
    background-color 0.2s,
    color 0.2s,
    box-shadow 0.2s;
}

.fab-menu[data-open="true"] .fab-menu__toggle {
  border-radius: var(--dune-sys-shape-corner-full);
}

.fab-menu__toggle:hover {
  box-shadow: var(--dune-sys-elevation-light-4-box-shadow);
}

.fab-menu__toggle-icon {
  position: relative;
  display: inline-flex;
}

.fab-menu__toggle-icon > :deep(astro-static-slot),
.fab-menu__toggle-icon > :deep(astro-slot) {
  display: contents;
}

.fab-menu__toggle-icon :deep(svg) {
  display: block;
  width: 24px;
  height: 24px;
}

.fab-menu[data-open="true"] .fab-menu__toggle-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.fab-menu__items {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--dune-sys-spacing-ui-xs);
  margin: 0;
  padding: 0;
  list-style: none;
  opacity: 0;
  translate: 0 var(--dune-sys-spacing-ui-sm);
  visibility: hidden;
  transition:
    opacity 0.2s,
    translate 0.2s,
    visibility 0.2s;
}

.fab-menu[data-open="true"] .fab-menu__items {
  opacity: 1;
  translate: 0 0;
  visibility: visible;
}

.fab-menu__item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--dune-sys-spacing-ui-sm);
  height: 56px;
  padding-inline: var(--dune-sys-spacing-ui-xl);
  overflow: hidden;
  border: none;
  border-radius: var(--dune-sys-shape-corner-full);
  text-decoration: none;
  cursor: pointer;
}

.fab-menu__item-icon,
.fab-menu__item-label {
  position: relative;
}

.fab-menu__item-icon {
  display: inline-flex;
}

.fab-menu__item-icon :deep(svg) {
  display: block;
  width: 24px;
  height: 24px;
}

.fab-menu__item-label {
  font-family: var(--dune-sys-typescale-title-medium-font);
  font-size: var(--dune-sys-typescale-title-medium-size);
  font-weight: var(--dune-sys-typescale-title-medium-weight);
  line-height: var(--dune-sys-typescale-title-medium-line-height);
  letter-spacing: var(--dune-sys-typescale-title-medium-tracking);
  white-space: nowrap;
}

/*
 * Colors. Items and the closed toggle use the container role; the open
 * toggle uses the solid role.
 */
.fab-menu[data-color="primary"] .fab-menu__item,
.fab-menu[data-color="primary"][data-open="false"] .fab-menu__toggle {
  background-color: var(--dune-sys-color-primary-container);
  color: var(--dune-sys-color-on-primary-container);
}

.fab-menu[data-color="primary"][data-open="true"] .fab-menu__toggle {
  background-color: var(--dune-sys-color-primary);
  color: var(--dune-sys-color-on-primary);
}

.fab-menu[data-color="secondary"] .fab-menu__item,
.fab-menu[data-color="secondary"][data-open="false"] .fab-menu__toggle {
  background-color: var(--dune-sys-color-secondary-container);
  color: var(--dune-sys-color-on-secondary-container);
}

.fab-menu[data-color="secondary"][data-open="true"] .fab-menu__toggle {
  background-color: var(--dune-sys-color-secondary);
  color: var(--dune-sys-color-on-secondary);
}

.fab-menu[data-color="tertiary"] .fab-menu__item,
.fab-menu[data-color="tertiary"][data-open="false"] .fab-menu__toggle {
  background-color: var(--dune-sys-color-tertiary-container);
  color: var(--dune-sys-color-on-tertiary-container);
}

.fab-menu[data-color="tertiary"][data-open="true"] .fab-menu__toggle {
  background-color: var(--dune-sys-color-tertiary);
  color: var(--dune-sys-color-on-tertiary);
}

@media (prefers-reduced-motion: reduce) {
  .fab-menu__toggle,
  .fab-menu__items {
    transition: none;
  }
}
</style>
