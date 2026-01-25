<template>
  <footer class="footer">
    <div class="container">
      <div class="grid top">
        <!-- Brand -->
        <div class="brand">
          <div class="brand-row">
            <span class="cloud" aria-hidden="true">
              <i class="fa-solid fa-car"></i>
            </span>
            <h3>MK Automobile</h3>
          </div>
          <p class="muted">Premium quality used cars in Germany. Trusted by customers since 2016.</p>
          <div class="social">
            <a href="#" aria-label="Facebook" class="icon">
              <i class="fa-brands fa-facebook"></i>
            </a>
            <a href="#" aria-label="Instagram" class="icon">
              <i class="fa-brands fa-instagram"></i>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4>Quick Links</h4>
          <nav class="links">
            <router-link to="/">Home</router-link>
            <router-link to="/cars">Inventory</router-link>
            <router-link to="/about">About Us</router-link>
            <router-link to="/contact">Contact</router-link>
          </nav>
        </div>


        <!-- Newsletter -->
        <div>
          <h4>Newsletter</h4>
          <p class="muted">Subscribe to get notified when new cars are added to our inventory.</p>
          <form class="newsletter" @submit.prevent="subscribe">
            <div class="input-group">
              <input id="newsletter" class="input" type="email" placeholder="Enter your email" v-model="email" required />
              <span class="adornment" aria-hidden="true">
                <i class="fa-solid fa-envelope"></i>
              </span>
              <button class="btn primary" :disabled="loading">{{ loading ? 'Submitting...' : 'Subscribe' }}</button>
            </div>
            <p v-if="status==='success'" class="msg ok">Thanks! You will be notified when new cars are added.</p>
            <p v-if="status==='error'" class="msg err">{{ errorMsg || 'Subscription failed. Try again.' }}</p>
          </form>
        </div>
      </div>

      <div class="bottom">
        <small>© {{ new Date().getFullYear() }} MK Automobile. All rights reserved.</small>
        <nav class="legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </nav>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue';
import { NewsletterAPI } from '../api.js';

const email = ref('');
const loading = ref(false);
const status = ref('idle');
const errorMsg = ref('');


async function subscribe() {
  if (!email.value) return;
  try {
    loading.value = true;
    status.value = 'idle';
    errorMsg.value = '';
    await NewsletterAPI.subscribe(email.value);
    status.value = 'success';
    email.value = '';
  } catch (e) {
    status.value = 'error';
    errorMsg.value = e?.response?.data?.error || e.message;
  } finally {
    loading.value = false;
  }
}

</script>

<style scoped>
.footer {
  background:#fff; color:#0f172a; margin-top:2rem; border-top:1px solid #e5e7eb; padding:2rem 1rem;
}
.top h3, .top h4 { margin:0 0 .5rem; }
.muted { color:#64748b; }

.brand-row { display:flex; align-items:center; gap:.5rem; margin-bottom:.25rem; }
.cloud { color:#1d4ed8; background:#eff6ff; border:1px solid #e5e7eb; width:28px; height:28px; border-radius:8px; display:grid; place-items:center; transition: transform .18s ease, box-shadow .18s ease; }
.cloud i { font-size:18px; }
.brand-row:hover .cloud { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(2,6,23,.06); }

.social { display:flex; gap:.5rem; margin-top:.5rem; }
.social .icon { width:32px; height:32px; border:1px solid #e5e7eb; border-radius:.5rem; display:grid; place-items:center; color:#475569; text-decoration:none; background:#fff; transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease, background-color .16s ease; }
.social .icon i { font-size:18px; }
.social .icon:hover { transform: translateY(-2px); border-color:#cbd5e1; background:#f8fafc; box-shadow: 0 4px 12px rgba(2,6,23,.08); }
.social .icon:active { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(2,6,23,.08); }

.links { display:grid; gap:.35rem; }
.links a { color:#0f172a; text-decoration:none; position:relative; padding-bottom:2px; transition: color .16s ease; }
.links a::after { content:''; position:absolute; left:0; right:0; bottom:-2px; height:2px; background:#2563eb; transform:scaleX(0); transform-origin:left; transition: transform .18s ease; border-radius:2px; }
.links a:hover { color:#0b1b2b; }
.links a:hover::after, .links a.router-link-active::after { transform:scaleX(1); }

/* Ensure 3 even columns in footer */
.top { grid-template-columns: repeat(3, minmax(0, 1fr)); }


.newsletter .input-group { display:flex; gap:.5rem; align-items:center; position:relative; transition: box-shadow .16s ease, transform .16s ease; }
.newsletter .input-group:focus-within { box-shadow: 0 8px 20px rgba(2,6,23,.06); transform: translateY(-1px); }
.newsletter .input { flex:1; padding-right:36px; transition: border-color .16s ease; }
.newsletter .input:focus { border-color:#cbd5e1; }
.adornment { position:absolute; right:118px; width:26px; height:26px; top:50%; transform:translateY(-50%); display:grid; place-items:center; color:#94a3b8; }
.adornment i { font-size:16px; }

.bottom { display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e5e7eb; margin-top:1.25rem; padding-top:1rem; color:#64748b; }
.legal { display:flex; gap:1rem; }
.legal a { color:#64748b; text-decoration:none; position:relative; padding-bottom:2px; transition: color .16s ease; }
.legal a::after { content:''; position:absolute; left:0; right:0; bottom:-2px; height:2px; background:#94a3b8; transform:scaleX(0); transform-origin:left; transition: transform .18s ease; border-radius:2px; }
.legal a:hover { color:#475569; }
.legal a:hover::after { transform:scaleX(1); }

@media (max-width: 768px) {
  .bottom { flex-direction:column; gap:.5rem; align-items:flex-start; }
}
</style>
