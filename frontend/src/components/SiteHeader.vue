<template>
  <header :class="['site-header', { scrolled }]" ref="headerEl">
    <div class="container bar">
      <!-- Brand -->
      <router-link class="brand" to="/">
        <span class="cloud" aria-hidden="true">
          <i class="fa-solid fa-car"></i>
        </span>
        <span class="brand-name">MK Automobile</span>
      </router-link>

      <!-- Nav (desktop) -->
      <nav class="nav desktop-nav">
        <router-link to="/">{{ $t('nav.home') }}</router-link>
        <router-link to="/cars">{{ $t('nav.inventory') }}</router-link>
        <router-link to="/about">{{ $t('nav.about') }}</router-link>
        <router-link to="/contact">{{ $t('nav.contact') }}</router-link>
      </nav>

      <!-- Actions (desktop) -->
      <div class="actions desktop-actions">
        <div class="lang" ref="langEl">
          <button class="icon-btn" :title="'Language'" aria-label="Language" @click.stop="langOpen = !langOpen">
            <i class="fa-solid fa-globe"></i>
          </button>
          <div v-if="langOpen" class="menu">
            <button class="menu-item" @click.stop="pickLocale('en')">English</button>
            <button class="menu-item" @click.stop="pickLocale('de')">Deutsch</button>
            <button class="menu-item" @click.stop="pickLocale('lt')">Lietuvių</button>
            <button class="menu-item" @click.stop="pickLocale('pl')">Polski</button>
            <button class="menu-item" @click.stop="pickLocale('ru')">Русский</button>
          </div>
        </div>

        <button class="icon-btn" :title="theme.mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'" aria-label="Toggle theme" @click="theme.toggle()">
          <i v-if="theme.mode === 'dark'" class="fa-solid fa-moon"></i>
          <i v-else class="fa-solid fa-sun"></i>
        </button>
        <template v-if="auth.user">
          <router-link v-if="['owner','admin','employee'].includes(auth.user.role)" class="btn small" to="/admin">Admin</router-link>
          <div class="profile" ref="profileEl" @click.stop="toggleProfile">
            <Avatar :seed="auth.user.email || auth.user.name" :size="30" />
            <span class="name">{{ auth.user.name }}</span>
            <div v-if="profileOpen" class="menu">
              <router-link class="menu-item" to="/profile" @click.stop="profileOpen=false">{{ $t('auth.profile') }}</router-link>
              <button class="menu-item danger" @click.stop="logout">{{ $t('auth.logout') }}</button>
            </div>
          </div>
        </template>
        <template v-else>
          <router-link class="btn small primary" to="/login">
            <i class="fa-solid fa-user" aria-hidden="true"></i>
            <span>{{ $t('auth.login') }}</span>
          </router-link>
        </template>
      </div>

      <!-- Burger menu button (mobile) -->
      <button class="burger" @click="open = !open" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </header>

  <!-- Mobile menu overlay -->
  <Teleport to="body">
    <div v-if="open" class="mobile-overlay" @click="open = false"></div>
    
    <!-- Mobile menu -->
    <div :class="['mobile-menu', { open }]">
      <nav class="mobile-nav">
        <router-link to="/" @click="open = false">{{ $t('nav.home') }}</router-link>
        <router-link to="/cars" @click="open = false">{{ $t('nav.inventory') }}</router-link>
        <router-link to="/about" @click="open = false">{{ $t('nav.about') }}</router-link>
        <router-link to="/contact" @click="open = false">{{ $t('nav.contact') }}</router-link>
      </nav>

      <div class="mobile-divider"></div>

      <!-- Mobile theme & language (two columns) -->
      <div class="mobile-settings-container">
        <!-- Theme Column -->
        <div class="mobile-settings-column">
          <div class="mobile-section-label">Theme</div>
          <button class="mobile-theme-icon-btn" @click="theme.toggle()" :title="theme.mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'">
            <i v-if="theme.mode === 'dark'" class="fa-solid fa-moon"></i>
            <i v-else class="fa-solid fa-sun"></i>
          </button>
        </div>

        <!-- Languages Column -->
        <div class="mobile-settings-column">
          <div class="mobile-section-label">Languages</div>
          <div class="mobile-lang-row">
            <button class="mobile-lang-btn" :class="{ active: localeStore.current === 'en' }" @click="pickLocaleMobile('en')" title="English">EN</button>
            <button class="mobile-lang-btn" :class="{ active: localeStore.current === 'de' }" @click="pickLocaleMobile('de')" title="Deutsch">DE</button>
            <button class="mobile-lang-btn" :class="{ active: localeStore.current === 'lt' }" @click="pickLocaleMobile('lt')" title="Lietuvių">LT</button>
            <button class="mobile-lang-btn" :class="{ active: localeStore.current === 'pl' }" @click="pickLocaleMobile('pl')" title="Polski">PL</button>
            <button class="mobile-lang-btn" :class="{ active: localeStore.current === 'ru' }" @click="pickLocaleMobile('ru')" title="Русский">RU</button>
          </div>
        </div>
      </div>

      <div class="mobile-divider"></div>

      <!-- Mobile auth section -->
      <div class="mobile-section">
        <template v-if="auth.user">
          <div class="mobile-auth-row">
            <router-link class="mobile-btn" to="/profile" @click="open = false">
              <i class="fa-solid fa-user"></i>
              <span>{{ $t('auth.profile') }}</span>
            </router-link>
            <router-link v-if="['owner','admin','employee'].includes(auth.user.role)" class="mobile-btn" to="/admin" @click="open = false">
              <i class="fa-solid fa-shield-halved"></i>
              <span>Admin</span>
            </router-link>
            <button class="mobile-btn danger" @click="logout">
              <i class="fa-solid fa-right-from-bracket"></i>
              <span>{{ $t('auth.logout') }}</span>
            </button>
          </div>
        </template>
        <template v-else>
          <router-link class="mobile-btn primary" to="/login" @click="open = false">
            <i class="fa-solid fa-user"></i>
            <span>{{ $t('auth.login') }}</span>
          </router-link>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import { useThemeStore } from '../stores/theme.js';
import { useLocaleStore } from '../stores/locale.js';
import Avatar from './Avatar.vue';

const router = useRouter();
const auth = useAuthStore();
const theme = useThemeStore();
const localeStore = useLocaleStore();

const open = ref(false);
const scrolled = ref(false);
const profileOpen = ref(false);
const profileEl = ref(null);
const headerEl = ref(null);

const langOpen = ref(false);
const langEl = ref(null);

function handleScroll() {
  scrolled.value = window.scrollY > 4;
}

function onDocClick(e) {
  if (profileEl.value && !profileEl.value.contains(e.target)) profileOpen.value = false;
  if (langEl.value && !langEl.value.contains(e.target)) langOpen.value = false;
  
  // Close mobile menu when clicking outside header
  if (headerEl.value && !headerEl.value.contains(e.target) && open.value) {
    open.value = false;
  }
}

function toggleProfile() {
  profileOpen.value = !profileOpen.value;
}

function pickLocale(code) {
  localeStore.set(code);
  langOpen.value = false;
}

function pickLocaleMobile(code) {
  localeStore.set(code);
}

onMounted(() => {
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('click', onDocClick, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', onDocClick);
});

function logout() {
  auth.logout();
  profileOpen.value = false;
  open.value = false;
  router.push('/');
}
</script>

<style scoped>
.site-header {
  background: rgba(255,255,255,.64);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
  backdrop-filter: saturate(200%) blur(1px);
  border-bottom:1px solid rgba(226,232,240,.55);
  position:sticky; top:0; z-index:50;
  transition: background .2s ease, box-shadow .2s ease, border-color .2s ease, backdrop-filter .2s ease;
}
.site-header.scrolled {
  background: rgba(255,255,255,.86);
  box-shadow: 0 8px 28px rgba(2,6,23,.10);
  border-bottom-color: rgba(226,232,240,0);
}

.bar { display:grid; grid-template-columns: auto 1fr auto; align-items:center; gap:1rem; padding:.6rem 1rem; }

/* Brand */
.brand { display:inline-flex; align-items:center; gap:.5rem; text-decoration:none; color:#0f172a; font-weight:700; }
.brand:hover .brand-name { color:#0b1b2b; }
.cloud { color:#1d4ed8; background:#eff6ff; border:1px solid #e5e7eb; width:28px; height:28px; border-radius:8px; display:grid; place-items:center; transition: transform .18s ease, box-shadow .18s ease; font-size: 16px; }
.brand:hover .cloud { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(2,6,23,.06); }
.brand-name { font-weight:700; transition:color .18s ease; }

/* Nav */
.nav { display:flex; justify-content:center; gap:.25rem; }
.nav a { color:#0f172a; text-decoration:none; padding:.45rem .65rem; border-radius:.5rem; font-weight:500; position:relative; transition: color .18s ease, background-color .18s ease; }
.nav a::after { content:''; position:absolute; left:.65rem; right:.65rem; bottom:6px; height:2px; background:#2563eb; transform:scaleX(0); transform-origin:left; transition: transform .18s ease; border-radius:2px; }
.nav a:hover { color:#0b1b2b; background:#f8fafc; }
.nav a:hover::after, .nav a.router-link-active::after { transform:scaleX(1); }
.nav a.router-link-active { background:#f1f5f9; border:1px solid #e2e8f0; }

/* Actions */
.actions { display:flex; align-items:center; gap:.5rem; }
.icon-btn { width:30px; height:30px; display:grid; place-items:center; border:1px solid #e5e7eb; border-radius:.5rem; background:#fff; color:#475569; transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease, background-color .16s ease; font-size: 14px; }
.icon-btn:hover { transform: translateY(-1px); border-color:#cbd5e1; background:#f8fafc; box-shadow: 0 2px 6px rgba(2,6,23,.06); }
.icon-btn:active { transform: translateY(0); box-shadow: inset 0 1px 3px rgba(2,6,23,.08); }
.icon-btn .fa-sun { color: #fbbf24; }
.icon-btn .fa-moon { color: #94a3b8; }
.icon-btn .fa-globe { color: #3b82f6; }

.lang { position: relative; }
.lang .menu { position:absolute; right:0; top:110%; background:#fff; border:1px solid #e5e7eb; border-radius:.5rem; box-shadow: 0 12px 24px rgba(2,6,23,.10); padding:.25rem; min-width:160px; z-index:60; }

.btn.small { padding:.4rem .6rem; font-size:.9rem; border-radius:.45rem; border:1px solid transparent; transition: background-color .16s ease, color .16s ease, border-color .16s ease, transform .1s ease, box-shadow .16s ease; display:inline-flex; align-items:center; gap:.35rem; text-decoration:none; font-weight:600; }
.btn.small i { font-size: 14px; }
.btn.small.primary { background:#2563eb; color:#fff; }
.btn.small.primary:hover { background:#1d4ed8; transform: translateY(-1px); }
.btn.small.outline { background:#fff; color:#0f172a; border-color:#cbd5e1; }
.btn.small.outline:hover { background:#f8fafc; }

/* Admin button - make it stand out with core blue */
.actions .btn.small[href="/admin"] {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.actions .btn.small[href="/admin"]:hover {
  background: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  transform: translateY(-1px);
}

/* Profile */
.profile { position: relative; display:flex; align-items:center; gap:.5rem; padding:.2rem .4rem; border-radius:.5rem; cursor:pointer; border:1px solid #e5e7eb; background:#fff; }
.profile:hover { border-color:#cbd5e1; background:#f8fafc; }
.profile .name { color:#0f172a; font-weight:500; white-space:nowrap; }
.menu { position:absolute; right:0; top:110%; background:#fff; border:1px solid #e5e7eb; border-radius:.5rem; box-shadow: 0 12px 24px rgba(2,6,23,.10); padding:.25rem; min-width:140px; z-index:60; }
.menu-item { display:block; width:100%; text-align:left; background:#fff; border:none; padding:.45rem .6rem; border-radius:.35rem; cursor:pointer; color:#0f172a; text-decoration:none; font-weight:500; font-size:14px; }
.menu-item:hover { background:#f1f5f9; }
.menu-item.danger { color:#dc2626; }
.menu-item.danger:hover { background:#fef2f2; color:#b91c1c; }

/* Burger */
.burger { display:none; background:none; border:none; cursor:pointer; transition: transform .16s ease; padding:.25rem; }
.burger:hover { transform: translateY(-1px); }
.burger span { display:block; width:22px; height:2px; background:#0f172a; margin:4px 0; border-radius:2px; transition: all .2s ease; }

/* Mobile menu overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Mobile menu */
.mobile-menu {
  position: fixed;
  left: 0;
  right: 0;
  top: 48px;
  height: 55vh;
  max-height: 500px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 8px 32px rgba(2,6,23,.15);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  z-index: 9999;
  padding-top: 1rem;
}

.mobile-menu.open {
  transform: translateX(0);
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  padding: .5rem 0;
}

.mobile-nav a {
  color: #0f172a;
  text-decoration: none;
  padding: .75rem 1.5rem;
  font-weight: 500;
  transition: background-color .18s ease, color .18s ease;
  text-align: center;
  width: 100%;
}

.mobile-nav a:hover {
  background: #f8fafc;
  color: #0b1b2b;
}

.mobile-nav a.router-link-active {
  background: #eff6ff;
  color: #2563eb;
}

.mobile-divider {
  height: 1px;
  background: #e5e7eb;
  margin: .5rem 0;
}

.mobile-section {
  padding: .5rem;
}

.mobile-section-label {
  font-size: .75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
  padding: .5rem 1rem .25rem;
  letter-spacing: .05em;
}

.mobile-btn {
  display: flex;
  align-items: center;
  gap: .5rem;
  width: 100%;
  padding: .75rem 1rem;
  background: none;
  border: none;
  border-radius: .5rem;
  color: #0f172a;
  font-weight: 500;
  font-size: .95rem;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background-color .18s ease, color .18s ease;
}
.mobile-btn i { font-size: 16px; }

.mobile-btn:hover {
  background: #f8fafc;
}

.mobile-btn.active {
  background: #eff6ff;
  color: #2563eb;
}

.mobile-btn.primary {
  background: #2563eb;
  color: #fff;
  font-weight: 600;
  justify-content: center;
}

.mobile-btn.primary:hover {
  background: #1d4ed8;
}

.mobile-btn.danger {
  color: #dc2626;
}

.mobile-btn.danger:hover {
  background: #fef2f2;
}

.mobile-settings-container {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4rem;
  padding: .5rem 1rem;
}

.mobile-settings-column {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.mobile-settings-column .mobile-section-label {
  padding: 0;
  margin-bottom: .25rem;
}

.mobile-theme-icon-btn {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border: 1px solid #e5e7eb;
  border-radius: .5rem;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  transition: all .18s ease;
  font-size: 18px;
}

.mobile-theme-icon-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #475569;
}

.mobile-theme-icon-btn .fa-sun { color: #fbbf24; }
.mobile-theme-icon-btn .fa-moon { color: #94a3b8; }

.mobile-lang-row {
  display: flex;
  gap: .4rem;
  flex-wrap: nowrap;
}

.mobile-lang-btn {
  width: 48px;
  height: 48px;
  padding: 0;
  font-size: .75rem;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  border-radius: .5rem;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  transition: all .18s ease;
  text-align: center;
  display: grid;
  place-items: center;
}

.mobile-lang-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #475569;
}

.mobile-lang-btn.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.mobile-auth-row {
  display: flex;
  gap: .5rem;
  justify-content: center;
}

.mobile-auth-row .mobile-btn {
  width: auto;
}

/* Responsive */
@media (max-width: 900px) {
  .bar { grid-template-columns: 1fr auto; }
  .burger { display: block; }
  .desktop-nav { display: none; }
  .desktop-actions { display: none; }
}

@media (min-width: 901px) {
  .mobile-menu,
  .mobile-overlay {
    display: none !important;
  }
}
</style>
