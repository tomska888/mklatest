<template>
  <section class="container">
    <h1 style="margin:.25rem 0 1rem;">Admin Panel</h1>

    <div class="card">
      <div class="card-body" style="display:flex; gap:1rem; flex-wrap:wrap;">
        <button class="btn outline" :class="{active:tab==='cars'}" @click="tab='cars'">Cars</button>
        <button class="btn outline" :class="{active:tab==='company'}" @click="tab='company'">Company</button>
        <button class="btn outline" :class="{active:tab==='newsletter'}" @click="tab='newsletter'">Newsletter</button>
      </div>
    </div>

    <div v-if="tab==='cars'" style="margin-top:1rem; display:grid; grid-template-columns: 1.4fr .6fr; gap:1rem;">
      <div class="card">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2 style="margin:0;">Cars</h2>
            <div style="display:flex; gap:.5rem;">
              <input class="input" placeholder="Search" v-model="carsState.q" @keyup.enter="loadCars" />
              <button class="btn outline" @click="loadCars">Search</button>
              <button class="btn primary" @click="newCar">New</button>
            </div>
          </div>

          <table class="table" style="margin-top:.75rem;">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th>Price</th>
                <th>Featured</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in carsState.items" :key="c.id">
                <td>{{ c.id }}</td>
                <td>{{ c.title }}</td>
                <td>{{ c.make }}</td>
                <td>{{ c.model }}</td>
                <td>{{ c.year }}</td>
                <td>{{ formatPrice(c.price) }}</td>
                <td>
                  <input type="checkbox" :checked="!!c.featured" @change="toggleFeatured(c, $event.target.checked)" />
                </td>
                <td>
                  <button class="btn ghost" @click="editCar(c)">Edit</button>
                  <button class="btn ghost" style="color:#dc2626" @click="removeCar(c)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div style="display:flex; gap:.5rem; justify-content:center; margin-top:.5rem;">
            <button class="btn outline" :disabled="carsState.page<=1" @click="carsGo(carsState.page-1)">Prev</button>
            <span style="align-self:center">Page {{ carsState.page }} / {{ carsState.totalPages }}</span>
            <button class="btn outline" :disabled="carsState.page>=carsState.totalPages" @click="carsGo(carsState.page+1)">Next</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <h2 style="margin-top:0;">{{ form.id ? 'Edit Car #'+form.id : 'New Car' }}</h2>
          <form @submit.prevent="saveCar">
            <label class="label">Title</label>
            <input class="input" v-model="form.title" required />

            <div class="form-row" style="margin-top:.5rem;">
              <div>
                <label class="label">Make</label>
                <input class="input" v-model="form.make" required />
              </div>
              <div>
                <label class="label">Model</label>
                <input class="input" v-model="form.model" required />
              </div>
            </div>

            <div class="form-row" style="margin-top:.5rem;">
              <div>
                <label class="label">Year</label>
                <input class="input" type="number" v-model.number="form.year" required />
              </div>
              <div>
                <label class="label">Price (€)</label>
                <input class="input" type="number" v-model.number="form.price" required />
              </div>
            </div>

            <div class="form-row" style="margin-top:.5rem;">
              <div>
                <label class="label">Mileage (km)</label>
                <input class="input" type="number" v-model.number="form.mileage" />
              </div>
              <div>
                <label class="label">Fuel</label>
                <input class="input" v-model="form.fuel_type" />
              </div>
            </div>

            <div class="form-row" style="margin-top:.5rem;">
              <div>
                <label class="label">Transmission</label>
                <input class="input" v-model="form.transmission" />
              </div>
              <div>
                <label class="label">Body type</label>
                <input class="input" v-model="form.body_type" />
              </div>
            </div>

            <div class="form-row" style="margin-top:.5rem;">
              <div>
                <label class="label">Color</label>
                <input class="input" v-model="form.color" />
              </div>
              <div>
                <label class="label">VIN</label>
                <input class="input" v-model="form.vin" />
              </div>
            </div>


            <label class="label" style="margin-top:.5rem;">Description</label>
            <textarea class="input" rows="6" v-model="form.description" />

            <label class="label" style="margin-top:.5rem;">Features</label>
            <div class="chips">
              <span v-for="(f,i) in form.features" :key="i" class="chip">{{ f }} <button type="button" class="x" @click="removeFeature(i)">×</button></span>
            </div>
            <input class="input" placeholder="Type a feature and press Enter (e.g., 'ABS', 'Android Auto')" @keyup.enter.prevent="addFeature($event)" />

            <h3 style="margin:.75rem 0 .25rem;">Further technical data</h3>
            <table class="table small">
              <thead>
                <tr><th style="width:45%;">Key</th><th>Value</th><th style="width:1%;"></th></tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in form.specs" :key="i">
                  <td><input class="input" v-model="row.key" placeholder="e.g., Series" /></td>
                  <td><input class="input" v-model="row.value" placeholder="e.g., Octavia Combi (NX5)" /></td>
                  <td><button type="button" class="btn ghost" style="color:#dc2626" @click="removeSpecRow(i)">Remove</button></td>
                </tr>
              </tbody>
            </table>
            <div style="display:flex; gap:.5rem;">
              <button type="button" class="btn outline" @click="addSpecRow()">Add row</button>
              <button type="button" class="btn outline" @click="addPresetSpecs()">Add preset keys</button>
            </div>

            <div style="margin:.5rem 0; display:flex; gap:.5rem; align-items:center;">
              <input id="featured" type="checkbox" v-model="form.featured" />
              <label for="featured">Featured</label>
            </div>

            <div style="margin-top:.75rem; display:flex; gap:.5rem;">
              <button class="btn primary" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
              <button class="btn outline" type="button" @click="resetForm">Reset</button>
            </div>
          </form>

          <div v-if="form.id" style="margin-top:1rem;">
            <h3>Media</h3>
            <input type="file" multiple accept="image/*,video/*" @change="uploadMedia($event)" />
            <div style="display:flex; flex-wrap:wrap; gap:.5rem; margin-top:.5rem;">
              <div v-for="m in form.media||[]" :key="m.id" class="card" style="width:140px; overflow:hidden;">
                <img v-if="m.type==='image'" :src="m.url" alt="" style="width:100%; height:92px; object-fit:cover;" />
                <div v-else style="height:92px; display:flex; align-items:center; justify-content:center; background:#111827; color:#fff;">Video</div>
                <button class="btn ghost" style="color:#dc2626" @click="deleteMedia(m)">Remove</button>
              </div>
            </div>

            <h3 style="margin-top:1rem;">Documents</h3>
            <div class="form-row">
              <input class="input" placeholder="Optional type (e.g., Service, HU, Registration)" v-model="docType" />
              <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*" @change="uploadDocuments($event)" />
            </div>
            <div style="display:flex; flex-direction:column; gap:.25rem; margin-top:.5rem;">
              <div v-for="d in form.documents||[]" :key="d.id" style="display:flex; justify-content:space-between; align-items:center; border:1px solid #e5e7eb; border-radius:.5rem; padding:.25rem .5rem;">
                <a :href="d.url" target="_blank">{{ d.filename || d.url }}</a>
                <div style="display:flex; gap:.5rem; align-items:center;">
                  <span class="badge" v-if="d.doc_type">{{ d.doc_type }}</span>
                  <button class="btn ghost" style="color:#dc2626" @click="deleteDocument(d)">Remove</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="tab==='company'" class="card" style="margin-top:1rem;">
      <div class="card-body">
        <h2 style="margin-top:0;">Company Info</h2>
        <form @submit.prevent="saveCompany">
          <div class="form-row">
            <div>
              <label class="label">Name</label>
              <input class="input" v-model="company.name" />
            </div>
            <div>
              <label class="label">Email</label>
              <input class="input" v-model="company.email" />
            </div>
          </div>
          <div class="form-row" style="margin-top:.5rem;">
            <div>
              <label class="label">Phone</label>
              <input class="input" v-model="company.phone" />
            </div>
            <div>
              <label class="label">Address</label>
              <input class="input" v-model="company.address" />
            </div>
          </div>
          <div class="form-row" style="margin-top:.5rem;">
            <div>
              <label class="label">Latitude</label>
              <input class="input" type="number" step="0.000001" v-model.number="company.lat" />
            </div>
            <div>
              <label class="label">Longitude</label>
              <input class="input" type="number" step="0.000001" v-model.number="company.lng" />
            </div>
          </div>
          <label class="label" style="margin-top:.5rem;">About</label>
          <textarea class="input" rows="6" v-model="company.about" />
          <div style="margin-top:.75rem;">
            <button class="btn primary" :disabled="savingCompany">{{ savingCompany ? 'Saving...' : 'Save' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-else-if="tab==='newsletter'" class="card" style="margin-top:1rem;">
      <div class="card-body">
        <h2 style="margin-top:0;">Newsletter</h2>
        <form @submit.prevent="sendNewsletter" style="display:grid; gap:.5rem;">
          <input class="input" placeholder="Subject" v-model="mail.subject" required />
          <textarea class="input" placeholder="HTML or text content" v-model="mail.html" rows="6" />
          <div>
            <button class="btn primary" :disabled="sending">{{ sending ? 'Sending...' : 'Send to all subscribers' }}</button>
          </div>
        </form>

        <h3 style="margin:1rem 0 .5rem;">Subscribers</h3>
        <table class="table">
          <thead>
            <tr><th>ID</th><th>Email</th><th>Subscribed at</th></tr>
          </thead>
          <tbody>
            <tr v-for="s in subscribers" :key="s.id">
              <td>{{ s.id }}</td>
              <td>{{ s.email }}</td>
              <td>{{ new Date(s.subscribed_at).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { CarsAPI, CompanyAPI, NewsletterAPI } from '../api.js';

const tab = ref('cars');

const carsState = reactive({ items: [], page: 1, totalPages: 1, q: '' });
const form = reactive({ id:null, title:'', make:'', model:'', year:'', price:'', mileage:'', fuel_type:'', transmission:'', body_type:'', color:'', vin:'', description:'', featured:false, media: [], features: [], specs: [], documents: [] });
const saving = ref(false);

function formatPrice(v) {
  try { return new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(Number(v||0)); } catch { return `${v} €`; }
}

async function loadCars() {
  const data = await CarsAPI.list({ q: carsState.q, page: carsState.page, pageSize: 12, sort: 'created_at_desc' });
  carsState.items = data.items;
  carsState.totalPages = data.totalPages;
}

function carsGo(p) { carsState.page = p; loadCars(); }

function newCar() { resetForm(); }

function editCar(c) { Object.assign(form, c); fetchCarDetails(c.id); }

async function fetchCarDetails(id) {
  try {
    const data = await CarsAPI.get(id);
    form.media = data.media || [];
    form.features = data.features || [];
    form.specs = Object.entries(data.specs || {}).map(([key, value]) => ({ key, value }));
    form.documents = data.documents || [];
  } catch {}
}

async function saveCar() {
  try {
    saving.value = true;
    const payload = { ...form };
    delete payload.media; delete payload.features; delete payload.specs; delete payload.documents; delete payload.location;
    if (form.id) {
      await CarsAPI.update(form.id, payload);
    } else {
      const { id } = await CarsAPI.create(payload);
      form.id = id;
    }
    // Persist features and specs
    const specsObj = Object.fromEntries((form.specs || []).filter(r => r.key && String(r.key).trim().length).map(r => [String(r.key).trim(), String(r.value ?? '')]));
    await CarsAPI.setFeatures(form.id, form.features || []);
    await CarsAPI.setSpecs(form.id, specsObj);
    await fetchCarDetails(form.id);
    await loadCars();
  } finally { saving.value = false; }
}

function resetForm() { Object.assign(form, { id:null, title:'', make:'', model:'', year:'', price:'', mileage:'', fuel_type:'', transmission:'', body_type:'', color:'', vin:'', description:'', featured:false, media: [], features: [], specs: [], documents: [] }); }

async function removeCar(c) {
  if (!confirm(`Delete car #${c.id}?`)) return;
  await CarsAPI.remove(c.id);
  if (form.id === c.id) resetForm();
  await loadCars();
}

async function toggleFeatured(c, val) { await CarsAPI.feature(c.id, !!val); await loadCars(); }

async function uploadMedia(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length || !form.id) return;
  await CarsAPI.uploadMedia(form.id, files);
  e.target.value = '';
  await fetchCarDetails(form.id);
}

async function deleteMedia(m) {
  if (!form.id || !m?.id) return;
  await CarsAPI.deleteMedia(form.id, m.id);
  await fetchCarDetails(form.id);
}

// Features helpers
function addFeature(e) {
  const val = String(e.target.value || '').trim();
  if (!val) return;
  if (!form.features.includes(val)) form.features.push(val);
  e.target.value = '';
}
function removeFeature(i) { form.features.splice(i, 1); }

// Specs helpers
function addSpecRow() { form.specs.push({ key:'', value:'' }); }
function removeSpecRow(i) { form.specs.splice(i, 1); }
function addPresetSpecs() {
  const presets = [
    'Series','Equipment line','Engine displacement','Number of seats','Number of doors','Emission class','Environmental badge','Number of owners of the vehicle','HU','Air conditioning','Parking assistance','Airbags','Color (manufacturer)','Color','Interior','Braked trailer load','Unbraked towing capacity','Weight','Last service (km)','Cylinder','Tank size','Drive type'
  ];
  const existing = new Set(form.specs.map(r => (r.key||'').toLowerCase()));
  for (const k of presets) { if (!existing.has(k.toLowerCase())) form.specs.push({ key:k, value:'' }); }
}

// Documents
const docType = ref('');
async function uploadDocuments(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length || !form.id) return;
  await CarsAPI.uploadDocuments(form.id, files, docType.value || null);
  e.target.value = '';
  await fetchCarDetails(form.id);
}
async function deleteDocument(d) { if (!form.id || !d?.id) return; await CarsAPI.deleteDocument(form.id, d.id); await fetchCarDetails(form.id); }

// Company
const company = reactive({ name:'MK Automobile', address:'', phone:'', email:'', lat:52.52, lng:13.405, about:'' });
const savingCompany = ref(false);
async function loadCompany() { try { Object.assign(company, await CompanyAPI.get() || {}); } catch {} }
async function saveCompany() { try { savingCompany.value = true; Object.assign(company, await CompanyAPI.update(company)); } finally { savingCompany.value = false; } }

// Newsletter
const subscribers = ref([]);
const mail = reactive({ subject:'Latest cars from MK Automobile', html:'<p>Check our newest arrivals at https://yourdomain.com</p>' });
const sending = ref(false);
async function loadSubscribers() { try { const r = await NewsletterAPI.list(); subscribers.value = r.items || []; } catch {} }
async function sendNewsletter() { try { sending.value = true; await NewsletterAPI.send(mail); alert('Newsletter queued for sending'); } finally { sending.value = false; } }

onMounted(async () => {
  await loadCars();
  await loadCompany();
  await loadSubscribers();
});
</script>

<style scoped>
.btn.active { background:#0b1b2b; color:#fff; }
.chips { display:flex; gap:.5rem; flex-wrap:wrap; margin:.25rem 0; }
.chip { background:#f3f4f6; border:1px solid #e5e7eb; padding:.25rem .5rem; border-radius:999px; display:inline-flex; align-items:center; gap:.25rem; }
.chip .x { background:transparent; border:none; cursor:pointer; line-height:1; font-size:1rem; }
</style>
