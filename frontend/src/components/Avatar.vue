<template>
  <div class="avatar" :style="{ width: size + 'px', height: size + 'px' }" aria-hidden="true">
    <svg :width="size" :height="size" :viewBox="`0 0 ${S} ${S}`" fill="none">
      <rect :width="S" :height="S" :rx="R" :ry="R" :fill="bg" />
      <circle :cx="c1x" :cy="c1y" :r="S * 0.18" :fill="c1" opacity="0.95" />
      <path :d="trianglePath" :fill="c2" opacity="0.9" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  seed: { type: String, required: true },
  size: { type: Number, default: 30 }
});

// Deterministic RNG from seed (xmur3 + mulberry32)
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = (() => mulberry32(xmur3(props.seed)()))();
const S = 64;
const R = 12;

function rb(min, max) { return min + rand() * (max - min); }

const baseHue = Math.floor(rand() * 360);
const bg = computed(() => `hsl(${baseHue}, 90%, 52%)`);
const c1 = computed(() => `hsl(${(baseHue + 290) % 360}, 85%, 66%)`);
const c2 = computed(() => `hsl(${(baseHue + 20) % 360}, 90%, 42%)`);

// Circle position
const c1x = rb(S * 0.35, S * 0.7);
const c1y = rb(S * 0.2, S * 0.55);

// Triangle path
function triPath(cx, cy, size, rot) {
  const pts = [];
  for (let i = 0; i < 3; i++) {
    const a = rot + (i * (Math.PI * 2)) / 3;
    pts.push([cx + Math.cos(a) * size, cy + Math.sin(a) * size]);
  }
  return `M ${pts[0][0]} ${pts[0][1]} L ${pts[1][0]} ${pts[1][1]} L ${pts[2][0]} ${pts[2][1]} Z`;
}
const trianglePath = computed(() => {
  const cx = rb(S * 0.55, S * 0.9);
  const cy = rb(S * 0.45, S * 0.9);
  const size = rb(S * 0.16, S * 0.26);
  const rot = rb(-Math.PI / 6, Math.PI / 6);
  return triPath(cx, cy, size, rot);
});
</script>

<style scoped>
.avatar { display: inline-grid; place-items: center; border-radius: 10px; overflow: hidden; }
svg { display: block; border-radius: 10px; }
</style>
