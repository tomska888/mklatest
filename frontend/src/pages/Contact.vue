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

            <!-- Success Message -->
            <div v-if="submitStatus === 'success'" class="alert success">
              <i class="fa-solid fa-check-circle"></i>
              <div>
                <strong>Message Sent!</strong>
                <p>Thank you for contacting us. We'll get back to you soon.</p>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="submitStatus === 'error'" class="alert error">
              <i class="fa-solid fa-exclamation-circle"></i>
              <div>
                <strong>Error</strong>
                <p>Failed to send message. Please try again or contact us directly.</p>
              </div>
            </div>

            <form class="form" @submit.prevent="sendEmail">
              <div class="row">
                <div class="col">
                  <label class="label">Full Name</label>
                  <div class="field">
                    <input class="input" type="text" v-model="form.name" placeholder="Your name" required />
                    <span class="addon" aria-hidden="true">
                      <i class="fa-solid fa-user"></i>
                    </span>
                  </div>
                </div>
                <div class="col">
                  <label class="label">Email Address</label>
                  <div class="field">
                    <input class="input" type="email" v-model="form.email" placeholder="your@email.com" required />
                    <span class="addon" aria-hidden="true">
                      <i class="fa-solid fa-envelope"></i>
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
                      <i class="fa-solid fa-phone"></i>
                    </span>
                  </div>
                </div>
                <div class="col">
                  <label class="label">Subject</label>
                  <div class="field">
                    <input class="input" type="text" v-model="form.subject" placeholder="What's this about?" />
                    <span class="addon" aria-hidden="true">
                      <i class="fa-solid fa-tag"></i>
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

              <button class="btn primary send-btn" type="submit" :disabled="submitting">
                <i :class="submitting ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-paper-plane'"></i>
                {{ submitting ? 'Sending...' : 'Send Message' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Right: Contact cards -->
        <div class="aside">
          <div class="info-card card">
            <div class="card-body info">
              <div class="ico marker">
                <i class="fa-solid fa-location-dot"></i>
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
                <i class="fa-solid fa-phone"></i>
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
                <i class="fa-solid fa-envelope"></i>
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
                <i class="fa-solid fa-clock"></i>
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
import { CompanyAPI, InquiriesAPI } from '../api.js';

const company = reactive({ name: 'MK Automobile', address: '', phone: '', email: '', lat: 51.3866, lng: 9.1147 });
const form = reactive({ name: '', email: '', phone: '', subject: '', message: '' });
const submitting = ref(false);
const submitStatus = ref(null); // 'success' | 'error' | null

const mapSrc = computed(() => {
  // Use coordinates for more precise map location
  if (company.lat && company.lng) {
    return `https://www.google.com/maps?q=${company.lat},${company.lng}&output=embed`;
  }
  // Fallback to address if coordinates are not available
  const address = encodeURIComponent(company.address);
  return `https://www.google.com/maps?q=${address}&output=embed`;
});

async function sendEmail() {
  if (submitting.value) return;
  
  submitting.value = true;
  submitStatus.value = null;

  try {
    // Submit inquiry to backend
    await InquiriesAPI.submit({
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
      message: form.message
    });

    submitStatus.value = 'success';
    
    // Reset form
    form.name = '';
    form.email = '';
    form.phone = '';
    form.subject = '';
    form.message = '';

    // Clear success message after 5 seconds
    setTimeout(() => {
      submitStatus.value = null;
    }, 5000);

  } catch (err) {
    console.error('Failed to submit inquiry:', err);
    submitStatus.value = 'error';
    
    // Clear error message after 5 seconds
    setTimeout(() => {
      submitStatus.value = null;
    }, 5000);
  } finally {
    submitting.value = false;
  }
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
.ico i { font-size:22px; }
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
.addon i { font-size:16px; }

/* Button tweaks */
.send-btn { margin-top:.5rem; }

/* Alert Messages */
.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  border: 1px solid;
  margin-bottom: 1rem;
}
.alert i {
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}
.alert p {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
}
.alert strong {
  display: block;
  margin-bottom: 0.25rem;
}
.alert.success {
  background: #f0fdf4;
  border-color: #86efac;
  color: #166534;
}
.alert.error {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #991b1b;
}
</style>
