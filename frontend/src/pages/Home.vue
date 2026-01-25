<template>
  <div class="home">
    <!-- HERO / FULL-BLEED SLIDER -->
    <section class="hero-bleed">
      <Swiper
        :slides-per-view="1"
        :loop="true"
        :autoplay="{ delay: 6000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        :modules="[Autoplay, Pagination]"
        class="hero-swiper swiper"
        :style="{ height: '560px' }"
      >
        <SwiperSlide v-for="(c, i) in slides" :key="c.id || i">
          <div class="hero-slide" :style="{ backgroundImage: `url(${firstImage(c)})` }">
            <div class="shade"></div>
            <div class="inner container">
              <h1 class="hero-title">{{ c.title || $t('home.featuredVehicle') }}</h1>
              <div class="hero-price" v-if="c.price">{{ formatPrice(c.price) }}</div>
              <ul class="specs">
                <li v-if="c.year">
                  <span class="ico" aria-hidden="true">
                    <i class="fa-regular fa-calendar"></i>
                  </span>
                  <span>{{ c.year }}</span>
                </li>
                <li v-if="c.mileage">
                  <span class="ico" aria-hidden="true">
                    <i class="fa-solid fa-gauge-high"></i>
                  </span>
                  <span>{{ km(c.mileage) }}</span>
                </li>
                <li v-if="c.fuel_type">
                  <span class="ico" aria-hidden="true">
                    <i class="fa-solid fa-gas-pump"></i>
                  </span>
                  <span>{{ c.fuel_type }}</span>
                </li>
                <li v-if="hp(c)">
                  <span class="ico" aria-hidden="true">
                    <i class="fa-solid fa-bolt"></i>
                  </span>
                  <span>{{ hp(c) }} HP</span>
                </li>
              </ul>
              <div class="hero-actions">
                <router-link class="btn white" :to="`/cars/${c.id}`">{{ $t('home.viewDetails') }}</router-link>
                <router-link class="btn outline light" to="/cars">{{ $t('home.viewAllVehicles') }}</router-link>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </section>

    <!-- FEATURES / WHY CHOOSE US -->
    <section class="container why-wrap">
      <header class="why-head">
        <h2>{{ $t('home.whyTitle') }}</h2>
        <p class="muted">{{ $t('home.whySub') }}</p>
      </header>
      <div class="features">
        <article class="feature">
          <div class="f-ico">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <div>
            <h4>{{ $t('home.qualityTitle') }}</h4>
            <p class="muted">{{ $t('home.qualitySub') }}</p>
          </div>
        </article>
        <article class="feature">
          <div class="f-ico">
            <i class="fa-solid fa-truck-fast"></i>
          </div>
          <div>
            <h4>{{ $t('home.deliveryTitle') }}</h4>
            <p class="muted">{{ $t('home.deliverySub') }}</p>
          </div>
        </article>
        <article class="feature">
          <div class="f-ico">
            <i class="fa-solid fa-euro-sign"></i>
          </div>
          <div>
            <h4>{{ $t('home.pricesTitle') }}</h4>
            <p class="muted">{{ $t('home.pricesSub') }}</p>
          </div>
        </article>
        <article class="feature">
          <div class="f-ico">
            <i class="fa-solid fa-star"></i>
          </div>
          <div>
            <h4>{{ $t('home.serviceTitle') }}</h4>
            <p class="muted">{{ $t('home.serviceSub') }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- LATEST ARRIVALS -->
    <section class="container arrivals">
      <div class="arr-head">
        <div>
          <h2 class="arr-title">{{ $t('home.latestTitle') }}</h2>
          <div class="muted">{{ $t('home.latestSub') }}</div>
        </div>
        <router-link class="btn outline" to="/cars">
          {{ $t('home.viewAllVehicles') }}
          <i class="fa-solid fa-chevron-right" style="margin-left:.25rem"></i>
        </router-link>
      </div>

      <div class="cards-rail">
        <div v-for="(c, i) in cards.slice(0, 3)" :key="c.id || i" class="car-card card">
          <router-link :to="`/cars/${c.id}`" class="thumb">
            <img :src="firstImage(c)" :alt="c.title" loading="lazy" />
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
                  {{ km(c.mileage) }}
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
              <div class="details-row" v-if="hp(c)">
                <span class="detail-item">
                  <i class="fa-solid fa-bolt"></i>
                  {{ hp(c) }} HP
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
    </section>

    <!-- BLUE CTA BAND -->
    <section class="cta-band">
      <div class="container band-inner">
        <h3>{{ $t('home.readyTitle') }}</h3>
        <p>{{ $t('home.readySub') }}</p>
        <div class="band-actions">
          <router-link class="btn white" to="/cars">{{ $t('home.browseInventory') }}</router-link>
          <router-link class="btn outline light" to="/contact">{{ $t('home.contactUs') }}</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { CarsAPI, FavoritesAPI } from '../api.js';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';
import { useAuthStore } from '../stores/auth.js';
import 'swiper/css';
import 'swiper/css/pagination';

// modules are passed to Swiper via :modules prop on the component

const authStore = useAuthStore();
const latest = ref([]);
const hero = ref([]);
const favorites = ref(new Set());

// Fallback slides so the hero is visible even before DB data exists
const fallback = [
  { title: 'BMW 3 Series Touring', price: 18550, year: 2021, mileage: 127987, fuel_type: 'Diesel', hp: 150, media: [{ type:'image', url:'https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1600&auto=format&fit=crop' }] },
  { title: 'Volkswagen Passat Variant Elegance', price: 17900, year: 2019, mileage: 189935, fuel_type: 'Diesel', hp: 150, media: [{ type:'image', url:'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop' }] },
  { title: 'Volkswagen Passat Variant Business', price: 16550, year: 2018, mileage: 199980, fuel_type: 'Diesel', hp: 150, media: [{ type:'image', url:'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1600&auto=format&fit=crop' }] },
];

const slides = computed(() => hero.value.length ? hero.value : fallback);

function formatPrice(v) {
  try {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(v || 0));
  } catch (_) {
    return `${v} €`;
  }
}

function km(v) {
  if (v == null) return '';
  try { return `${Number(v).toLocaleString('de-DE')} km`; } catch { return `${v} km`; }
}

function hp(c) {
  // try several common fields; return falsy if none
  return c.hp || c.power || c.power_hp || c.engine_power || c.kw ? Math.round((c.hp || c.power || c.power_hp || c.engine_power || (c.kw * 1.341)) || 0) : '';
}

// Cards list also falls back like the hero so Latest Arrivals is never empty
const cards = computed(() => latest.value.length ? latest.value : fallback);

function firstImage(c) {
  const media = c.media || [];
  const img = media.find(m => m.type === 'image');
  return img ? img.url : 'https://picsum.photos/seed/car-hero/1600/900';
}

async function loadFavorites() {
  if (!authStore.isAuthenticated) {
    favorites.value = new Set();
    return;
  }
  try {
    const data = await FavoritesAPI.list();
    favorites.value = new Set(data.items.map(f => f.id));
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

onMounted(async () => {
  try {
    // Latest arrivals for cards
    const data = await CarsAPI.list({ pageSize: 12, sort: 'created_at_desc' });
    const items = data.items || [];
    const withMedia = await Promise.all(items.map(async (it) => {
      try { return await CarsAPI.get(it.id); } catch { return it; }
    }));
    latest.value = withMedia;

    // Hero slider: show only featured cars (up to 3)
    const feat = await CarsAPI.list({ featured: 1, pageSize: 3, sort: 'created_at_desc' });
    const fItems = feat.items || [];
    const fWithMedia = await Promise.all(fItems.slice(0, 3).map(async (it) => {
      try { return await CarsAPI.get(it.id); } catch { return it; }
    }));
    hero.value = fWithMedia;
  } catch (e) {
    // ignore; UI will simply render placeholders
  }
  
  // Load favorites
  loadFavorites();
});
</script>

<style scoped>
/***** HERO *****/
.hero-bleed { width: 100vw; margin-left: calc(50% - 50vw); position: relative; margin-top: 0; }
.hero-swiper { height: 560px; min-height: 320px; }
.hero-slide { height: 100%; background-size: cover; background-position: center; position: relative; }
.shade { position:absolute; inset:0; background: radial-gradient(120% 120% at 50% 40%, rgba(0,0,0,.25) 0%, rgba(0,0,0,.55) 70%); }
.inner { position:absolute; inset: 0; display:flex; flex-direction:column; justify-content:center; color:#fff; }
.hero-title { font-size: 48px; line-height: 1.15; font-weight: 500; margin: 0 0 .5rem; text-shadow: 0 2px 18px rgba(0,0,0,.35); }
.hero-price { color:#93c5fd; font-weight: 800; font-size: 22px; }
.specs { display:flex; gap:1rem; margin:.6rem 0 1rem; padding:0; list-style:none; opacity:.95; }
.specs li { display:flex; align-items:center; gap:.4rem; font-weight:500; color: #e5e7eb; }
.ico { width:24px; height:24px; border-radius:8px; display:grid; place-items:center; background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.16); }
.hero-actions { display:flex; gap:.6rem; }
.btn.white { background:#fff; color:#0f172a; }
.btn.outline.light { border-color: rgba(255,255,255,.7); color:#fff; background: transparent; }

/* Swiper pagination bullets on hero */
:deep(.swiper-pagination-bullet) { background: rgba(255,255,255,.8); opacity:.7; }
:deep(.swiper-pagination-bullet-active) { background:#fff; opacity:1; }

/***** WHY CHOOSE *****/
.why-wrap { margin-top: 2rem; }
.why-head { text-align:center; margin: .5rem 0 1.25rem; }
.features { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: .9rem; }
.feature { display:flex; gap:.75rem; padding:1rem; background:#fff; border:1px solid #e5e7eb; border-radius:1rem; box-shadow: 0 6px 22px rgba(2,6,23,.06); }
/* Icon sizing aligned with About page (40px box, 20px glyph) */
.f-ico { width:40px; height:40px; border-radius:12px; display:grid; place-items:center; color:#1d4ed8; background:#eff6ff; border:1px solid #dbeafe; flex:0 0 40px; }
.f-ico i { font-size:20px; }
.feature h4 { margin:.25rem 0 .15rem; }

/***** ARRIVALS *****/
.arrivals { margin-top: 1.25rem; }
.arrivals .cards-rail:empty::after { content:' '; display:block; height:1px; }
.arr-head { display:flex; align-items:flex-start; justify-content:space-between; gap:.75rem; margin-bottom:.75rem; }
.arr-title { margin:0; }
.cards-rail { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: .9rem; }
.car-card { border-radius:1rem; box-shadow: 0 10px 30px rgba(2,6,23,.08); overflow:hidden; }
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

/***** CTA BAND *****/
.cta-band { width:100vw; margin-left: calc(50% - 50vw); margin-top: 1.6rem; background:#1d4ed8; color:#fff; padding: 2rem 0; }
.band-inner { text-align:center; }
.band-inner h3 { margin: 0 0 .35rem; font-size: 26px; }
.band-inner p { margin: 0 0 .9rem; opacity:.95; }
.band-actions { display:flex; gap:.75rem; justify-content:center; }

/***** RWD *****/
@media (max-width: 1024px) {
  .features { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .cards-rail { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .f-ico { width:36px; height:36px; flex-basis:36px; }
  .f-ico i { font-size:18px; }
  .hero-swiper { height: 520px; }
  .hero-title { font-size: 40px; }
}
@media (max-width: 640px) {
  .features { grid-template-columns: 1fr; }
  .cards-rail { grid-template-columns: 1fr; }
  .f-ico { width:34px; height:34px; flex-basis:34px; }
  .f-ico i { font-size:18px; }
  .hero-title { font-size: 32px; }
  
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
  .car-card .title {
    font-size: 1rem;
    margin-bottom: .2rem;
  }
}
</style>
