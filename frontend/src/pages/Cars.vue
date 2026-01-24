<template>
  <div class="inventory container">
    <!-- Left: Title + Sidebar Filters -->
    <div class="left-col">
      <h1 class="page-title">Car Inventory</h1>
      <aside class="filters card">
        <header class="filters-head">
        <div class="title">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h18M6 12h12M10 19h4"/></svg>
          <span>Filters</span>
        </div>
        <button class="btn small ghost" @click="resetFilters">Clear</button>
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
        </aside>
      </div>
      
      <!-- Right: Content -->
      <section class="content">
      <div class="content-head">
        <div class="muted">Showing {{ total }} vehicle(s)</div>
      </div>

      <div class="toolbar">
        <div class="search-wrap">
          <svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input class="search" v-model="filters.q" @keyup.enter="applyFilters" placeholder="Search by make, model, or year..." />
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
            <h3 class="title">{{ c.title }}</h3>
            <div class="meta">
              <span>{{ c.make }} • {{ c.model }} • {{ c.year }}</span>
              <span>{{ formatPrice(c.price) }}</span>
            </div>
            <div class="meta">
              <span>{{ num(c.mileage) }} km</span>
              <span>{{ c.fuel_type }} • {{ c.transmission }}</span>
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
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CarsAPI } from '../api.js';
import CustomSelect from '../components/CustomSelect.vue';

const route = useRoute();
const router = useRouter();

// controls collapse state for sidebar groups
const open = reactive({
  makeModel: true,
  yearRange: true,
  priceRange: true,
  mileage: true,
  fuel: true,
  transmission: true,
  bodyType: true,
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
  pageSize: route.query.pageSize ? Number(route.query.pageSize) : 12,
});

const items = ref([]);
const total = ref(0);
const totalPages = ref(1);
const page = ref(route.query.page ? Number(route.query.page) : 1);

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

function resetFilters() {
  Object.assign(filters, { q:'', make:'', model:'', yearMin:'', yearMax:'', priceMin:'', priceMax:'', mileageMax:'', fuel_type:'', transmission:'', body_type:'', sort:'created_at_desc', pageSize:12 });
  applyFilters();
}

function go(p) {
  page.value = p;
  router.replace({ query: Object.fromEntries(new URLSearchParams(buildQuery())) });
  fetchCars();
}

function thumb(c) { return c.thumb_url || ('https://picsum.photos/seed/' + c.id + '/800/450'); }

onMounted(fetchCars);
</script>

<style scoped>
.inventory { display:grid; grid-template-columns: 320px 1fr; gap: 1rem; padding: 1rem 0 2rem; }
@media (max-width: 1020px) { .inventory { grid-template-columns: 1fr; } }

.left-col { display:flex; flex-direction:column; gap:.5rem; }
.page-title { margin: 0 0 .5rem; }

/* allow dropdowns to overflow the filter card */
.filters { padding: 1rem; overflow: visible; position: relative; }
.filters-head { display:flex; align-items:center; justify-content:space-between; }
.filters-head .title { display:flex; align-items:center; gap:.5rem; font-weight:600; }

.filter-group { border-top:1px solid #e5e7eb; }
.filter-group:first-of-type { border-top:none; }
.group-head { display:flex; align-items:center; justify-content:space-between; padding:.9rem 0; cursor:pointer; user-select:none; font-weight:600; }
.group-head .chev { transition: transform .15s ease; }
.filter-group.collapsed .group-head .chev { transform: rotate(180deg); }
.filter-group.collapsed .group-body { display: none; }
.group-body { padding: .25rem 0 .9rem; }
.group-body.two { display:grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
@media (max-width: 520px) { .group-body.two { grid-template-columns:1fr; } }

.content { padding: .25rem 0; }
.content-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:.6rem; }
.content-head .muted { color:#64748b; font-size:.95rem; }

.toolbar { display:flex; align-items:center; justify-content:space-between; gap: .75rem; margin-bottom: .75rem; }
.search-wrap { position:relative; flex:1; }
.search-wrap .icon { position:absolute; left:.6rem; top:50%; transform:translateY(-50%); color:#64748b; }
.search { width:100%; padding:.65rem .75rem .65rem 2rem; border:1px solid #e5e7eb; border-radius:.6rem; background:#fff; }

.car-card .thumb img { width:100%; height: 190px; object-fit: cover; display:block; }
.car-card .title { margin: .2rem 0 .4rem; font-size: 1.05rem; }
.car-card .meta { display:flex; align-items:center; justify-content:space-between; color:#475569; font-size:.95rem; }

.empty { border:2px dashed #e2e8f0; border-radius:.75rem; height: 300px; display:grid; place-items:center; color:#475569; }
.empty-inner { text-align:center; }

.pager { display:flex; gap:.5rem; justify-content:center; margin:1rem 0; align-items:center; }

/* utility to make select fill width */
:deep(.select-trigger.full) { width: 100%; justify-content: flex-start; min-width: 0; }
/* Sidebar dropdown menu sizing/overflow */
:deep(.filters .custom-select) { width: 100%; }
:deep(.filters .custom-select .menu) { left: 0; right: 0; min-width: 100%; max-height: 300px; overflow: auto; }
</style>
