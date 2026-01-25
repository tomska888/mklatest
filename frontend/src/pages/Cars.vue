<template>
  <div class="inventory container">
    <!-- Left: Title + Sidebar Filters -->
    <div class="left-col">
      <h1 class="page-title">Car Inventory</h1>
      
      <!-- Mobile Filter Toggle Button -->
      <button class="mobile-filter-toggle btn outline" @click="showMobileFilters = true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M4 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="7" cy="7" r="2" fill="currentColor"/>
          <circle cx="17" cy="12" r="2" fill="currentColor"/>
          <circle cx="12" cy="17" r="2" fill="currentColor"/>
        </svg>
        <span>Filters</span>
        <span class="badge" v-if="activeFiltersCount > 0">{{ activeFiltersCount }}</span>
      </button>
      
      <!-- Mobile Filters Backdrop -->
      <div class="mobile-filters-backdrop" :class="{ active: showMobileFilters }" @click="showMobileFilters = false"></div>
      
      <aside class="filters card" :class="{ 'mobile-open': showMobileFilters }">
        <header class="filters-head">
        <div class="title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M4 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="7" cy="7" r="2" fill="currentColor"/>
            <circle cx="17" cy="12" r="2" fill="currentColor"/>
            <circle cx="12" cy="17" r="2" fill="currentColor"/>
          </svg>
          <span>Filters</span>
        </div>
        <div class="filters-actions">
          <button class="btn small outline clear-btn" @click="resetFilters">Clear</button>
          <button class="btn small ghost mobile-close" @click="showMobileFilters = false">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </header>

      <!-- Make & Model -->
      <section class="filter-group" :class="{ collapsed: !open.makeModel }">
        <header class="group-head" @click="open.makeModel = !open.makeModel">
          <span>Make & Model</span>
          <svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 15 6-6 6 6"/></svg>
        </header>
        <div class="group-body">
          <label class="label">Make</label>
          <CustomSelect
            v-model="filters.make"
            :options="makeOptions"
            placeholder="All Makes"
            button-class="full"
            @change="applyFilters"
          />

          <label class="label" style="margin-top:.75rem;">Model</label>
          <CustomSelect
            v-model="filters.model"
            :options="modelOptions"
            placeholder="All Models"
            button-class="full"
            @change="applyFilters"
          />
        </div>
      </section>

      <!-- Year Range -->
      <section class="filter-group" :class="{ collapsed: !open.yearRange }">
        <header class="group-head" @click="open.yearRange = !open.yearRange">
          <span>Year Range</span>
          <svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 15 6-6 6 6"/></svg>
        </header>
        <div class="group-body two">
          <div>
            <label class="label">Min Year</label>
            <CustomSelect
              v-model="filters.yearMin"
              :options="yearOpts"
              placeholder="Any"
              button-class="full"
              @change="applyFilters"
            />
          </div>
          <div>
            <label class="label">Max Year</label>
            <CustomSelect
              v-model="filters.yearMax"
              :options="yearOpts"
              placeholder="Any"
              button-class="full"
              @change="applyFilters"
            />
          </div>
        </div>
      </section>

      <!-- Price Range -->
      <section class="filter-group" :class="{ collapsed: !open.priceRange }">
        <header class="group-head" @click="open.priceRange = !open.priceRange">
          <span>Price Range</span>
          <svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 15 6-6 6 6"/></svg>
        </header>
        <div class="group-body two">
          <div>
            <label class="label">Min Price</label>
            <input class="input" type="number" v-model.number="filters.priceMin" @change="applyFilters" placeholder="0" />
          </div>
          <div>
            <label class="label">Max Price</label>
            <input class="input" type="number" v-model.number="filters.priceMax" @change="applyFilters" placeholder="No limit" />
          </div>
        </div>
      </section>

      <!-- Mileage -->
      <section class="filter-group" :class="{ collapsed: !open.mileage }">
        <header class="group-head" @click="open.mileage = !open.mileage">
          <span>Mileage</span>
          <svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 15 6-6 6 6"/></svg>
        </header>
        <div class="group-body">
          <label class="label">Max Mileage (km)</label>
          <input class="input" type="number" v-model.number="filters.mileageMax" @change="applyFilters" placeholder="No limit" />
        </div>
      </section>

      <!-- Fuel Type -->
      <section class="filter-group" :class="{ collapsed: !open.fuel }">
        <header class="group-head" @click="open.fuel = !open.fuel">
          <span>Fuel Type</span>
          <svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 15 6-6 6 6"/></svg>
        </header>
        <div class="group-body">
          <CustomSelect
            v-model="filters.fuel_type"
            :options="fuelOptions"
            placeholder="All Fuel Types"
            button-class="full"
            @change="applyFilters"
          />
        </div>
      </section>

      <!-- Transmission -->
      <section class="filter-group" :class="{ collapsed: !open.transmission }">
        <header class="group-head" @click="open.transmission = !open.transmission">
          <span>Transmission</span>
          <svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 15 6-6 6 6"/></svg>
        </header>
        <div class="group-body">
          <CustomSelect
            v-model="filters.transmission"
            :options="transmissionOptions"
            placeholder="All Transmissions"
            button-class="full"
            @change="applyFilters"
          />
        </div>
      </section>

      <!-- Body Type -->
      <section class="filter-group" :class="{ collapsed: !open.bodyType }">
        <header class="group-head" @click="open.bodyType = !open.bodyType">
          <span>Body Type</span>
          <svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 15 6-6 6 6"/></svg>
        </header>
        <div class="group-body">
          <CustomSelect
            v-model="filters.body_type"
            :options="bodyOptions"
            placeholder="All Body Types"
            button-class="full"
            @change="applyFilters"
          />
        </div>
      </section>
      
      <!-- Mobile Apply Button -->
      <div class="mobile-apply-wrapper">
        <button class="btn primary full-width" @click="applyMobileFilters">Apply Filters</button>
      </div>
        </aside>
      </div>
      
      <!-- Right: Content -->
      <section class="content">
      <div class="toolbar">
        <div class="muted">Showing {{ total }} vehicle(s)</div>
        <div class="search-wrap">
          <svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input class="search" v-model="filters.q" @keyup.enter="applyFilters" placeholder="Search" />
        </div>
        <div class="right-actions">
          <CustomSelect v-model="filters.sort" :options="sortOptions" placeholder="Newest First" @change="applyFilters">
            <template #icon>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h12M3 12h8M3 18h4"/></svg>
            </template>
          </CustomSelect>
        </div>
      </div>

      <!-- Results grid -->
      <div v-if="items.length" class="grid cols-3">
        <div v-for="c in items" :key="c.id" class="car-card card">
          <router-link :to="`/cars/${c.id}`" class="thumb">
            <img :src="thumb(c)" :alt="c.title" loading="lazy" />
          </router-link>
          <div class="card-body">
            <div class="card-content">
              <h3 class="title">{{ c.title }}</h3>
              <div class="details-row">
                <span class="detail-item">
                  <i class="fa-regular fa-calendar"></i>
                  {{ c.year }}
                </span>
                <span class="detail-item">
                  <i class="fa-solid fa-gauge-high"></i>
                  {{ num(c.mileage) }} km
                </span>
              </div>
              <div class="details-row">
                <span class="detail-item">
                  <i class="fa-solid fa-gas-pump"></i>
                  {{ c.fuel_type }}
                </span>
                <span class="detail-item">
                  <i class="fa-solid fa-gears"></i>
                  {{ c.transmission }}
                </span>
              </div>
              <div class="details-row" v-if="c.power_kw">
                <span class="detail-item">
                  <i class="fa-solid fa-bolt"></i>
                  {{ c.power_kw }} kW ({{ c.power_hp }} HP)
                </span>
              </div>
            </div>
            <div class="card-footer">
              <button
                class="favorite-btn"
                :class="{ 'is-favorite': favorites.has(c.id) }"
                @click="toggleFavorite(c.id)"
                :disabled="!authStore.isAuthenticated"
                :title="authStore.isAuthenticated ? (favorites.has(c.id) ? 'Remove from favorites' : 'Add to favorites') : 'Login to add favorites'"
              >
                <i class="fa-heart" :class="favorites.has(c.id) ? 'fa-solid' : 'fa-regular'"></i>
              </button>
              <span class="detail-item price">
                {{ formatPrice(c.price) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="empty">
        <div class="empty-inner">
          <p>No cars found matching your criteria.</p>
          <button class="btn outline" @click="resetFilters">Clear Filters</button>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pager" v-if="totalPages > 1">
        <button class="btn outline" :disabled="page<=1" @click="go(page-1)">Prev</button>
        <span>Page {{ page }} / {{ totalPages }}</span>
        <button class="btn outline" :disabled="page>=totalPages" @click="go(page+1)">Next</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CarsAPI, FavoritesAPI } from '../api.js';
import CustomSelect from '../components/CustomSelect.vue';
import { useAuthStore } from '../stores/auth.js';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Mobile filters state
const showMobileFilters = ref(false);

// Check if mobile view
const isMobile = () => window.innerWidth <= 1020;

// controls collapse state for sidebar groups
const open = reactive({
  makeModel: !isMobile(),
  yearRange: !isMobile(),
  priceRange: !isMobile(),
  mileage: !isMobile(),
  fuel: !isMobile(),
  transmission: !isMobile(),
  bodyType: !isMobile(),
});

const filters = reactive({
  q: route.query.q || '',
  make: route.query.make || '',
  model: route.query.model || '',
  yearMin: route.query.yearMin ? Number(route.query.yearMin) : '',
  yearMax: route.query.yearMax ? Number(route.query.yearMax) : '',
  priceMin: route.query.priceMin ? Number(route.query.priceMin) : '',
  priceMax: route.query.priceMax ? Number(route.query.priceMax) : '',
  mileageMax: route.query.mileageMax ? Number(route.query.mileageMax) : '',
  fuel_type: route.query.fuel_type || '',
  transmission: route.query.transmission || '',
  body_type: route.query.body_type || '',
  sort: route.query.sort || 'created_at_desc',
  pageSize: route.query.pageSize ? Number(route.query.pageSize) : 9,
});

const items = ref([]);
const total = ref(0);
const totalPages = ref(1);
const page = ref(route.query.page ? Number(route.query.page) : 1);
const favorites = ref(new Set());

// Count active filters
const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.make) count++;
  if (filters.model) count++;
  if (filters.yearMin) count++;
  if (filters.yearMax) count++;
  if (filters.priceMin) count++;
  if (filters.priceMax) count++;
  if (filters.mileageMax) count++;
  if (filters.fuel_type) count++;
  if (filters.transmission) count++;
  if (filters.body_type) count++;
  return count;
});

const sortOptions = [
  { label: 'Newest First', value: 'created_at_desc' },
  { label: 'Oldest First', value: 'created_at_asc' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Lowest Mileage', value: 'mileage_asc' },
];

const makeOptions = [ 'Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Skoda', 'Opel', 'Ford', 'Toyota', 'Kia', 'Hyundai' ];
const modelOptions = [ 'A3', 'A4', '3 Series', 'C-Class', 'E-Class', 'Golf', 'Passat', 'Octavia', 'Insignia', 'Focus', 'Corolla' ];
const fuelOptions = [ 'Petrol', 'Diesel', 'Hybrid', 'Electric', 'Plug-in Hybrid' ];
const transmissionOptions = [ 'Manual', 'Automatic' ];
const bodyOptions = [ 'Sedan', 'Hatchback', 'SUV', 'Coupe', 'Wagon', 'Convertible', 'Van', 'Pickup' ];

const currentYear = new Date().getFullYear();
const yearOpts = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => ({ label: String(currentYear - i), value: currentYear - i }));

function formatPrice(v) {
  try { return new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(Number(v||0)); } catch { return `${v} €`; }
}
function num(v) { try { return Number(v||0).toLocaleString('de-DE'); } catch { return v; } }

function buildQuery() {
  const q = new URLSearchParams();
  Object.entries({ ...filters, page: page.value }).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) q.set(k, String(v));
  });
  return q.toString();
}

async function fetchCars() {
  const params = Object.fromEntries(new URLSearchParams(buildQuery()));
  const data = await CarsAPI.list(params);
  items.value = data.items;
  total.value = data.total;
  totalPages.value = data.totalPages;
  page.value = data.page;
}

function applyFilters() {
  page.value = 1;
  router.replace({ query: Object.fromEntries(new URLSearchParams(buildQuery())) });
  fetchCars();
}

function applyMobileFilters() {
  applyFilters();
  showMobileFilters.value = false;
}

function resetFilters() {
  Object.assign(filters, { q:'', make:'', model:'', yearMin:'', yearMax:'', priceMin:'', priceMax:'', mileageMax:'', fuel_type:'', transmission:'', body_type:'', sort:'created_at_desc', pageSize:9 });
  applyFilters();
}

function go(p) {
  page.value = p;
  router.replace({ query: Object.fromEntries(new URLSearchParams(buildQuery())) });
  fetchCars();
}

function thumb(c) { return c.thumb_url || ('https://picsum.photos/seed/' + c.id + '/800/450'); }

async function loadFavorites() {
  if (!authStore.isAuthenticated) {
    favorites.value = new Set();
    return;
  }
  try {
    const data = await FavoritesAPI.list();
    favorites.value = new Set(data.items.map(f => f.car_id));
  } catch (err) {
    console.error('Failed to load favorites:', err);
    favorites.value = new Set();
  }
}

async function toggleFavorite(carId) {
  if (!authStore.isAuthenticated) return;
  
  const isFavorite = favorites.value.has(carId);
  try {
    if (isFavorite) {
      await FavoritesAPI.remove(carId);
      favorites.value.delete(carId);
    } else {
      await FavoritesAPI.add(carId);
      favorites.value.add(carId);
    }
  } catch (err) {
    console.error('Failed to toggle favorite:', err);
  }
}

onMounted(() => {
  fetchCars();
  loadFavorites();
});
</script>

<style scoped>
.inventory { display:grid; grid-template-columns: 320px 1fr; gap: 1rem; padding: 1rem 0 2rem; position: relative; }
@media (max-width: 1020px) { .inventory { grid-template-columns: 1fr; } }

/* Mobile Filter Toggle Button */
.mobile-filter-toggle {
  display: none;
  width: 100%;
  justify-content: center;
  gap: .5rem;
  border-color: #d1d5db;
  color: #374151;
}
.mobile-filter-toggle:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}
.mobile-filter-toggle .badge {
  background: var(--brand);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: .75rem;
  font-weight: 600;
  margin-left: .25rem;
}
@media (max-width: 1020px) {
  .mobile-filter-toggle {
    display: inline-flex;
  }
}

/* Mobile Filters Backdrop */
.mobile-filters-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 98;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.mobile-filters-backdrop.active {
  opacity: 1;
  pointer-events: auto;
}
@media (max-width: 1020px) {
  .mobile-filters-backdrop {
    display: block;
  }
}

.left-col { display:flex; flex-direction:column; gap:.5rem; }
.page-title { margin: 0 0 .5rem; }

/* allow dropdowns to overflow the filter card */
.filters { padding: 1rem; overflow: visible; position: relative; }
@media (max-width: 1020px) {
  .filters {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    width: 85%;
    max-width: 400px;
    z-index: 99;
    background: white;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    overflow-y: auto;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    border-radius: 0;
    padding-bottom: 0px;
  }
  .filters.mobile-open {
    transform: translateX(0);
  }
}

.filters-head { display:flex; align-items:center; justify-content:space-between; margin-bottom: .5rem; }
.filters-head .title { display:flex; align-items:center; gap:.5rem; font-weight:600; }
.filters-head .filters-actions { display: flex; align-items: center; gap: .5rem; }
.filters-head .clear-btn {
  border-color: #d1d5db;
  color: #6b7280;
}
.filters-head .clear-btn:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}
.filters-head .mobile-close {
  display: none;
  padding: .35rem;
}
@media (max-width: 1020px) {
  .filters-head .mobile-close {
    display: inline-flex;
  }
}

.filter-group { border-top:1px solid #e5e7eb; }
.filter-group:first-of-type { border-top:none; }
.group-head { display:flex; align-items:center; justify-content:space-between; padding:.9rem 0; cursor:pointer; user-select:none; font-weight:600; }
.group-head .chev { transition: transform .15s ease; }
.filter-group.collapsed .group-head .chev { transform: rotate(180deg); }
.filter-group.collapsed .group-body { display: none; }
.group-body { padding: .25rem 0 .9rem; }
.group-body.two { display:grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
@media (max-width: 520px) { .group-body.two { grid-template-columns:1fr; } }

/* Mobile Apply Button */
.mobile-apply-wrapper {
  display: none;
  position: sticky;
  bottom: 0;
  background: white;
  padding: 1rem;
  margin: 0 -1rem -1rem;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  text-align: right;
}
@media (max-width: 1020px) {
  .mobile-apply-wrapper {
    display: block;
  }
}

.content { padding: .25rem 0; }

.toolbar {
  display:grid;
  grid-template-columns: auto 1fr auto;
  align-items:center;
  gap: 1rem;
  margin-bottom: .75rem;
  position: sticky;
  top: 59px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 40;
  padding: .35rem 0;
  border-radius: 0 0 .75rem .75rem;
}
.toolbar .muted { color:#1e293b; font-size:.95rem; font-weight:600; white-space:nowrap; }
.search-wrap { position:relative; width:100%; }
@media (max-width: 768px) {
  .toolbar {
    grid-template-columns: 1fr auto;
    gap: .5rem;
    padding: .5rem 0;
    top: 56px
  }
  .toolbar .muted {
    display: none;
  }
}
.search-wrap .icon { position:absolute; left:.6rem; top:50%; transform:translateY(-50%); color:#64748b; }
.search { width:100%; padding:.65rem .75rem .65rem 2rem; border:1px solid #e5e7eb; border-radius:.6rem; background:#fff; }

.car-card .thumb { display: block; text-decoration: none; overflow: hidden; }
.car-card .thumb img { width:100%; height: 190px; object-fit: cover; display:block; transition: transform .2s ease; }
.car-card .thumb:hover img { transform: scale(1.05); }
.car-card .card-body { display: flex; flex-direction: column; justify-content: space-between; min-height: 160px; }
.car-card .card-content { display: flex; flex-direction: column; gap: .5rem; }
.car-card .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: .5rem; border-top: 1px solid #e5e7eb; margin-top: .5rem; }
.car-card .favorite-btn { background: none; border: none; padding: 0; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; transition: transform .2s ease; }
.car-card .favorite-btn:disabled { cursor: not-allowed; opacity: 0.5; }
.car-card .favorite-btn:not(:disabled):hover { transform: scale(1.15); }
.car-card .favorite-btn i { font-size: 1.1rem; color: #94a3b8; transition: color .2s ease; }
.car-card .favorite-btn:not(:disabled):hover i { color: #ef4444; }
.car-card .favorite-btn.is-favorite i { color: #ef4444; }
.car-card .title { margin: 0; font-size: 1.1rem; font-weight: 600; color: var(--text); line-height: 1.3; }
.car-card .details-row { display: flex; align-items: center; justify-content: space-between; gap: .5rem; min-height: 1.5rem; }
.car-card .detail-item { display: inline-flex; align-items: center; gap: .4rem; color: #64748b; font-size: .875rem; line-height: 1.5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.car-card .detail-item i { flex-shrink: 0; color: #94a3b8; font-size: .75rem; width: 14px; text-align: center; display: inline-flex; align-items: center; justify-content: center; }
.car-card .detail-item.price { font-weight: 600; color: var(--brand); font-size: 1.1rem; }
.car-card .detail-item.price i { color: var(--brand); font-size: .85rem; }
.car-card .detail-item.fuel-trans { font-size: .85rem; }
@media (max-width: 768px) {
  .car-card .card-content { gap: .4rem; }
  .car-card .details-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .4rem .5rem;
    min-height: auto;
  }
  .car-card .detail-item {
    display: inline-flex;
    align-items: center;
    white-space: normal;
    font-size: .85rem;
    line-height: 1.5;
  }
  .car-card .detail-item i {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .car-card .title {
    font-size: 1rem;
    margin-bottom: .2rem;
  }
}

.empty { border:2px dashed #e2e8f0; border-radius:.75rem; height: 300px; display:grid; place-items:center; color:#475569; }
.empty-inner { text-align:center; }

.pager { display:flex; gap:.5rem; justify-content:center; margin:1rem 0; align-items:center; }
.pager .btn { border-color: #d1d5db; color: #9ca3af; }
.pager .btn:hover:not(:disabled) { border-color: #9ca3af; background-color: #f9fafb; }
.pager .btn:disabled { cursor: not-allowed; }

/* utility to make select fill width */
:deep(.select-trigger.full) { width: 100%; justify-content: flex-start; min-width: 0; }
/* Sidebar dropdown menu sizing/overflow */
:deep(.filters .custom-select) { width: 100%; }
:deep(.filters .custom-select .menu) { left: 0; right: 0; min-width: 100%; max-height: 300px; overflow: auto; }
</style>

