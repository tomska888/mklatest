<template>
  <div class="car-details container" v-if="car">
    <!-- Top bar -->
    <div class="topbar">
      <router-link to="/cars" class="backlink">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        <span>Back to Listings</span>
      </router-link>
      <div class="actions">
        <button class="icon-btn fav-btn" :class="{ active: isFav }" :aria-pressed="isFav ? 'true' : 'false'" :title="isFav ? 'Saved' : 'Save'" @click="toggleFavorite">
          <svg v-if="isFav" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <button class="icon-btn" aria-label="Share" title="Share" @click="shareListing">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
        </button>
      </div>
    </div>

    <div class="grid main-layout">
      <!-- Left column -->
      <section class="left">
        <!-- Media gallery -->
        <div class="card gallery">
          <div class="media-wrap">
            <img class="hero" :src="activeMediaUrl" :alt="car.title" />
            <span v-if="car.featured" class="flag">New</span>
          </div>
          <div class="thumbs" v-if="car.media?.length">
            <button
              v-for="(m, i) in car.media"
              :key="m.id || i"
              class="tbtn"
              :class="{ active: i === activeIndex }"
              @click="activeIndex = i"
            >
              <img v-if="m.type === 'image'" :src="m.url" :alt="car.title" />
              <div v-else class="video-tag">Video</div>
            </button>
          </div>
        </div>

        <!-- Title + price + tiles -->
        <div class="card title-card">
          <div class="card-body head">
            <h1 class="title">{{ car.title }}</h1>
            <div class="price blue">{{ formatPrice(car.price) }}</div>
          </div>
          <div class="tiles">
            <div class="tile">
              <div class="ico">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3 12 12"/></svg>
              </div>
              <div class="kv">
                <div class="k">Mileage</div>
                <div class="v">{{ car.mileage != null ? `${num(car.mileage)} km` : '—' }}</div>
              </div>
            </div>
            <div class="tile">
              <div class="ico">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h18M7 21h10a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4z"/></svg>
              </div>
              <div class="kv">
                <div class="k">Fuel Type</div>
                <div class="v">{{ car.fuel_type || '—' }}</div>
              </div>
            </div>
            <div class="tile">
              <div class="ico">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v4M16 2v4M3 10h18M5 22h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z"/></svg>
              </div>
              <div class="kv">
                <div class="k">Year</div>
                <div class="v">{{ car.year || '—' }}</div>
              </div>
            </div>
            <div class="tile">
              <div class="ico">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 3h16v6H4z"/><path d="M12 13v8m0 0-3-3m3 3 3-3"/></svg>
              </div>
              <div class="kv">
                <div class="k">Transmission</div>
                <div class="v">{{ car.transmission || '—' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Specs & Features block (clickable tabs) -->
        <div class="card specs-features">
          <div class="seg" role="tablist" aria-label="Details">
            <button class="seg-item" :class="{ active: activeTab==='specs' }" role="tab" aria-selected="activeTab==='specs'" @click="activeTab='specs'">Specifications</button>
            <button class="seg-item" :class="{ active: activeTab==='features' }" role="tab" aria-selected="activeTab==='features'" @click="activeTab='features'">Features</button>
          </div>

          <div class="tab-content" v-if="activeTab==='specs'">
            <div class="specs-col">
              <div class="spec-row" v-for="(pair, idx) in specPairs" :key="idx">
                <div class="cell k">{{ pair.left.label }}</div>
                <div class="cell v">{{ pair.left.value }}</div>
                <template v-if="pair.right">
                  <div class="cell k">{{ pair.right.label }}</div>
                  <div class="cell v">{{ pair.right.value }}</div>
                </template>
              </div>
            </div>
          </div>

          <div class="tab-content" v-else>
            <div class="features-col">
              <ul class="feats" v-if="featuresFlat.length">
                <li v-for="(f, i) in featuresFlat" :key="i">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#16a34a" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
                  <span>{{ f }}</span>
                </li>
              </ul>
              <div v-else class="empty">No features listed.</div>
            </div>
          </div>

          <hr class="divider" />
          <div class="card-body">
            <h3 class="h small">Vehicle Description</h3>
            <p class="desc">{{ car.description || 'No description provided.' }}</p>
          </div>
        </div>

        <!-- Similar cars -->
        <section v-if="similar.length" class="similar">
          <h2 class="h">You might also like</h2>
          <div class="grid cols-3">
            <div v-for="c in similar" :key="c.id" class="car-card card">
              <router-link :to="`/cars/${c.id}`" class="thumb">
                <img :src="thumb(c)" :alt="c.title" loading="lazy" />
              </router-link>
              <div class="card-body">
                <h3 class="title small">{{ c.title }}</h3>
                <div class="meta-row">
                  <span>{{ c.make }} • {{ c.model }} • {{ c.year }}</span>
                  <span>{{ formatPrice(c.price) }}</span>
                </div>
                <div class="meta-row">
                  <span>{{ num(c.mileage) }} km</span>
                  <span>{{ c.fuel_type }} • {{ c.transmission }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

      <!-- Right column: sticky all the way -->
      <aside class="right">
        <div class="card contact">
          <div class="card-body">
            <h3 class="h small">Contact Seller</h3>
            <div class="form">
              <label class="label">Full Name</label>
              <input class="input" v-model="form.name" placeholder="John Doe" />

              <label class="label">Email</label>
              <input class="input" type="email" v-model="form.email" placeholder="john@example.com" />

              <label class="label">Phone Number</label>
              <input class="input" v-model="form.phone" placeholder="(555) 123-4567" />

              <label class="label">Message</label>
              <textarea class="input" rows="4" v-model="form.message" :placeholder="`I'm interested in the ${car.title}.`"></textarea>

              <button class="btn primary full" :disabled="!companyEmail" @click="sendMessage">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z" fill="none"/><path d="M22 6l-10 7L2 6"/></svg>
                <span>Send Message</span>
              </button>
              <a class="btn outline full" :href="companyPhone ? `tel:${companyPhone}` : undefined">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.11 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.57 2.36a2 2 0 0 1-.45 2.11L9 10a16 16 0 0 0 5 5l.81-1.23a2 2 0 0 1 2.11-.45c.76.27 1.55.45 2.36.57A2 2 0 0 1 22 16.92z"/></svg>
                <span>Call Seller</span>
              </a>
            </div>
          </div>
        </div>

        <div class="card seller" v-if="companyEmail || companyPhone">
          <div class="card-body">
            <h3 class="h small">Seller Information</h3>
            <div class="si">
              <div class="si-row" v-if="companyEmail">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z" fill="none"/><path d="M22 6l-10 7L2 6"/></svg>
                <a :href="`mailto:${companyEmail}`">{{ companyEmail }}</a>
              </div>
              <div class="si-row" v-if="companyPhone">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.11 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.57 2.36a2 2 0 0 1-.45 2.11L9 10a16 16 0 0 0 5 5l.81-1.23a2 2 0 0 1 2.11-.45c.76.27 1.55.45 2.36.57A2 2 0 0 1 22 16.92z"/></svg>
                <a :href="`tel:${companyPhone}`">{{ companyPhone }}</a>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
  <div v-else class="container" style="padding:2rem 0;">Loading...</div>
</template>

<script setup>
import { ref, onMounted, computed, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CarsAPI, CompanyAPI, FavoritesAPI } from '../api.js';
import { useAuthStore } from '../stores/auth.js';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const isFav = ref(false);
const car = ref(null);
const similar = ref([]);
const activeIndex = ref(0);
const companyEmail = ref('info@yourdomain.com');
const companyPhone = ref('');

const form = reactive({ name: '', email: '', phone: '', message: '' });
const activeTab = ref('specs');

const activeMediaUrl = computed(() => {
  const m = car.value?.media?.[activeIndex.value];
  if (!m) return `https://picsum.photos/seed/${route.params.id}-hero/1200/700`;
  return m.type === 'image' ? m.url : `https://picsum.photos/seed/${route.params.id}-video/1200/700`;
});

function formatPrice(v) {
  try { return new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(Number(v||0)); } catch { return `${v} €`; }
}
function num(v){ try { return Number(v||0).toLocaleString('de-DE'); } catch { return v; } }
function thumb(c){ return 'https://picsum.photos/seed/' + c.id + '/800/450'; }

function shareListing(){
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const title = car.value?.title || 'Vehicle';
  if (navigator?.share) { navigator.share({ title, url }).catch(() => {}); return; }
  try { navigator.clipboard?.writeText(url); } catch {}
}

async function loadFavStatus(){
  if (!auth.user || !car.value?.id) { isFav.value = false; return; }
  try {
    const r = await FavoritesAPI.status(car.value.id);
    isFav.value = !!r.favorite;
  } catch {
    isFav.value = false;
  }
}

async function toggleFavorite(){
  try {
    if (!auth.user) {
      const redirect = encodeURIComponent(window.location.pathname);
      router.push({ name: 'login', query: { redirect } });
      return;
    }
    if (!car.value?.id) return;
    if (isFav.value) {
      await FavoritesAPI.remove(car.value.id);
      console.log('[favorite:remove]', car.value.id);
      isFav.value = false;
    } else {
      await FavoritesAPI.add(car.value.id);
      console.log('[favorite:add]', car.value.id);
      isFav.value = true;
    }
  } catch (e) {
    console.log('[favorite:toggle] failed', e?.message || e);
  }
}

// Spec lookup helpers
const specMap = computed(() => {
  const src = car.value?.specs || {}; const map = {};
  for (const [k, v] of Object.entries(src)) map[String(k).toLowerCase()] = v;
  return map;
});
function getSpec(...aliases){
  const m = specMap.value || {}; for (const a of aliases){
    const v = m[String(a).toLowerCase()]; if (v != null && String(v).trim() !== '') return v;
  } return '';
}

// Features (flat)
const featuresFlat = computed(() => (car.value?.features || []).map(f => String(f)));

// Specification entries -> 2 columns table (paired)
const specEntries = computed(() => {
  const out = [];
  const engine = getSpec('engine','engine type');
  const hp = getSpec('power','horsepower','hp');
  const torque = getSpec('torque');
  const drivetrain = getSpec('drivetrain','drive','drive type','awd','fwd','rwd','4wd');
  const trans = car.value?.transmission || getSpec('transmission','gearbox');
  const fuel = car.value?.fuel_type || getSpec('fuel','fuel type');
  const mpgCity = getSpec('mpg city','consumption city');
  const mpgHwy = getSpec('mpg highway','consumption highway');
  const range = getSpec('range');
  const extColor = car.value?.color || getSpec('exterior color','color');
  const intColor = getSpec('interior color','interior');
  const doors = getSpec('doors','number of doors') || car.value?.doors;
  const seats = getSpec('seats');
  const vin = car.value?.vin;
  const year = car.value?.year;

  const push = (label, value) => { if (value != null && String(value).trim() !== '') out.push({ label, value }); };
  push('Engine', engine);
  push('Horsepower', hp);
  push('Torque', torque);
  push('Drivetrain', drivetrain);
  push('Transmission', trans);
  push('Fuel Type', fuel);
  push('MPG City', mpgCity);
  push('MPG Highway', mpgHwy);
  push('Range', range || 'N/A');
  push('Exterior Color', extColor);
  push('Interior Color', intColor);
  push('Doors', doors);
  push('Seats', seats);
  push('VIN', vin);
  push('Year', year);
  return out;
});

const specPairs = computed(() => {
  const arr = specEntries.value.slice();
  const pairs = [];
  for (let i=0; i < arr.length; i+=2){
    pairs.push({ left: arr[i], right: arr[i+1] || null });
  }
  return pairs;
});

async function loadCar(id){
  const data = await CarsAPI.get(id);
  data.media = Array.isArray(data.media) ? data.media : [];
  car.value = data;
  activeIndex.value = 0;
  if (!form.message) form.message = `I'm interested in the ${data.title}.`;
}

async function loadSimilar(){
  if (!car.value) return;
  try{
    const params = { make: car.value.make, body_type: car.value.body_type || undefined, pageSize: 6, sort: 'created_at_desc' };
    const res = await CarsAPI.list(params);
    similar.value = (res.items || []).filter(i => i.id !== car.value.id).slice(0,3);
    if (!similar.value.length){
      const alt = await CarsAPI.list({ pageSize: 3, sort: 'created_at_desc' });
      similar.value = (alt.items || []).filter(i => i.id !== car.value.id).slice(0,3);
    }
  } catch {}
}

async function loadCompany(){
  try {
    const info = await CompanyAPI.get();
    if (info?.email) companyEmail.value = info.email;
    if (info?.phone) companyPhone.value = info.phone;
  } catch {}
}

function sendMessage(){
  const to = companyEmail.value; if (!to) return;
  const subject = `Inquiry about ${car.value?.title || 'vehicle'}`;
  const body = [
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    `Phone: ${form.phone}`,
    '',
    (form.message || `I'm interested in the ${car.value?.title}.`)
  ].join('%0D%0A');
  const href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${body}`;
  if (typeof window !== 'undefined') window.location.href = href;
}

async function init(){
  await loadCar(route.params.id);
  await Promise.all([loadCompany(), loadSimilar()]);
  await loadFavStatus();
}

onMounted(init);
watch(() => route.params.id, () => init());
</script>

<style scoped>
.car-details { padding: 1rem 0 2rem; }

/* Topbar */
.topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom: .75rem; }
.backlink { display:inline-flex; align-items:center; gap:.5rem; color:#0f172a; }
.backlink:hover { color:#0b1b2b; text-decoration: underline; }
.actions { display:flex; gap:.5rem; }
.icon-btn { width:36px; height:36px; border:1px solid #e5e7eb; border-radius:.5rem; display:grid; place-items:center; background:#fff; cursor:pointer; }
.icon-btn:hover { background:#f8fafc; }

/* Favorite button active state */
.fav-btn.active { color:#ef4444; border-color:#fecaca; background:#fff1f2; }

/* Layout */
.main-layout { grid-template-columns: 2fr 1fr; gap: 1rem; }
@media (max-width: 1020px){ .main-layout { grid-template-columns: 1fr; } }

/* Gallery */
.gallery .media-wrap { position:relative; }
.gallery .hero { width:100%; height: 460px; object-fit:cover; display:block; border-radius:.75rem .75rem 0 0; }
.gallery .flag { position:absolute; top:10px; left:10px; background:#111827; color:#fff; font-size:.75rem; padding:.25rem .5rem; border-radius:.5rem; opacity:.9; }
.thumbs { display:flex; gap:.5rem; overflow:auto; padding:.5rem; }
.tbtn { border:1px solid #e5e7eb; background:#fff; border-radius:.5rem; padding:0; overflow:hidden; width:140px; height:90px; cursor:pointer; opacity:.9; }
.tbtn:hover { opacity:1; }
.tbtn.active { opacity:1; border-color: var(--brand); }
.tbtn img { width:100%; height:100%; object-fit:cover; display:block; }
.video-tag { display:flex; align-items:center; justify-content:center; height:100%; background:#111827; color:#fff; font-size:.85rem; }

/* Title + price */
.title-card .head { display:flex; align-items:center; justify-content:space-between; }
.title-card .title { margin:.25rem 0 .25rem; font-weight:600; font-size:20px; line-height:1.2; }
.price.blue { color:#2563eb; font-weight:700; font-size: 1.8rem; letter-spacing: .5px; }

/* Tiles */
.tiles { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: .75rem; padding: 0 1rem 1rem; }
.tile { display:flex; align-items:center; gap:.6rem; padding:.75rem; border:1px solid #e5e7eb; border-radius:.75rem; background:#fff; }
.tile .ico { width:28px; height:28px; display:grid; place-items:center; border-radius:.5rem; background:#f1f5f9; color:#0f172a; }
.tile .k { font-size:.8rem; color:#64748b; }
.tile .v { font-weight:600; color:#0f172a; }
@media (max-width: 800px){ .tiles { grid-template-columns: repeat(2, minmax(0,1fr)); } }

/* Specs + features */
.specs-features .seg { display:flex; gap:.5rem; padding:.25rem; margin: 1rem; margin-top: 1rem; background:#f1f5f9; border:1px solid #e5e7eb; border-radius:999px; }
.seg-item { flex:1; text-align:center; padding:.6rem 1rem; border:0; border-radius:999px; font-weight:600; color:#64748b; background:transparent; cursor:pointer; }
.seg-item.active { background:#fff; color:#0f172a; box-shadow: 0 1px 0 rgba(0,0,0,.03); }
.tab-content { padding: 0 1rem 1rem; }

/* Spec table (two-sided like screenshot) */
.specs-col { background:#fff; }
.spec-row { position:relative; display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; border-top:1px solid #e5e7eb; }
.spec-row::before { content:""; position:absolute; top:0; bottom:0; left:50%; width:1px; background:#e5e7eb; }
.spec-row:first-child { border-top:0; }
.spec-row .cell { padding:1rem .75rem; font-size:14px; }
.spec-row .k { color:#64748b; font-weight:500; }
.spec-row .v { font-weight:700; color:#0f172a; text-align:right; }
@media (max-width: 900px){
  .spec-row { grid-template-columns: 1fr 1fr; }
  .spec-row::before { display:none; }
}

/* Features */
.features-col { background:#fff; }
.feats { list-style:none; padding:0; margin:0; display:grid; grid-template-columns: 1fr 1fr; gap:.75rem 2rem; }
@media (max-width: 900px){ .feats { grid-template-columns: 1fr; } }
.feats li { display:flex; align-items:center; gap:.5rem; padding:.45rem .25rem; }
.empty { color:#64748b; padding:.75rem 0; }

.divider { border:0; border-top:1px solid #e5e7eb; margin: 0; }

/* Similar */
.similar { margin-top: 1.5rem; }
.similar .title.small { font-size: 1.05rem; margin:.2rem 0 .3rem; }
.similar .meta-row { display:flex; align-items:center; justify-content:space-between; color:#475569; font-size:.95rem; }
.similar .car-card .thumb img { width:100%; height: 190px; object-fit: cover; display:block; }

/* Right column: sticky all the way */
.right { align-self:start; position: sticky; top: 82px; max-height: calc(100vh - 90px); overflow:auto; z-index: 1; }
@media (max-width: 1020px){ .right { position: static; max-height: none; overflow: visible; } }
.contact .form { display:grid; gap:.6rem; }
.btn.full { width:100%; justify-content:center; }
.seller .si { display:grid; gap:.4rem; }
.seller .si-row { display:flex; align-items:center; gap:.5rem; }

/* Dark theme tweaks */
[data-theme='dark'] .icon-btn { background:#0b1220; border-color:#334155; color:#cbd5e1; }
[data-theme='dark'] .icon-btn:hover { background:#0f172a; }
[data-theme='dark'] .specs-features .seg { background:#0b1220; border-color:#334155; }
[data-theme='dark'] .seg-item { color:#94a3b8; }
[data-theme='dark'] .seg-item.active { background:#0f172a; color:#e5e7eb; }
[data-theme='dark'] .fav-btn.active { color:#fca5a5; border-color:#9f1239; background:#1f0a12; }
</style>
