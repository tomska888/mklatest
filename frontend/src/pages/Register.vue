<template>
  <div class="auth-wrap">
    <!-- Left brand/benefits panel -->
    <section class="auth-left">
      <div class="brand">
        <div class="logo">
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <rect x="3" y="6" width="18" height="12" rx="3" fill="#fff"/>
            <path d="M7 15h10M6 11h12M9 9l2 2M15 9l-2 2" stroke="#111827" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div>
          <div class="brand-name">MK Automobile</div>
        </div>
      </div>

      <h1 class="headline">{{ $t('auth.register.headline') }}</h1>
      <p class="subhead">{{ $t('auth.register.subhead') }}</p>

      <ul class="benefits green">
        <li>
          <span class="tick"></span>
          <div>
            <div class="b-title">{{ $t('auth.register.benefits.exclusive_title') }}</div>
            <div class="b-sub">{{ $t('auth.register.benefits.exclusive_sub') }}</div>
          </div>
        </li>
        <li>
          <span class="tick"></span>
          <div>
            <div class="b-title">{{ $t('auth.register.benefits.favorites_title') }}</div>
            <div class="b-sub">{{ $t('auth.register.benefits.favorites_sub') }}</div>
          </div>
        </li>
        <li>
          <span class="tick"></span>
          <div>
            <div class="b-title">{{ $t('auth.register.benefits.offers_title') }}</div>
            <div class="b-sub">{{ $t('auth.register.benefits.offers_sub') }}</div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Right form card -->
    <section class="auth-right card">
      <div class="card-body">
        <h2 class="form-title">{{ $t('auth.register.form.title') }}</h2>
        <p class="form-sub">{{ $t('auth.register.form.sub') }}</p>

        <form @submit.prevent="submit" class="form">
          <label class="label">{{ $t('auth.register.form.fullName') }}</label>
          <input class="input" type="text" v-model="name" required minlength="2" placeholder="John Doe" />

          <label class="label mt">{{ $t('auth.register.form.email') }}</label>
          <div class="field with-icon">
            <span class="icon">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M20 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Zm0 2v.01L12 13 4 8.01V8h16ZM4 16V9.24l7.4 4.63a1 1 0 0 0 1.2 0L20 9.24V16H4Z"/></svg>
            </span>
            <input class="input" type="email" v-model="email" required placeholder="name@example.com" />
          </div>

          <label class="label mt">{{ $t('auth.register.form.phone') }}</label>
          <div class="field with-icon">
            <span class="icon">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.07 21 3 13.93 3 5a1 1 0 0 1 1-1h2.49a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.24 1.02l-1.2 1.2Z"/></svg>
            </span>
            <input class="input" type="tel" v-model="phone" placeholder="(+49 000-000-0000)" />
          </div>

          <label class="label mt">{{ $t('auth.register.form.password') }}</label>
          <div class="field with-icon">
            <span class="icon">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M17 8h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-6 8.73V17a1 1 0 1 1 2 0v-.27a2 2 0 1 1-2 0ZM9 8V6a3 3 0 1 1 6 0v2H9Z"/></svg>
            </span>
            <input :type="showPassword ? 'text' : 'password'" class="input" v-model="password" required minlength="6" placeholder="••••••••" />
            <button class="eye" type="button" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Hide password' : 'Show password'">
              <svg v-if="!showPassword" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/></svg>
              <svg v-else viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M2 3.27 3.28 2 22 20.72 20.73 22l-2.47-2.47A12.72 12.72 0 0 1 12 19C5 19 2 12 2 12a21.54 21.54 0 0 1 5.37-6.94L2 3.27ZM12 7a5 5 0 0 1 4.58 7.02l-1.49-1.49A3 3 0 0 0 9.47 9.9L7.4 7.83A5 5 0 0 1 12 7Zm0 10c2.4 0 4.3-1.14 5.74-2.48l-1.46-1.46A5 5 0 0 1 7.94 8.22 16.1 16.1 0 0 0 4.62 12s2.84 5 7.38 5Z"/></svg>
            </button>
          </div>

          <label class="label mt">{{ $t('auth.register.form.confirmPassword') }}</label>
          <div class="field with-icon">
            <span class="icon">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M17 8h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-6 8.73V17a1 1 0 1 1 2 0v-.27a2 2 0 1 1-2 0ZM9 8V6a3 3 0 1 1 6 0v2H9Z"/></svg>
            </span>
            <input :type="showConfirm ? 'text' : 'password'" class="input" v-model="confirm" required minlength="6" placeholder="••••••••" />
            <button class="eye" type="button" @click="showConfirm = !showConfirm" :aria-label="showConfirm ? 'Hide password' : 'Show password'">
              <svg v-if="!showConfirm" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/></svg>
              <svg v-else viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M2 3.27 3.28 2 22 20.72 20.73 22l-2.47-2.47A12.72 12.72 0 0 1 12 19C5 19 2 12 2 12a21.54 21.54 0 0 1 5.37-6.94L2 3.27ZM12 7a5 5 0 0 1 4.58 7.02l-1.49-1.49A3 3 0 0 0 9.47 9.9L7.4 7.83A5 5 0 0 1 12 7Zm0 10c2.4 0 4.3-1.14 5.74-2.48l-1.46-1.46A5 5 0 0 1 7.94 8.22 16.1 16.1 0 0 0 4.62 12s2.84 5 7.38 5Z"/></svg>
            </button>
          </div>

          <button class="btn primary block mt" :disabled="loading">{{ loading ? $t('auth.register.form.creating') : $t('auth.register.form.createAccount') }}</button>

          <p class="helper center">{{ $t('auth.register.form.already') }} <router-link class="link" to="/login">{{ $t('auth.register.form.signIn') }}</router-link></p>

          <p v-if="error" class="err">{{ error }}</p>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { AuthAPI } from '../api.js';
import { useAuthStore } from '../stores/auth.js';

const router = useRouter();
const auth = useAuthStore();
const { t } = useI18n();

const name = ref('');
const email = ref('');
const phone = ref('');
const password = ref('');
const confirm = ref('');
const showPassword = ref(false);
const showConfirm = ref(false);
const loading = ref(false);
const error = ref('');

async function submit() {
  if (loading.value) return;
  if (password.value !== confirm.value) {
    error.value = String(t('auth.register.form.passwordsNoMatch'));
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const { token } = await AuthAPI.register({ name: name.value, email: email.value, phone: phone.value || undefined, password: password.value });
    auth.setToken(token);
    router.replace('/');
  } catch (e) {
    error.value = e?.response?.data?.error || String(t('auth.register.form.failed'));
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-wrap { display:flex; gap:2rem; align-items:stretch; justify-content:center; padding:40px 16px; }
.auth-left { flex:1 1 48%; min-width:320px; max-width:760px; padding:32px 24px 32px 48px; background:linear-gradient(135deg,#f3fdf7 0%, #ffffff 60%); border-radius:18px; box-shadow: 0 20px 60px rgba(17,24,39,.08) inset; }
.brand { display:flex; align-items:center; gap:12px; margin-bottom:18px; }
.logo { width:44px; height:44px; display:grid; place-items:center; border-radius:12px; background:#2563eb; color:#111827; box-shadow: 0 8px 20px rgba(37,99,235,.35); }
.brand-name { font-size:22px; font-weight:700; color:#0b1220; }
.brand-sub { color:#64748b; margin-top:2px; }
.headline { font-size:44px; margin:22px 0 6px; color:#0b1220; font-weight:800; letter-spacing:.2px; }
.subhead { color:#475569; font-size:16px; }
.benefits { list-style:none; margin:28px 0 0; padding:0; display:flex; flex-direction:column; gap:16px; max-width:520px; }
.benefits li { display:flex; align-items:flex-start; gap:12px; }
.tick { width:34px; height:34px; border-radius:10px; background:#eafaf0; display:inline-flex; align-items:center; justify-content:center; position:relative; }
.tick::after { content:''; width:16px; height:16px; border-radius:50%; background:#22c55e; display:block; box-shadow: inset 0 0 0 2px #eafaf0; }
.b-title { font-weight:700; color:#0b1320; }
.b-sub { color:#6b7280; font-size:14px; }

.auth-right { flex:0 1 520px; border-radius:18px; box-shadow: 0 25px 60px rgba(2,6,23,.08); }
.card-body { padding:28px 26px; }
.form-title { margin:2px 0 2px; font-size:24px; font-weight:800; color:#0b1220; }
.form-sub { margin:0 0 18px; color:#6b7280; }

.field { position:relative; }
.with-icon .icon { position:absolute; left:10px; top:60%; transform: translateY(-50%); color:#64748b; }
.with-icon .input { padding-left:36px; }
.input { width:100%; height:40px; border:1px solid #e5e7eb; border-radius:8px; background:#f7f7fb; padding:0 12px; outline: none; }
.input:focus { border-color:#c7d2fe; box-shadow: 0 0 0 3px rgba(59,130,246,.15); background:#fff; }
.label { display:block; margin:6px 0 6px; font-weight:600; color:#111827; font-size:14px; }
.mt { margin-top:12px; }
.helper { margin-top:10px; color: var(--muted, #64748b); font-size:.95rem; }
.helper.center { text-align:center; }
.link { background:none; border:none; color:#2563eb; font-weight:600; cursor:pointer; padding:0; }
.err { color:#dc2626; margin-top:.5rem; }
.eye { position:absolute; right:8px; top:50%; transform:translateY(-50%); background:transparent; border:0; padding:4px; color:#64748b; cursor:pointer; }

@media (max-width: 980px) {
  .auth-wrap { flex-direction:column; }
  .auth-left { padding:24px; }
}
</style>
