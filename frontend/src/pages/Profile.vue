<template>
  <div class="container profile-page" v-if="user">
    <!-- Header Card -->
    <section class="profile-header card">
      <div class="ph-left">
        <Avatar :seed="user.email || user.name" :size="72" />
        <div class="meta">
          <div class="name">{{ user.name }}</div>
          <div class="email">{{ user.email }}</div>
          <div class="date" v-if="user.created_at">Member since {{ fmtDate(user.created_at) }}</div>
        </div>
      </div>
      <div class="ph-right">
        <div class="pill">{{ favorites.length }} Favorites</div>
        <button class="btn outline" @click="doLogout">Logout</button>
      </div>
    </section>

    <!-- Tabs -->
    <div class="tabs card">
      <button class="tab" :class="{active: activeTab==='favorites'}" @click="activeTab='favorites'">
        <span class="icon">❤</span>
        <span>Favorites</span>
      </button>
      <button class="tab" :class="{active: activeTab==='account'}" @click="activeTab='account'">
        <span class="icon">⚙</span>
        <span>Account Settings</span>
      </button>
      <button class="tab" :class="{active: activeTab==='notifications'}" @click="activeTab='notifications'">
        <span class="icon">🔔</span>
        <span>Notifications</span>
      </button>
    </div>

    <!-- Favorites -->
    <section v-show="activeTab==='favorites'" class="card panel">
      <div v-if="loadingFavs" class="loading">Loading favorites...</div>
      <div v-else-if="!favorites.length" class="empty">
        <div class="empty-inner">
          <div class="heart">♡</div>
          <h3>No Favorites Yet</h3>
          <p class="muted">Start adding vehicles to your favorites to keep track of them</p>
          <router-link to="/cars" class="btn">Browse Inventory</router-link>
        </div>
      </div>
      <div v-else class="grid cols-4">
        <div v-for="c in favorites" :key="c.id" class="car-card card">
          <router-link :to="`/cars/${c.id}`" class="thumb">
            <img :src="c.thumb_url || ('https://picsum.photos/seed/' + c.id + '/800/450')" :alt="c.title" loading="lazy" />
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
                class="favorite-btn is-favorite"
                @click="removeFavorite(c.id)"
                title="Remove from favorites"
              >
                <i class="fa-solid fa-heart"></i>
              </button>
              <span class="detail-item price">
                {{ formatPrice(c.price) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Account Settings -->
    <section v-show="activeTab==='account'" class="account panel">
      <div class="card section">
        <div class="section-head">
          <h3>Personal Information</h3>
          <button class="btn outline small" @click="editing = !editing">{{ editing ? 'Stop Editing' : 'Edit Profile' }}</button>
        </div>
        <div class="grid two">
          <div>
            <label class="label">Full Name</label>
            <input class="input" v-model="nameEdit" :disabled="!editing" placeholder="Your name" />
          </div>
          <div>
            <label class="label">Email</label>
            <input class="input" :value="user.email" disabled />
          </div>
          <div>
            <label class="label">Phone Number</label>
            <input class="input" placeholder="+1 (555) 123-4567" disabled />
          </div>
          <div>
            <label class="label">Location</label>
            <input class="input" placeholder="City, Country" disabled />
          </div>
        </div>
        <div class="actions">
          <button class="btn small" :disabled="savingName || !editing" @click="saveName">{{ savingName ? 'Saving…' : 'Save Changes' }}</button>
          <span class="msg" v-if="nameMsg">{{ nameMsg }}</span>
        </div>
      </div>

      <div class="card section">
        <h3>Change Password</h3>
        <div class="grid two">
          <div>
            <label class="label">Current Password</label>
            <input class="input" type="password" v-model="pwdCurrent" placeholder="Current password" />
          </div>
          <div>
            <label class="label">Confirm Password</label>
            <input class="input" type="password" v-model="pwdConfirm" placeholder="Repeat new password" />
          </div>
          <div>
            <label class="label">New Password</label>
            <input class="input" type="password" v-model="pwdNew" placeholder="New password (min 6)" />
          </div>
        </div>
        <div class="actions">
          <button class="btn small" :disabled="savingPwd" @click="changePwd">{{ savingPwd ? 'Updating…' : 'Update Password' }}</button>
          <span class="msg" :class="{ error: !!pwdErr }">{{ pwdMsg }}</span>
        </div>
      </div>

      <div class="card section danger">
        <div class="danger-inner">
          <div>
            <h4>Delete Account</h4>
            <p>Permanently delete your account and all data</p>
          </div>
          <button class="btn danger" @click="confirmDelete">Delete Account</button>
        </div>
      </div>
    </section>

    <!-- Notifications -->
    <section v-show="activeTab==='notifications'" class="panel settings-panel">
      <div class="card section">
        <h3>Email Notifications</h3>
        <div class="list">
          <div class="row">
            <div>
              <div class="item-title">Email Notifications</div>
              <div class="muted">Receive notifications via email</div>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="prefs.email_notifications" @change="savePrefs" :disabled="prefs.saving" />
              <span></span>
            </label>
          </div>
          <hr />
          <div class="row">
            <div>
              <div class="item-title">New Listings</div>
              <div class="muted">Get notified when new cars matching your preferences are listed</div>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="prefs.new_listings" @change="savePrefs" :disabled="prefs.saving || !prefs.email_notifications" />
              <span></span>
            </label>
          </div>
        </div>
      </div>
    </section>
  </div>
  <div v-else class="container" style="padding:2rem 0;">Loading...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { AuthAPI, FavoritesAPI, NewsletterAPI } from '../api.js';
import { useAuthStore } from '../stores/auth.js';
import Avatar from '../components/Avatar.vue';

const router = useRouter();
const auth = useAuthStore();

const activeTab = ref('favorites');

// User
const user = ref(null);
async function loadUser(){
  try { const res = await AuthAPI.me(); user.value = res.user || null; nameEdit.value = user.value?.name || ''; }
  catch { user.value = null; }
}

// Favorites
const favorites = ref([]);
const loadingFavs = ref(true);
async function loadFavorites(){
  loadingFavs.value = true;
  try { const res = await FavoritesAPI.list(); favorites.value = res.items || []; }
  catch { favorites.value = []; }
  finally { loadingFavs.value = false; }
}
async function removeFavorite(id){
  try { await FavoritesAPI.remove(id); favorites.value = favorites.value.filter(x=>x.id!==id); }
  catch(_){}
}

// Account settings
const editing = ref(false);
const nameEdit = ref('');
const savingName = ref(false);
const nameMsg = ref('');
const pwdCurrent = ref('');
const pwdNew = ref('');
const pwdConfirm = ref('');
const savingPwd = ref(false);
const pwdMsg = ref('');
const pwdErr = ref(false);

async function saveName(){
  if (!editing.value) return;
  if (!nameEdit.value || nameEdit.value === user.value?.name) { nameMsg.value = 'No changes to save.'; return; }
  savingName.value = true; nameMsg.value = '';
  try {
    const res = await AuthAPI.updateMe({ name: nameEdit.value.trim() });
    user.value = res.user; auth.setToken(res.token); nameMsg.value = 'Profile updated.'; editing.value = false;
  } catch (e) {
    nameMsg.value = e?.response?.data?.error || 'Update failed';
  } finally { savingName.value = false; }
}

async function changePwd(){
  if (pwdNew.value !== pwdConfirm.value) { pwdErr.value = true; pwdMsg.value = 'Passwords do not match'; return; }
  pwdMsg.value = ''; pwdErr.value = false; savingPwd.value = true;
  try { await AuthAPI.changePassword({ current_password: pwdCurrent.value, new_password: pwdNew.value }); pwdMsg.value='Password updated.'; pwdCurrent.value=''; pwdNew.value=''; pwdConfirm.value=''; }
  catch(e){ pwdErr.value=true; pwdMsg.value = e?.response?.data?.error || 'Update failed'; }
  finally { savingPwd.value=false; }
}

async function confirmDelete(){
  if (!confirm('This action will permanently delete your account. Continue?')) return;
  try {
    await AuthAPI.deleteMe();
    auth.logout();
    router.push('/register');
  } catch (e) {
    alert('Delete failed: ' + (e?.response?.data?.error || e?.message || 'unknown'));
  }
}

// Notifications prefs (newsletter)
const prefs = ref({ loading: true, saving: false, email_notifications: false, new_listings: false });
async function loadPrefs(){
  prefs.value.loading = true;
  try {
    const res = await NewsletterAPI.me();
    prefs.value.email_notifications = !!res.email_notifications;
    prefs.value.new_listings = !!res.new_listings;
  } catch (_) {
    prefs.value.email_notifications = false;
    prefs.value.new_listings = false;
  } finally { prefs.value.loading = false; }
}
async function savePrefs(){
  prefs.value.saving = true;
  try {
    if (!prefs.value.email_notifications) prefs.value.new_listings = false;
    await NewsletterAPI.preferences({ email_notifications: prefs.value.email_notifications, new_listings: prefs.value.new_listings });
  } catch (_){
  } finally { prefs.value.saving = false; }
}

function doLogout(){ auth.logout(); router.push('/login'); }

function fmtDate(d){ try { return new Date(d).toLocaleDateString(); } catch { return d; } }
function formatPrice(v){ try { return new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(Number(v||0)); } catch { return `${v} €`; } }
function num(v){ try { return Number(v||0).toLocaleString('de-DE'); } catch { return v; } }

onMounted(async ()=>{ await loadUser(); await Promise.all([loadFavorites(), loadPrefs()]); });
</script>

<style scoped>
.profile-page{ padding:1rem 0 2rem; }

.profile-header{ display:flex; align-items:center; justify-content:space-between; padding:1rem; margin-bottom:1rem; width:100%; }
.ph-left{ display:flex; align-items:center; gap:.9rem; }
.profile-header .meta .name{ font-weight:700; font-size:1.2rem; color:#0f172a; }
.profile-header .meta .email{ color:#334155; }
.profile-header .meta .date{ color:#64748b; font-size:.95rem; }
.ph-right{ display:flex; align-items:center; gap:.5rem; }
.pill{ background:#f1f5f9; border:1px solid #e5e7eb; padding:.35rem .6rem; border-radius:999px; font-size:.9rem; color:#0f172a; }

.tabs{ display:flex; gap:.5rem; padding:.25rem; margin-bottom:1rem; width:100%; }
.tab{ flex:1; display:flex; align-items:center; justify-content:center; gap:.5rem; padding:.5rem .75rem; border-radius:.75rem; border:1px solid #e5e7eb; background:#f3f4f6; font-weight:600; }
.tab.active{ background:#fff; }

.panel{ padding:0; margin-bottom:1rem; width:100%; display:flex; flex-direction:column; gap:1rem; }

/* Favorites cards - using same styling as Cars page */
.grid{ display:grid; gap:1rem; }
.cols-3{ grid-template-columns: repeat(3, 1fr); }
@media (max-width: 1020px){ .cols-3{ grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px){ .cols-3{ grid-template-columns: 1fr; } }

.car-card{ transition: transform .16s ease, box-shadow .16s ease; border-radius:.75rem; overflow:hidden; }
.car-card:hover{ transform: translateY(-2px); box-shadow: 0 10px 24px rgba(2,6,23,.10); }
.car-card .thumb { display: block; text-decoration: none; overflow: hidden; }
.car-card .thumb img { width:100%; height: 190px; object-fit: cover; display:block; transition: transform .2s ease; }
.car-card .thumb:hover img { transform: scale(1.05); }
.car-card .card-body { display: flex; flex-direction: column; justify-content: space-between; min-height: 160px; }
.car-card .card-content { display: flex; flex-direction: column; gap: .5rem; }
.car-card .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: .5rem; border-top: 1px solid #e5e7eb; margin-top: .5rem; }
.car-card .title { margin: 0; font-size: 1.1rem; font-weight: 600; color: var(--text); line-height: 1.3; }
.car-card .details-row { display: flex; align-items: center; justify-content: space-between; gap: .5rem; min-height: 1.5rem; }
.car-card .detail-item { display: inline-flex; align-items: center; gap: .4rem; color: #64748b; font-size: .875rem; line-height: 1.5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.car-card .detail-item i { flex-shrink: 0; color: #94a3b8; font-size: .75rem; width: 14px; text-align: center; display: inline-flex; align-items: center; justify-content: center; }
.car-card .detail-item.price { font-weight: 600; color: var(--brand); font-size: 1.1rem; }
.car-card .favorite-btn { background: none; border: none; padding: 0; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; transition: transform .2s ease; }
.car-card .favorite-btn:hover { transform: scale(1.15); }
.car-card .favorite-btn i { font-size: 1.1rem; color: #94a3b8; transition: color .2s ease; }
.car-card .favorite-btn:hover i { color: #ef4444; }
.car-card .favorite-btn.is-favorite i { color: #ef4444; }

@media (max-width: 768px) {
  .car-card .card-content { gap: .4rem; }
  .car-card .details-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .4rem .5rem;
    min-height: auto;
  }
  .car-card .details-row:last-of-type {
    grid-template-columns: 1fr;
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

/* Account */
.section{ padding:1rem; }
/* Make inner cards full width and add vertical spacing between them */
.profile-page .panel .section.card{ width:100% !important; margin:0 !important; }
/* Use flex gap to ensure consistent spacing between cards */
.account.panel, .settings-panel{ display:flex; flex-direction:column; gap:1rem; }
.panel .section + .section{ margin-top:1rem; }
/* Fallback spacing for stacked inner cards if flex gap is not applied */
.profile-page .panel > .card.section + .card.section{ margin-top:1rem; }
/* Ensure inner cards match container width exactly like header card */
.profile-page .account.panel > .card, .profile-page .settings-panel > .card { width:100%; margin:0; }
/* Explicit spacing between consecutive inner cards */
.profile-page .account.panel > .card + .card, .profile-page .settings-panel > .card + .card { margin-top:1rem; }
.section-head{ display:flex; align-items:center; justify-content:space-between; }
@media (max-width: 640px){
  .profile-page .panel .section.card{ width:100%; margin:0; }
}
.grid.two{ display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
@media (max-width: 720px){ .grid.two{ grid-template-columns:1fr; } }
.actions{ display:flex; align-items:center; gap:.6rem; margin-top:.5rem; }
.msg{ color:#64748b; font-size:.9rem; }
.msg.error{ color:#b91c1c; }
.danger{ border:1px solid #fecaca; background:#fff1f2; }
.danger-inner{ display:flex; align-items:center; justify-content:space-between; gap:1rem; }
.btn.danger{ background:#dc2626; color:#fff; border-color:#991b1b; }

/* Empty */
.empty{ border:2px dashed #e2e8f0; border-radius:.75rem; height: 300px; display:grid; place-items:center; color:#475569; }
.empty-inner{ text-align:center; }
.empty .heart{ font-size:48px; color:#94a3b8; }

/* Switch */
.list{ display:flex; flex-direction:column; gap:.25rem; }
.row{ display:flex; align-items:center; justify-content:space-between; gap:.75rem; padding:.5rem 0; }
.item-title{ font-weight:600; }
.switch{ position:relative; width:48px; height:28px; display:inline-block; }
.switch input{ display:none; }
.switch span{ position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:#e5e7eb; border-radius:999px; transition:.15s; }
.switch span:before{ content:""; position:absolute; height:22px; width:22px; left:3px; top:3px; background:white; border-radius:50%; transition:.15s; box-shadow:0 1px 2px rgba(0,0,0,.2); }
.switch input:checked + span{ background:#262b72; }
.switch input:checked + span:before{ transform: translateX(20px); }

/* Dark theme tweaks */
[data-theme='dark'] .tab{ background:#0b1220; border-color:#334155; color:#cbd5e1; }
[data-theme='dark'] .tab.active{ background:#0f172a; box-shadow: inset 0 0 0 2px #cbd5e1; border-color:#cbd5e1; }
[data-theme='dark'] .pill{ background:#0b1220; border-color:#334155; color:#cbd5e1; }

/* Final alignment overrides to match screenshot */
.profile-page .panel{ padding-left:0; padding-right:0; }
.profile-page .panel > .card{ width:100% !important; margin:0 !important; }
.profile-page .panel > .card + .card{ margin-top:1rem; }

</style>
