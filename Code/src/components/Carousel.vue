<script setup lang="ts">
/**
 * Carousel.vue
 * 
 * Vue island for horizontally scrolling carousel with scroll-snap.
 * Renders slotted slides with prev/next navigation and dot indicators.
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import IconButton from './IconButton.vue';

// Must match the `@media` condition in the styles below (breakpoints-sm).
const COMPACT_QUERY = '(max-width: 640px)';

const track = ref<HTMLElement | null>(null);
const slideCount = ref(0);
const activeIndex = ref(0);
const isCompact = ref(false);

const navSize = computed(() => (isCompact.value ? 'xs' : 'sm'));

let animationFrameId: number | null = null;
let compactQuery: MediaQueryList | null = null;

function syncCompact(event: MediaQueryListEvent) {
  isCompact.value = event.matches;
}

/**
 * Return the real slide elements. Astro wraps slotted island content in a
 * single `<astro-slot>` (rendered with `display: contents`), so the slides are
 * that wrapper's children, not the track's direct children. Unwrap it when
 * present; otherwise fall back to the track's direct children.
 */
function getSlides(): HTMLElement[] {
  if (!track.value) return [];

  const children = Array.from(track.value.children) as HTMLElement[];
  if (children.length === 1 && children[0].tagName === 'ASTRO-SLOT') {
    return Array.from(children[0].children) as HTMLElement[];
  }

  return children;
}

/**
 * The gap between slides. It is a spacing token in the styles below (the home
 * page's column gutter uses the same one), so read it back rather than
 * repeating the number here.
 */
function getGap(): number {
  if (!track.value) return 0;
  return parseFloat(getComputedStyle(track.value).columnGap) || 0;
}

function updateActiveIndex() {
  if (!track.value || slideCount.value === 0) return;
  
  const firstSlide = getSlides()[0];
  if (!firstSlide) return;
  
  const slideStride = firstSlide.offsetWidth + getGap();
  const scrollLeft = track.value.scrollLeft;
  
  activeIndex.value = Math.round(scrollLeft / slideStride);
}

function handleScroll() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  
  animationFrameId = requestAnimationFrame(updateActiveIndex);
}

function prev() {
  if (activeIndex.value === 0 || !track.value) return;
  
  const firstSlide = getSlides()[0];
  if (!firstSlide) return;
  
  const slideStride = firstSlide.offsetWidth + getGap();
  const newIndex = activeIndex.value - 1;
  
  track.value.scrollTo({
    left: newIndex * slideStride,
    behavior: 'smooth',
  });
}

function next() {
  if (activeIndex.value >= slideCount.value - 1 || !track.value) return;
  
  const firstSlide = getSlides()[0];
  if (!firstSlide) return;
  
  const slideStride = firstSlide.offsetWidth + getGap();
  const newIndex = activeIndex.value + 1;
  
  track.value.scrollTo({
    left: newIndex * slideStride,
    behavior: 'smooth',
  });
}

function goToSlide(index: number) {
  if (!track.value) return;
  
  const firstSlide = getSlides()[0];
  if (!firstSlide) return;
  
  const slideStride = firstSlide.offsetWidth + getGap();
  
  track.value.scrollTo({
    left: index * slideStride,
    behavior: 'smooth',
  });
}

onMounted(() => {
  compactQuery = window.matchMedia(COMPACT_QUERY);
  isCompact.value = compactQuery.matches;
  compactQuery.addEventListener('change', syncCompact);

  if (track.value) {
    slideCount.value = getSlides().length;
    track.value.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  compactQuery?.removeEventListener('change', syncCompact);
  if (track.value) {
    track.value.removeEventListener('scroll', handleScroll);
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<template>
  <div class="carousel">
    <div ref="track" class="track">
      <slot />
    </div>

    <IconButton
      v-if="slideCount > 1"
      class="nav-button nav-button--prev"
      label="Previous"
      variant="tonal"
      :size="navSize"
      :disabled="activeIndex === 0"
      @click="prev"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </IconButton>

    <div v-if="slideCount > 1" class="indicators">
      <button
        v-for="index in slideCount"
        :key="index"
        class="indicator"
        :class="{ 'indicator--active': activeIndex === index - 1 }"
        type="button"
        :aria-label="`Go to slide ${index}`"
        @click="goToSlide(index - 1)"
      />
    </div>

    <IconButton
      v-if="slideCount > 1"
      class="nav-button nav-button--next"
      label="Next"
      variant="tonal"
      :size="navSize"
      :disabled="activeIndex >= slideCount - 1"
      @click="next"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </IconButton>
  </div>
</template>

<style scoped>
/*
 * Desktop: the arrows share the track's cell and overlay the cards.
 * Mobile: they drop into a controls row either side of the indicators.
 */
.carousel {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    "track"
    "indicators";
}

.track {
  grid-area: track;
  display: flex;
  gap: var(--md-sys-spacing-ui-md);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.track::-webkit-scrollbar {
  display: none;
}

/*
 * Astro wraps slotted island content in a `display: contents` <astro-slot>, so
 * the real slides can be either the track's direct children or the wrapper's
 * children. Target both so scroll-snap works regardless.
 */
.track :deep(> *),
.track :deep(> astro-slot > *) {
  scroll-snap-align: start;
  flex: 0 0 auto;
}

.nav-button {
  grid-area: track;
  align-self: center;
  z-index: 2;
}

/*
 * The sm touch target is 4px wider than its visible circle on each side, so a
 * 4px margin puts the circle 8px from the edge.
 */
.nav-button--prev {
  justify-self: start;
  margin-inline-start: var(--md-sys-spacing-ui-xs);
}

.nav-button--next {
  justify-self: end;
  margin-inline-end: var(--md-sys-spacing-ui-xs);
}

.indicators {
  grid-area: indicators;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--md-sys-spacing-subsection-to-body);
  margin-top: var(--md-sys-spacing-body-to-body);
}

.indicator {
  width: 9px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-outline-variant);
  cursor: pointer;
  transition: width 0.2s, background-color 0.2s;
}

.indicator--active {
  width: 36px;
  background-color: var(--md-sys-color-primary);
}

@media (max-width: 640px) {
  .carousel {
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas:
      "track track track"
      "prev indicators next";
    align-items: center;
    row-gap: var(--md-sys-spacing-ui-sm);
  }

  /*
   * The IconButton touch target is wider than its visible circle, so pull the
   * margin in by that difference to line the circle up with the page gutter.
   */
  .nav-button--prev {
    grid-area: prev;
    margin-inline-start: calc(
      var(--md-sys-spacing-body-to-subsection) - var(--md-sys-spacing-ui-sm)
    );
  }

  .nav-button--next {
    grid-area: next;
    margin-inline-end: calc(
      var(--md-sys-spacing-body-to-subsection) - var(--md-sys-spacing-ui-sm)
    );
  }

  .indicators {
    margin-top: 0;
  }
}
</style>
