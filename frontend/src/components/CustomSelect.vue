<template>
  <div class="custom-select" ref="root">
    <button
      type="button"
      class="select-trigger"
      :class="buttonClass"
      @click="toggle"
      @keydown.down.prevent="openMenu"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
      aria-haspopup="listbox"
      :aria-expanded="open ? 'true' : 'false'"
    >
      <span v-if="$slots.icon" class="leading-icon"><slot name="icon" /></span>
      <span class="label">{{ selected?.label || placeholder }}</span>
      <span class="chevron" :class="{ open }">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
      </span>
    </button>

    <transition name="fade-scale">
      <ul
        v-if="open"
        class="menu"
        role="listbox"
        :aria-activedescendant="activeId"
        tabindex="-1"
      >
        <li
          v-for="(opt, idx) in normOptions"
          :key="opt.value"
          class="option"
          :class="{ selected: isSelected(opt) }"
          role="option"
          :id="`opt-${uid}-${idx}`"
          @click="select(opt)"
        >
          <span class="text">{{ opt.label }}</span>
          <span v-if="isSelected(opt)" class="check">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
          </span>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: [String, Number, null],
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Select...' },
  buttonClass: { type: String, default: '' }
});
const emit = defineEmits(['update:modelValue', 'change']);

const open = ref(false);
const root = ref(null);
const uid = Math.random().toString(36).slice(2, 8);
const activeId = computed(() => `opt-${uid}`);

const normOptions = computed(() => props.options.map(o => (
  typeof o === 'string' ? { label: o, value: o } : o
)));

const selected = computed(() => normOptions.value.find(o => o.value === props.modelValue));

function isSelected(opt) { return opt?.value === props.modelValue; }
function toggle() { open.value = !open.value; }
function openMenu() { open.value = true; }
function close() { open.value = false; }
function select(opt) {
  emit('update:modelValue', opt.value);
  emit('change', opt.value);
  close();
}

function onDocClick(e) {
  if (!root.value) return;
  if (root.value.contains(e.target)) return;
  close();
}

onMounted(() => document.addEventListener('click', onDocClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocClick));
</script>

<style scoped>
.custom-select { position: relative; display:inline-block; }
.select-trigger {
  display:inline-flex; align-items:center; gap:.5rem;
  border:2px solid #0f172a; border-color: #0f172a0f #0f172a12 #0f172a12 #0f172a12;
  background:#fff; color:#0f172a; font-weight:600; cursor:pointer;
  padding:.6rem .85rem; border-radius:.7rem; min-width: 180px;
}
.select-trigger:hover { box-shadow: 0 1px 0 rgba(2,6,23,.05), 0 1px 2px rgba(2,6,23,.06); }
.leading-icon { color:#475569; display:grid; place-items:center; }
.label { flex:1; text-align:left; }
.chevron { display:grid; place-items:center; color:#475569; transition: transform .15s ease; }
.chevron.open { transform: rotate(180deg); }

.menu {
  position:absolute; z-index:40; margin-top:.4rem; right:0; min-width: 220px;
  background:#fff; border:1px solid #e5e7eb; border-radius:.7rem; padding:.35rem;
  box-shadow: 0 12px 32px rgba(2,6,23,.12), 0 2px 8px rgba(2,6,23,.06);
}
.option { display:flex; align-items:center; justify-content:space-between; gap:.75rem; padding:.6rem .7rem; border-radius:.55rem; cursor:pointer; }
.option:hover { background:#f8fafc; }
.option.selected { background:#f1f5f9; }
.check { color:#0f172a; opacity:.9; }

.fade-scale-enter-active, .fade-scale-leave-active { transition: opacity .12s ease, transform .12s ease; }
.fade-scale-enter-from, .fade-scale-leave-to { opacity:0; transform: translateY(-6px) scale(.98); }
</style>
