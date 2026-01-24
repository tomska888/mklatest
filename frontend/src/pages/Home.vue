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
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  </span>
                  <span>{{ c.year }}</span>
                </li>
                <li v-if="c.mileage">
                  <span class="ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M12 7v5l3 2"/></svg>
                  </span>
                  <span>{{ km(c.mileage) }}</span>
                </li>
                <li v-if="c.fuel_type">
                  <span class="ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M14 10h-4"/></svg>
                  </span>
                  <span>{{ c.fuel_type }}</span>
                </li>
                <li v-if="hp(c)">
                  <span class="ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18"/><path d="M12 3v18"/></svg>
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
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l7 4v6c0 5-7 10-7 10S5 17 5 12V6l7-4z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <div>
            <h4>{{ $t('home.qualityTitle') }}</h4>
            <p class="muted">{{ $t('home.qualitySub') }}</p>
          </div>
        </article>
        <article class="feature">
          <div class="f-ico">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M5 7V5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v2"/></svg>
          </div>
          <div>
            <h4>{{ $t('home.deliveryTitle') }}</h4>
            <p class="muted">{{ $t('home.deliverySub') }}</p>
          </div>
        </article>
        <article class="feature">
          <div class="f-ico">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M8 16h6M8 8h10"/></svg>
          </div>
          <div>
            <h4>{{ $t('home.pricesTitle') }}</h4>
            <p class="muted">{{ $t('home.pricesSub') }}</p>
          </div>
        </article>
        <article class="feature">
          <div class="f-ico">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17l-5.5 3 1.5-6-4.5-4 6-.5L12 3l2.5 6 6 .5-4.5 4 1.5 6z"/></svg>
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
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:.25rem"><path d="M9 18l6-6-6-6"/></svg>
        </router-link>
      </div>

      <div class="cards-rail">
        <article v-for="(c, i) in cards.slice(0, 3)" :key="c.id || i" class="car-card card">
          <router-link :to="`/cars/${c.id}`" class="thumb">
            <img :src="firstImage(c)" :alt="c.title" loading="lazy" />
            <span v-if="c.body_type" class="chip">{{ c.body_type }}</span>
          </router-link>
          <div class="card-body">
            <h3 class="title">{{ c.title }}</h3>
            <div class="price">{{ formatPrice(c.price) }}</div>
            <div class="spec-line">
              <span class="s"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M12 7v5l3 2"/></svg>{{ km(c.mileage) }}</span>
              <span class="s" v-if="c.transmission"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v18M6 12h12M18 3v18"/></svg>{{ c.transmission }}</span>
              <span class="s" v-if="c.fuel_type"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/></svg>{{ c.fuel_type }}</span>
              <span class="s" v-if="hp(c)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18"/><path d="M12 3v18"/></svg>{{ hp(c) }} HP</span>
            </div>
          </div>
        </article>
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
import { CarsAPI } from '../api.js';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// modules are passed to Swiper via :modules prop on the component

const latest = ref([]);
const hero = ref([]);

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
.f-ico :is(svg) { width:20px; height:20px; }
.feature h4 { margin:.25rem 0 .15rem; }

/***** ARRIVALS *****/
.arrivals { margin-top: 1.25rem; }
.arrivals .cards-rail:empty::after { content:' '; display:block; height:1px; }
.arr-head { display:flex; align-items:flex-start; justify-content:space-between; gap:.75rem; margin-bottom:.75rem; }
.arr-title { margin:0; }
.cards-rail { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: .9rem; }
.car-card { border-radius:1rem; box-shadow: 0 10px 30px rgba(2,6,23,.08); overflow:hidden; }
.thumb { position:relative; display:block; aspect-ratio: 16/9; background:#f1f5f9; }
.thumb img { width:100%; height:100%; object-fit:cover; display:block; }
.chip { position:absolute; right:.5rem; top:.5rem; background:#f8fafc; color:#475569; border:1px solid #e2e8f0; border-radius:999px; padding:.2rem .55rem; font-size:.8rem; }
.title { margin:.25rem 0 .35rem; }
.price { color:#1d4ed8; font-weight:500; }
.spec-line { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:.4rem .75rem; margin-top:.35rem; color:#475569; font-size:.95rem; }
.s { display:inline-flex; gap:.35rem; align-items:center; }

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
  .f-ico :is(svg) { width:18px; height:18px; }
  .hero-swiper { height: 520px; }
  .hero-title { font-size: 40px; }
}
@media (max-width: 640px) {
  .features { grid-template-columns: 1fr; }
  .cards-rail { grid-template-columns: 1fr; }
  .f-ico { width:34px; height:34px; flex-basis:34px; }
  .f-ico :is(svg) { width:18px; height:18px; }
  .hero-title { font-size: 32px; }
}
</style>
