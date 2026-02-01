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
        <li v-if="searchable" class="search-wrapper">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Type to search..."
            @click.stop
            @keydown.escape="close"
            @keydown.enter.prevent="selectFirst"
          />
        </li>
        <li
          v-for="(opt, idx) in filteredOptions"
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
        <li v-if="filteredOptions.length === 0" class="no-results">
          No results found
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: [String, Number, null],
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Select...' },
  buttonClass: { type: String, default: '' },
  searchable: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue', 'change']);

const open = ref(false);
const root = ref(null);
const searchInput = ref(null);
const searchQuery = ref('');
const uid = Math.random().toString(36).slice(2, 8);
const activeId = computed(() => `opt-${uid}`);

const normOptions = computed(() => props.options.map(o => (
  typeof o === 'string' ? { label: o, value: o } : o
)));

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return normOptions.value;
  }
  const query = searchQuery.value.toLowerCase();
  return normOptions.value.filter(o =>
    o.label.toLowerCase().includes(query)
  );
});

const selected = computed(() => normOptions.value.find(o => o.value === props.modelValue));

function isSelected(opt) { return opt?.value === props.modelValue; }
function toggle() {
  open.value = !open.value;
  if (open.value && props.searchable) {
    nextTick(() => {
      searchInput.value?.focus();
    });
  }
}
function openMenu() {
  open.value = true;
  if (props.searchable) {
    nextTick(() => {
      searchInput.value?.focus();
    });
  }
}
function close() {
  open.value = false;
  searchQuery.value = '';
}
function select(opt) {
  emit('update:modelValue', opt.value);
  emit('change', opt.value);
  close();
}

function selectFirst() {
  if (filteredOptions.value.length > 0) {
    select(filteredOptions.value[0]);
  }
}

function onDocClick(e) {
  if (!root.value) return;
  if (root.value.contains(e.target)) return;
  close();
}

watch(open, (newVal) => {
  if (!newVal) {
    searchQuery.value = '';
  }
});

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
  position:absolute; z-index:9999; margin-top:.4rem; right:0; min-width: 220px;
  background:#fff; border:1px solid #e5e7eb; border-radius:.7rem; padding:.35rem;
  box-shadow: 0 12px 32px rgba(2,6,23,.12), 0 2px 8px rgba(2,6,23,.06);
  max-height: 320px;
  overflow-y: auto;
}
.search-wrapper {
  padding: .35rem .5rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: .25rem;
}
.search-input {
  width: 100%;
  padding: .5rem .65rem;
  border: 1px solid #e5e7eb;
  border-radius: .5rem;
  font-size: .875rem;
  outline: none;
}
.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.option { display:flex; align-items:center; justify-content:space-between; gap:.75rem; padding:.6rem .7rem; border-radius:.55rem; cursor:pointer; }
.option:hover { background:#f8fafc; }
.option.selected { background:#f1f5f9; }
.check { color:#0f172a; opacity:.9; }
.no-results {
  padding: 1rem;
  text-align: center;
  color: #64748b;
  font-size: .875rem;
}

.fade-scale-enter-active, .fade-scale-leave-active { transition: opacity .12s ease, transform .12s ease; }
.fade-scale-enter-from, .fade-scale-leave-to { opacity:0; transform: translateY(-6px) scale(.98); }
</style>
