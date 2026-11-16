<script setup lang="ts">
/**
 * ThemeToggle.vue
 *
 * Vue island that picks the color mode: Light, Dark, or System, as a Dune
 * segmented button. Dark and Light are persisted to localStorage; System
 * clears it so data-theme follows prefers-color-scheme. The inline script in
 * BaseLayout applies the mode before first paint (avoiding FOUC) and tracks OS
 * changes while in System.
 */

import { ref, onMounted } from "vue";
import { track } from "../lib/analytics";
import SegmentedButton, { type SegmentedOption } from "./SegmentedButton.vue";

type Mode = "system" | "dark" | "light";

const OPTIONS: SegmentedOption[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const mode = ref<Mode>("system");

function readMode(): Mode {
  const stored = localStorage.getItem("theme");
  return stored === "dark" || stored === "light" ? stored : "system";
}

function applyMode(value: Mode) {
  if (value === "system") {
    localStorage.removeItem("theme");
  } else {
    localStorage.setItem("theme", value);
  }

  const isDark =
    value === "dark" ||
    (value === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light",
  );
}

function setMode(value: string) {
  mode.value = value as Mode;
  applyMode(mode.value);
  track("theme_change", { theme: mode.value });
}

onMounted(() => {
  mode.value = readMode();
});
</script>

<template>
  <SegmentedButton
    label="Color mode"
    :options="OPTIONS"
    :model-value="mode"
    icon-only
    @update:model-value="setMode"
  >
    <template #icon="{ value }">
      <svg
        v-if="value === 'system'"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
      <svg
        v-else-if="value === 'light'"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </template>
  </SegmentedButton>
</template>
