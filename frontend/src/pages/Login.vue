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

      <h1 class="headline">Welcome Back</h1>
      <p class="subhead">Sign in to access your account and manage your favorite vehicles</p>

      <ul class="benefits">
        <li>
          <span class="tick"></span>
          <div>
            <div class="b-title">Save Your Favorites</div>
            <div class="b-sub">Keep track of vehicles you're interested in</div>
          </div>
        </li>
        <li>
          <span class="tick"></span>
          <div>
            <div class="b-title">Quick Inquiries</div>
            <div class="b-sub">Contact dealers faster with saved information</div>
          </div>
        </li>
        <li>
          <span class="tick"></span>
          <div>
            <div class="b-title">Personalized Experience</div>
            <div class="b-sub">Get recommendations based on your preferences</div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Right form card -->
    <section class="auth-right card">
      <div class="card-body">
        <h2 class="form-title">Sign In</h2>
        <p class="form-sub">Enter your credentials to access your account</p>

        <form @submit.prevent="submit" class="form">
          <label class="label">Email</label>
          <div class="field with-icon">
            <span class="icon">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M20 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Zm0 2v.01L12 13 4 8.01V8h16ZM4 16V9.24l7.4 4.63a1 1 0 0 0 1.2 0L20 9.24V16H4Z"/></svg>
            </span>
            <input class="input" type="email" v-model="email" placeholder="name@example.com" required />
          </div>

          <label class="label mt">Password</label>
          <div class="field with-icon">
            <span class="icon">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M17 8h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-6 8.73V17a1 1 0 1 1 2 0v-.27a2 2 0 1 1-2 0ZM9 8V6a3 3 0 1 1 6 0v2H9Z"/></svg>
            </span>
            <input :type="showPassword ? 'text' : 'password'" class="input" v-model="password" placeholder="••••••••" required minlength="6" />
            <button class="eye" type="button" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Hide password' : 'Show password'">
              <svg v-if="!showPassword" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/></svg>
              <svg v-else viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M2 3.27 3.28 2 22 20.72 20.73 22l-2.47-2.47A12.72 12.72 0 0 1 12 19C5 19 2 12 2 12a21.54 21.54 0 0 1 5.37-6.94L2 3.27ZM12 7a5 5 0 0 1 4.58 7.02l-1.49-1.49A3 3 0 0 0 9.47 9.9L7.4 7.83A5 5 0 0 1 12 7Zm0 10c2.4 0 4.3-1.14 5.74-2.48l-1.46-1.46A5 5 0 0 1 7.94 8.22 16.1 16.1 0 0 0 4.62 12s2.84 5 7.38 5Z"/></svg>
            </button>
          </div>

          <div class="row mt-sm">
            <label class="checkbox">
              <input type="checkbox" v-model="remember" />
              <span>Remember me</span>
            </label>
            <button type="button" class="link" @click="showReset = true">Forgot password?</button>
          </div>

          <button class="btn primary block mt" :disabled="loading">{{ loading ? 'Signing in...' : 'Sign In' }}</button>

          <p class="helper center">Don't have an account? <router-link class="link" to="/register">Sign up</router-link></p>

          <p v-if="error" class="err">{{ error }}</p>
        </form>
      </div>
    </section>

    <!-- Reset password modal -->
    <div v-if="showReset" class="modal-wrap" @keydown.esc="closeReset">
      <div class="modal card" role="dialog" aria-modal="true">
        <div class="modal-head">
          <h3>Reset Password</h3>
          <button class="icon-btn" @click="closeReset" aria-label="Close">
            ✕
          </button>
        </div>
        <p class="modal-sub">Enter your email address and we'll send you a link to reset your password</p>
        <label class="label mt-sm">Email Address</label>
        <div class="field with-icon">
          <span class="icon">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M20 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Zm0 2v.01L12 13 4 8.01V8h16ZM4 16V9.24l7.4 4.63a1 1 0 0 0 1.2 0L20 9.24V16H4Z"/></svg>
          </span>
          <input class="input" type="email" v-model="resetEmail" placeholder="name@example.com" />
        </div>
        <div class="row gap mt">
          <button class="btn" @click="closeReset">Cancel</button>
          <button class="btn primary" @click="sendReset" :disabled="sendingReset">{{ sendingReset ? 'Sending...' : 'Send Reset Link' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AuthAPI } from '../api.js';
import { useAuthStore } from '../stores/auth.js';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const remember = ref(true);
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

const showReset = ref(false);
const resetEmail = ref('');
const sendingReset = ref(false);

async function submit() {
  if (loading.value) return;
  loading.value = true;
  error.value = '';
  try {
    const { token } = await AuthAPI.login({ email: email.value, password: password.value });
    auth.setToken(token);
    const redirect = route.query.redirect || '/';
    router.replace(String(redirect));
  } catch (e) {
    error.value = e?.response?.data?.error || 'Login failed';
  } finally {
    loading.value = false;
  }
}

function closeReset() {
  showReset.value = false;
  resetEmail.value = '';
}

async function sendReset() {
  // No external providers or complex flows requested. We provide UX-only modal.
  if (!resetEmail.value) return;
  sendingReset.value = true;
  // Simulate call or integrate later; close with success UX.
  setTimeout(() => {
    sendingReset.value = false;
    closeReset();
    alert('If this email exists, a reset link has been sent.');
  }, 800);
}
</script>

<style scoped>
.auth-wrap { display:flex; gap:2rem; align-items:stretch; justify-content:center; padding:40px 16px; }
.auth-left { flex:1 1 48%; min-width:320px; max-width:760px; padding:32px 24px 32px 48px; background:linear-gradient(135deg,#f3f6ff 0%, #ffffff 60%); border-radius:18px; box-shadow: 0 20px 60px rgba(17,24,39,.08) inset; }
.brand { display:flex; align-items:center; gap:12px; margin-bottom:18px; }
.logo { width:44px; height:44px; display:grid; place-items:center; border-radius:12px; background:#2563eb; color:#111827; box-shadow: 0 8px 20px rgba(37,99,235,.35); }
.brand-name { font-size:22px; font-weight:700; color:#0b1220; }
.brand-sub { color:#64748b; margin-top:2px; }
.headline { font-size:44px; margin:22px 0 6px; color:#0b1220; font-weight:800; letter-spacing:.2px; }
.subhead { color:#475569; font-size:16px; }
.benefits { list-style:none; margin:28px 0 0; padding:0; display:flex; flex-direction:column; gap:16px; max-width:520px; }
.benefits li { display:flex; align-items:flex-start; gap:12px; }
.tick { width:34px; height:34px; border-radius:10px; background:#eaf1ff; display:inline-flex; align-items:center; justify-content:center; position:relative; }
.tick::after { content:''; width:16px; height:16px; border-radius:50%; background:#2563eb; display:block; box-shadow: inset 0 0 0 2px #eaf1ff; mask: none; }
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
.mt-sm { margin-top:8px; }
.row { display:flex; align-items:center; justify-content:space-between; }
.row.gap { gap:.75rem; justify-content:flex-end; }
.checkbox { display:flex; align-items:center; gap:8px; color:#111827; }
.eye { position:absolute; right:8px; top:50%; transform:translateY(-50%); background:transparent; border:0; padding:4px; color:#64748b; cursor:pointer; }

.helper { margin-top:10px; color: var(--muted, #64748b); font-size:.95rem; }
.helper.center { text-align:center; }
.link { background:none; border:none; color:#2563eb; font-weight:600; cursor:pointer; padding:0; }
.err { color:#dc2626; margin-top:.5rem; }

/* Modal */
.modal-wrap { position:fixed; inset:0; display:grid; place-items:center; background: rgba(2,6,23,.45); z-index:50; padding:16px; }
.modal { width:560px; max-width:100%; border-radius:14px; }
.modal-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.modal-sub { color:#6b7280; margin-bottom:10px; padding: 20px}
.icon-btn { background:#fff; border:1px solid #e5e7eb; border-radius:8px; width:34px; height:34px; display:grid; place-items:center; cursor:pointer; }

/* Responsive */
@media (max-width: 980px) {
  .auth-wrap { flex-direction:column; }
  .auth-left { padding:24px; }
}
</style>
