<script setup lang="ts">
/**
 * ThemeToggle.vue
 *
 * Vue island that cycles the color mode: System → Dark → Light. It wraps a
 * Dune tonal IconButton whose glyph shows the current mode; each click
 * quietly swaps to the next one. Three states stretch the icon-button
 * pattern, so the button isn't a toggle (no aria-pressed): its label names
 * the current mode and the one a click switches to. A Dune plain tooltip
 * names the current mode on hover and keyboard focus.
 *
 * Dark and Light are persisted to localStorage; System clears it so
 * data-theme follows prefers-color-scheme. The inline script in BaseLayout
 * applies the mode before first paint (avoiding FOUC) and tracks OS changes
 * while in System.
 */

import { ref, computed, onMounted } from "vue";
import { track } from "../lib/analytics";
import IconButton from "./IconButton.vue";
import Tooltip from "./Tooltip.vue";

type Mode = "system" | "dark" | "light";

const ORDER: Mode[] = ["system", "dark", "light"];

const LABELS: Record<Mode, string> = {
  system: "System",
  dark: "Dark",
  light: "Light",
};

const mode = ref<Mode>("system");

const nextMode = computed(
  () => ORDER[(ORDER.indexOf(mode.value) + 1) % ORDER.length],
);

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

function cycleMode() {
  mode.value = nextMode.value;
  applyMode(mode.value);
  track("theme_change", { theme: mode.value });
}

onMounted(() => {
  mode.value = readMode();
});
</script>

<template>
  <Tooltip :text="`Color mode: ${LABELS[mode]}`" align="start">
    <IconButton
      :label="`Color mode: ${LABELS[mode]}. Switch to ${LABELS[nextMode]}.`"
      variant="tonal"
      size="xs"
      @click="cycleMode"
    >
      <svg
        v-if="mode === 'system'"
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
        v-else-if="mode === 'light'"
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
    </IconButton>
  </Tooltip>
</template>
