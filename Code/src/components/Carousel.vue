<script setup lang="ts">
/**
 * Carousel.vue
 * 
 * Vue island for horizontally scrolling carousel with scroll-snap.
 * Renders slotted slides with prev/next navigation and dot indicators.
 */

import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
  gap?: number;
}

const props = withDefaults(defineProps<Props>(), {
  gap: 12,
});

const track = ref<HTMLElement | null>(null);
const slideCount = ref(0);
const activeIndex = ref(0);

let animationFrameId: number | null = null;

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

function updateActiveIndex() {
  if (!track.value || slideCount.value === 0) return;
  
  const firstSlide = getSlides()[0];
  if (!firstSlide) return;
  
  const slideStride = firstSlide.offsetWidth + props.gap;
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
  
  const slideStride = firstSlide.offsetWidth + props.gap;
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
  
  const slideStride = firstSlide.offsetWidth + props.gap;
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
  
  const slideStride = firstSlide.offsetWidth + props.gap;
  
  track.value.scrollTo({
    left: index * slideStride,
    behavior: 'smooth',
  });
}

onMounted(() => {
  if (track.value) {
    slideCount.value = getSlides().length;
    track.value.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
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
    <div ref="track" class="track" :style="{ gap: `${gap}px` }">
      <slot />
    </div>

    <button
      v-if="slideCount > 1"
      class="nav-button nav-button--prev"
      type="button"
      aria-label="Previous"
      :disabled="activeIndex === 0"
      @click="prev"
    >
      <svg
        class="icon"
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
    </button>

    <button
      v-if="slideCount > 1"
      class="nav-button nav-button--next"
      type="button"
      aria-label="Next"
      :disabled="activeIndex >= slideCount - 1"
      @click="next"
    >
      <svg
        class="icon"
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
    </button>

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
  </div>
</template>

<style scoped>
.carousel {
  position: relative;
}

.track {
  display: flex;
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
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: none;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  cursor: pointer;
  overflow: hidden;
  z-index: 2;
}

.nav-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--md-sys-color-state-layers-on-secondary-container-opacity-08);
  opacity: 0;
  transition: opacity 0.2s;
}

.nav-button:hover:not(:disabled)::before {
  opacity: 1;
}

.nav-button--prev {
  left: 1rem;
}

.nav-button--next {
  right: 1rem;
}

.nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.icon {
  position: relative;
  width: 24px;
  height: 24px;
  z-index: 1;
}

.indicators {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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
</style>
