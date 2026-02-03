<template>
  <div class="auth-wrap">
    <!-- Left brand/benefits panel -->
    <section class="auth-left">
      <div class="brand">
        <div class="logo">
          <i class="fa-solid fa-car" aria-hidden="true"></i>
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
              <i class="fa-solid fa-envelope" aria-hidden="true"></i>
            </span>
            <input class="input" type="email" v-model="email" required placeholder="name@example.com" />
          </div>

          <label class="label mt">{{ $t('auth.register.form.phone') }}</label>
          <div class="field with-icon">
            <span class="icon">
              <i class="fa-solid fa-phone" aria-hidden="true"></i>
            </span>
            <input class="input" type="tel" v-model="phone" placeholder="(+49 000-000-0000)" />
          </div>

          <label class="label mt">{{ $t('auth.register.form.password') }}</label>
          <div class="field with-icon">
            <span class="icon">
              <i class="fa-solid fa-lock" aria-hidden="true"></i>
            </span>
            <input :type="showPassword ? 'text' : 'password'" class="input" v-model="password" required minlength="6" placeholder="••••••••" />
            <button class="eye" type="button" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Hide password' : 'Show password'">
              <i v-if="!showPassword" class="fa-solid fa-eye"></i>
              <i v-else class="fa-solid fa-eye-slash"></i>
            </button>
          </div>

          <label class="label mt">{{ $t('auth.register.form.confirmPassword') }}</label>
          <div class="field with-icon">
            <span class="icon">
              <i class="fa-solid fa-lock" aria-hidden="true"></i>
            </span>
            <input :type="showConfirm ? 'text' : 'password'" class="input" v-model="confirm" required minlength="6" placeholder="••••••••" />
            <button class="eye" type="button" @click="showConfirm = !showConfirm" :aria-label="showConfirm ? 'Hide password' : 'Show password'">
              <i v-if="!showConfirm" class="fa-solid fa-eye"></i>
              <i v-else class="fa-solid fa-eye-slash"></i>
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
.logo { width:44px; height:44px; display:grid; place-items:center; border-radius:12px; background:#2563eb; color:#fff; box-shadow: 0 8px 20px rgba(37,99,235,.35); font-size: 20px; }
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
.with-icon .icon { position:absolute; left:10px; top:50%; transform: translateY(-50%); color:#3b82f6; font-size: 16px; display: flex; align-items: center; justify-content: center; }
.with-icon .input { padding-left:36px; }
.input { width:100%; height:40px; border:1px solid #e5e7eb; border-radius:8px; background:#f7f7fb; padding:0 12px; outline: none; }
.input:focus { border-color:#c7d2fe; box-shadow: 0 0 0 3px rgba(59,130,246,.15); background:#fff; }
.label { display:block; margin:6px 0 6px; font-weight:600; color:#111827; font-size:14px; }
.mt { margin-top:12px; }
.helper { margin-top:10px; color: var(--muted, #64748b); font-size:.95rem; }
.helper.center { text-align:center; }
.link { background:none; border:none; color:#2563eb; font-weight:600; cursor:pointer; padding:0; }
.err { color:#dc2626; margin-top:.5rem; }
.eye { position:absolute; right:8px; top:50%; transform:translateY(-50%); background:transparent; border:0; padding:4px; color:#64748b; cursor:pointer; font-size: 18px; }

@media (max-width: 980px) {
  .auth-wrap { flex-direction:column; }
  .auth-left { padding:24px; }
}
</style>
