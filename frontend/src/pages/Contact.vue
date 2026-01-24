<template>
  <section class="contact-page">
    <header class="hero-block">
      <h1 class="title">Contact Us</h1>
      <p class="subtitle">Have a question or want to schedule a test drive? We'd love to hear from you.</p>
    </header>

      <div class="contact-grid">
        <!-- Left: Form -->
        <div class="card">
          <div class="card-body">
            <h2 class="section-title">Send us a Message</h2>

            <form class="form" @submit.prevent="sendEmail">
              <div class="row">
                <div class="col">
                  <label class="label">Full Name</label>
                  <div class="field">
                    <input class="input" type="text" v-model="form.name" placeholder="Your name" required />
                    <span class="addon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M5 8l7-5 7 5"/></svg>
                    </span>
                  </div>
                </div>
                <div class="col">
                  <label class="label">Email Address</label>
                  <div class="field">
                    <input class="input" type="email" v-model="form.email" placeholder="your@email.com" required />
                    <span class="addon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8l9 6 9-6"/><path d="M5 19h14a2 2 0 0 0 2-2V7"/></svg>
                    </span>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col">
                  <label class="label">Phone Number (Optional)</label>
                  <div class="field">
                    <input class="input" type="tel" v-model="form.phone" placeholder="+49 ..." />
                    <span class="addon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.09 4.2 2 2 0 014.11 2h3a2 2 0 012 1.72 12.7 12.7 0 00.7 2.81 2 2 0 01-.45 2l-1.27 1.27a16 16 0 006 6l1.27-1.27a2 2 0 012-.45 12.7 12.7 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                    </span>
                  </div>
                </div>
                <div class="col">
                  <label class="label">Subject</label>
                  <div class="field">
                    <input class="input" type="text" v-model="form.subject" placeholder="What's this about?" />
                    <span class="addon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/></svg>
                    </span>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col col-full">
                  <label class="label">Message</label>
                  <textarea class="input" rows="6" v-model="form.message" placeholder="Tell us more..." required></textarea>
                </div>
              </div>

              <button class="btn primary send-btn" type="submit">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                Send Message
              </button>
            </form>
          </div>
        </div>

        <!-- Right: Contact cards -->
        <div class="aside">
          <div class="info-card card">
            <div class="card-body info">
              <div class="ico marker">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12z" stroke="currentColor" stroke-width="2" fill="none"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>
              <div>
                <div class="info-title">Address</div>
                <div class="info-text">
                  <div>{{ company.address }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="info-card card">
            <div class="card-body info">
              <div class="ico phone">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.09 4.2 2 2 0 014.11 2h3a2 2 0 012 1.72 12.7 12.7 0 00.7 2.81 2 2 0 01-.45 2l-1.27 1.27a16 16 0 006 6l1.27-1.27a2 2 0 012-.45 12.7 12.7 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>
              <div>
                <div class="info-title">Phone</div>
                <div class="info-text"><a :href="`tel:${company.phone}`">{{ company.phone }}</a></div>
              </div>
            </div>
          </div>

          <div class="info-card card">
            <div class="card-body info">
              <div class="ico mail">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M22 6l-10 7L2 6" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>
              <div>
                <div class="info-title">Email</div>
                <div class="info-text"><a :href="`mailto:${company.email}`">{{ company.email }}</a></div>
              </div>
            </div>
          </div>

          <div class="info-card card">
            <div class="card-body info">
              <div class="ico clock">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M12 7v6l4 2" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>
              <div>
                <div class="info-title">Opening Hours</div>
                <div class="info-text">
                  <div>Monday – Friday: 09:00 – 18:00</div>
                  <div>Saturday: 09:00 – 14:00</div>
                  <div>Sunday: Closed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Map -->
      <section class="map-block">
        <h3>Find Us</h3>
        <div class="map-embed card">
          <iframe
            class="embed"
            :src="mapSrc"
            style="border:0" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import { CompanyAPI } from '../api.js';

const company = reactive({ name: 'MK Automobile', address: '', phone: '', email: '', lat: 51.3866, lng: 9.1147 });
const form = reactive({ name: '', email: '', phone: '', subject: '', message: '' });

const mapSrc = computed(() => {
  const address = encodeURIComponent(company.address);
  return `https://www.google.com/maps?q=${address}&output=embed`;
});

function sendEmail() {
  const to = company.email;
  const subject = form.subject || 'Inquiry from website';
  const body = `From: ${form.name} <${form.email}>%0D%0APhone: ${form.phone || '-'}%0D%0A%0D%0A${encodeURIComponent(form.message)}`;
  window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;
}

onMounted(async () => {
  try {
    const info = await CompanyAPI.get();
    Object.assign(company, info || {});
  } catch (_) {}
});
</script>

<style scoped>
.contact-page { padding-top: 1rem; }
.hero-block { text-align:center; margin: 1.25rem 0 1.75rem; }
.title { font-size: 44px; line-height:1.2; margin: 0 0 .25rem; font-weight: 500; color: #0b1b2b; letter-spacing: 0; }
.subtitle { color:#475569; }

.contact-grid { display:grid; grid-template-columns: 1.15fr .85fr; gap: 1rem; align-items:start; }
.section-title { margin: 0 0 1rem; }

.row { display:grid; grid-template-columns: 1fr 1fr; gap:.75rem; margin-bottom:.75rem; }
.col-full { grid-column: 1 / -1; }
@media (max-width: 900px) {
  .contact-grid { grid-template-columns: 1fr; }
  .row { grid-template-columns: 1fr; }
}

/* Info list */
.aside { display:grid; gap:.75rem; }
.info { display:flex; gap:.75rem; align-items:flex-start; }
.ico { width:40px; height:40px; border-radius:12px; display:grid; place-items:center; color:#1d4ed8; background:#eff6ff; border:1px solid #e5e7eb; }
.info-title { font-weight:700; margin-bottom:.25rem; }
.info-text, .info-text a { color:#334155; text-decoration:none; }

/* Map */
.map-block { margin-top: 1.5rem; }
.map-block h3 { margin: 0 0 .75rem; }
.map-embed { overflow:hidden; border-radius:.75rem; }
.map-embed .embed { width: 100%; height: 420px; }

/* Input adornments to match screenshot */
.field { position:relative; }
.field .input { padding-right: 40px; }
.addon { position:absolute; right:8px; top:50%; transform:translateY(-50%); width:30px; height:30px; border-radius:10px; background:#fff; color:#14b8a6; border:1px solid #e2e8f0; display:grid; place-items:center; box-shadow:0 1px 1px rgba(0,0,0,.04); }

/* Button tweaks */
.send-btn { margin-top:.5rem; }
.icon { width:18px; height:18px; }
</style>
