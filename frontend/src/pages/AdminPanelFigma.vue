<template>
  <section class="admin-wrap">
    <!-- Top Bar -->
    <header class="topbar">
      <div class="container topbar-inner">
        <div class="brand">
          <button class="icon-btn show-on-mobile" @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
            <span :class="{ open: mobileOpen }"></span>
            <span :class="{ open: mobileOpen }"></span>
            <span :class="{ open: mobileOpen }"></span>
          </button>
          <h1>Admin Panel</h1>
        </div>
        <button class="btn outline" @click="logout" :disabled="saving || sending">
          <span class="material">↩</span>
          <span class="hide-sm">Logout</span>
        </button>
      </div>
    </header>

    <div class="admin-body">
      <!-- Sidebar -->
      <aside class="sidebar" :class="{ open: mobileOpen }">
        <nav class="nav">
          <button
            class="nav-item"
            :class="{ active: current === 'dashboard' }"
            @click="go('dashboard')"
          >
            <span class="icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button
            class="nav-item"
            :class="{ active: ['cars','car-form'].includes(current) }"
            @click="go('cars')"
          >
            <span class="icon">🚗</span>
            <span>Car Management</span>
          </button>
          <button
            class="nav-item"
            :class="{ active: current === 'inquiries' }"
            @click="go('inquiries')"
          >
            <span class="icon">💬</span>
            <span>Inquiries</span>
          </button>
          <button
            class="nav-item"
            :class="{ active: current === 'company' }"
            @click="go('company')"
          >
            <span class="icon">🏢</span>
            <span>Company</span>
          </button>
          <button
            class="nav-item"
            :class="{ active: current === 'newsletter' }"
            @click="go('newsletter')"
          >
            <span class="icon">✉️</span>
            <span>Newsletter</span>
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="content">
        <!-- Dashboard (lightweight placeholders; can be wired later) -->
        <div v-if="current === 'dashboard'" class="space">
          <!-- Stats (using live counts where possible) -->
          <div class="grid stats">
            <div class="card stat">
              <div class="card-body">
                <p class="muted">Total Cars</p>
                <div class="value">{{ totals.cars }}</div>
                <p class="trend up">Live</p>
              </div>
            </div>
            <div class="card stat">
              <div class="card-body">
                <p class="muted">Featured</p>
                <div class="value">{{ totals.featured }}</div>
                <p class="trend up">Live</p>
              </div>
            </div>
            <div class="card stat">
              <div class="card-body">
                <p class="muted">Avg. Price</p>
                <div class="value">{{ avgPriceEUR }}</div>
                <p class="trend up">Live</p>
              </div>
            </div>
            <div class="card stat">
              <div class="card-body">
                <p class="muted">New This Page</p>
                <div class="value">—</div>
                <p class="trend up">Session</p>
              </div>
            </div>
          </div>

          <!-- Charts (placeholders 1:1 layout) -->
          <div class="grid two">
            <div class="card">
              <div class="card-body">
                <h2 class="card-title">Monthly Sales</h2>
                <div class="chart-placeholder">Chart placeholder</div>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <h2 class="card-title">Revenue Trend</h2>
                <div class="chart-placeholder">Chart placeholder</div>
              </div>
            </div>
          </div>

          <!-- Bottom Row -->
          <div class="grid two">
            <div class="card">
              <div class="card-body">
                <h2 class="card-title">Cars by Type</h2>
                <ul class="legend">
                  <li v-for="(count, label) in byType" :key="label"><span class="dot blue"></span>{{ label }} — {{ percent(count, totals.cars) }}%</li>
                </ul>
                <div class="pie-placeholder">Pie placeholder</div>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <h2 class="card-title">Recent Activity</h2>
                <div class="activity">
                  <div class="row" v-for="(a,i) in recentActivity" :key="i"><div><p class="title">{{ a.action }}</p><p class="muted">{{ a.details }}</p></div><span class="time">{{ a.time }}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cars list -->
        <div v-else-if="current === 'cars'" class="space">
          <!-- Header -->
          <div class="flex-between">
            <div class="search-wrap">
              <span class="search-icon">🔍</span>
              <input class="input search" placeholder="Search cars..." v-model="carsState.q" @keyup.enter="loadCars" />
            </div>
            <div class="row-inline">
              <button class="btn outline" @click="loadCars" :disabled="loadingCars">{{ loadingCars ? 'Searching…' : 'Search' }}</button>
              <button class="btn primary" @click="startAddCar">
                <span class="material">＋</span>
                New
              </button>
            </div>
          </div>

          <!-- Table -->
          <div class="card" style="overflow:auto;">
            <table class="table">
              <thead>
                <tr>
                  <th style="width:80px;">Image</th>
                  <th>Title</th>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Price</th>
                  <th>Featured</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in carsState.items" :key="c.id">
                  <td>
                    <img :src="firstImage(c)" :alt="c.title || (c.make + ' ' + c.model)" class="thumb" />
                  </td>
                  <td class="bold">{{ c.title }}</td>
                  <td>{{ c.make }}</td>
                  <td>{{ c.model }}</td>
                  <td>{{ c.year }}</td>
                  <td>{{ formatPriceEUR(c.price) }}</td>
                  <td>
                    <input type="checkbox" :checked="!!c.featured" @change="toggleFeatured(c, $event.target.checked)" />
                  </td>
                  <td style="text-align:right;">
                    <div class="row-actions">
                      <button class="btn ghost" @click="startEditCar(c)" title="Edit">✏️</button>
                      <button class="btn ghost danger" @click="askDelete(c)" title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!carsState.items.length">
                  <td colspan="8" style="text-align:center; padding:1.25rem; color:#6b7280;">No cars found</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex-between" style="margin-top:.5rem;">
            <div></div>
            <div class="row-inline">
              <button class="btn outline" :disabled="carsState.page<=1 || loadingCars" @click="carsGo(carsState.page-1)">Prev</button>
              <span style="align-self:center">Page {{ carsState.page }} / {{ carsState.totalPages }}</span>
              <button class="btn outline" :disabled="carsState.page>=carsState.totalPages || loadingCars" @click="carsGo(carsState.page+1)">Next</button>
            </div>
            <div></div>
          </div>

          <!-- Simple confirm dialog -->
          <div v-if="toDelete" class="dialog-backdrop" @click.self="toDelete = null">
            <div class="dialog">
              <h3>Are you sure?</h3>
              <p>This action cannot be undone. This will permanently delete the car listing.</p>
              <div class="dialog-actions">
                <button class="btn outline" @click="toDelete = null">Cancel</button>
                <button class="btn" style="background:#dc2626; color:#fff;" @click="confirmDelete()" :disabled="saving">{{ saving ? 'Deleting…' : 'Delete' }}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Car Form (Add/Edit) -->
        <div v-else-if="current === 'car-form'" class="space">
          <!-- Header -->
          <div class="form-header">
            <button class="btn ghost" @click="cancelForm" title="Back" aria-label="Back">⬅</button>
            <div class="form-headings">
              <h2>{{ form.id ? 'Edit Car #' + form.id : 'Add New Car' }}</h2>
              <p class="muted">{{ form.id ? 'Update vehicle information' : 'Add a new vehicle to inventory' }}</p>
            </div>
            <button class="btn primary" @click="saveCar" :disabled="saving">{{ saving ? 'Saving…' : '💾 Save Vehicle' }}</button>
          </div>

          <!-- Tabs -->
          <div class="tabs">
            <div class="tabs-list">
              <button :class="{ active: formTab==='basic' }" @click="formTab='basic'">Basic Info</button>
              <button :class="{ active: formTab==='images' }" @click="formTab='images'">Images</button>
              <button :class="{ active: formTab==='features' }" @click="formTab='features'">Features</button>
              <button :class="{ active: formTab==='specs' }" @click="formTab='specs'">Specifications</button>
              <button :class="{ active: formTab==='media' }" @click="formTab='media'">Media & Docs</button>
            </div>

            <!-- Basic Info -->
            <div v-show="formTab==='basic'" class="tab-panel">
              <div class="card">
                <div class="card-body">
                  <h2 class="card-title">Vehicle Information</h2>
                  <div class="form-grid">
                    <div class="field">
                      <label class="label" for="title">Title *</label>
                      <input id="title" class="input" v-model="form.title" placeholder="e.g., 2021 Škoda Octavia Combi" required />
                    </div>
                    <div class="field">
                      <label class="label" for="make">Make *</label>
                      <input id="make" class="input" v-model="form.make" placeholder="e.g., Škoda, BMW, Tesla" required />
                    </div>
                    <div class="field">
                      <label class="label" for="model">Model *</label>
                      <input id="model" class="input" v-model="form.model" placeholder="e.g., Octavia, M5, Model 3" required />
                    </div>
                    <div class="field">
                      <label class="label" for="year">Year *</label>
                      <input id="year" type="number" class="input" v-model.number="form.year" :min="1900" :max="new Date().getFullYear()+1" required />
                    </div>
                    <div class="field">
                      <label class="label" for="price">Price (€) *</label>
                      <input id="price" type="number" class="input" v-model.number="form.price" min="0" required />
                    </div>
                    <div class="field">
                      <label class="label" for="mileage">Mileage (km)</label>
                      <input id="mileage" type="number" class="input" v-model.number="form.mileage" min="0" />
                    </div>
                    <div class="field">
                      <label class="label" for="fuel_type">Fuel</label>
                      <input id="fuel_type" class="input" v-model="form.fuel_type" placeholder="e.g., Gasoline, Diesel, Hybrid, Electric" />
                    </div>
                    <div class="field">
                      <label class="label" for="transmission">Transmission</label>
                      <input id="transmission" class="input" v-model="form.transmission" placeholder="Automatic / Manual" />
                    </div>
                    <div class="field">
                      <label class="label" for="body_type">Body type</label>
                      <input id="body_type" class="input" v-model="form.body_type" placeholder="e.g., Wagon, Sedan, SUV" />
                    </div>
                    <div class="field">
                      <label class="label" for="color">Color</label>
                      <input id="color" class="input" v-model="form.color" />
                    </div>
                    <div class="field">
                      <label class="label" for="vin">VIN</label>
                      <input id="vin" class="input" v-model="form.vin" />
                    </div>
                  </div>

                  <div class="field" style="margin-top:.5rem;">
                    <label class="label" for="description">Description</label>
                    <textarea id="description" class="input" rows="6" v-model="form.description" placeholder="Describe the vehicle condition, history, and key selling points..."></textarea>
                  </div>

                  <div style="margin:.5rem 0; display:flex; gap:.5rem; align-items:center;">
                    <input id="featured" type="checkbox" v-model="form.featured" />
                    <label for="featured">Featured</label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Images -->
            <div v-show="formTab==='images'" class="tab-panel">
              <div class="card">
                <div class="card-body">
                  <h2 class="card-title">Vehicle Images</h2>

                  <div class="row-inline">
                    <input class="input" type="file" multiple accept="image/*" @change="uploadMedia($event)" :disabled="!form.id || uploading" />
                    <button class="btn" @click="triggerMedia" :disabled="!form.id || uploading">{{ uploading ? 'Uploading…' : 'Upload' }}</button>
                    <input ref="mediaInput" type="file" style="display:none" multiple accept="image/*" @change="uploadMedia($event)" />
                  </div>

                  <div v-if="(media||[]).length" class="images-grid">
                    <div v-for="m in media" :key="m.id" class="img-item">
                      <img v-if="m.type==='image'" :src="m.url" alt="" />
                      <div v-else class="video-placeholder" style="height:140px;">🎬 Video</div>
                      <button class="img-remove" @click="deleteMedia(m)">✖</button>
                    </div>
                  </div>
                  <div v-else class="empty">
                    <div class="empty-inner">
                      <div class="empty-icon">🖼️</div>
                      <p class="muted">No images uploaded yet</p>
                      <p class="muted small">Save the car first, then upload media</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Features -->
            <div v-show="formTab==='features'" class="tab-panel">
              <div class="card">
                <div class="card-body">
                  <h2 class="card-title">Vehicle Features</h2>
                  <div class="row-inline">
                    <input class="input" placeholder="e.g., Leather Seats, Sunroof, Navigation" v-model="newFeature" @keydown.enter.prevent="addFeature()" />
                    <button class="btn" @click="addFeature">➕ Add</button>
                    <button class="btn outline" @click="persistFeatures" :disabled="!form.id || saving">Save features</button>
                  </div>

                  <div v-if="features.length" class="chips">
                    <span v-for="(f,i) in features" :key="f+i" class="chip">{{ f }} <button type="button" class="x" @click="removeFeature(i)">×</button></span>
                  </div>
                  <div v-else class="empty">
                    <div class="empty-inner">
                      <p class="muted">No features added yet</p>
                      <p class="muted small">Add features to highlight what makes this vehicle special</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Specifications -->
            <div v-show="formTab==='specs'" class="tab-panel">
              <div class="card">
                <div class="card-body">
                  <h2 class="card-title">Technical Specifications</h2>
                  <div class="spec-row">
                    <input class="input" placeholder="Specification name (e.g., Engine)" v-model="newSpecKey" />
                    <div class="spec-value">
                      <input class="input" placeholder="Value (e.g., 3.0L V6)" v-model="newSpecValue" @keydown.enter.prevent="addSpecification()" />
                      <button class="btn" @click="addSpecification">＋</button>
                      <button class="btn outline" @click="persistSpecs" :disabled="!form.id || saving">Save specs</button>
                    </div>
                  </div>

                  <div v-if="Object.keys(specs).length" class="spec-list">
                    <div v-for="(val, key) in specs" :key="key" class="spec-item">
                      <div class="spec-text"><span class="bold">{{ key }}:</span><span class="spec-val">{{ val }}</span></div>
                      <button class="btn ghost" @click="removeSpecification(key)">✖</button>
                    </div>
                  </div>
                  <div v-else class="empty">
                    <div class="empty-inner">
                      <p class="muted">No specifications added yet</p>
                      <p class="muted small">Add technical details about the vehicle</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Media & Docs (documents) -->
            <div v-show="formTab==='media'" class="tab-panel">
              <div class="card">
                <div class="card-body">
                  <h2 class="card-title">Documents</h2>
                  <div class="spec-row">
                    <input class="input" placeholder="Optional type (e.g., Service, HU, Registration)" v-model="docType" />
                    <div class="spec-value">
                      <input ref="docInput" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*" class="input" @change="uploadDocuments($event)" :disabled="!form.id || uploadingDocs" />
                      <button class="btn" @click="triggerDocs" :disabled="!form.id || uploadingDocs">{{ uploadingDocs ? 'Uploading…' : 'Upload' }}</button>
                    </div>
                  </div>

                  <div v-if="(documents||[]).length" class="docs">
                    <div v-for="d in documents" :key="d.id" class="doc-item">
                      <div class="doc-left"><span>📄</span> <span class="bold">{{ d.filename || d.url }}</span> <span v-if="d.doc_type" class="badge" style="margin-left:.5rem;">{{ d.doc_type }}</span></div>
                      <button class="btn ghost" style="color:#dc2626" @click="deleteDocument(d)">Remove</button>
                    </div>
                  </div>
                  <div v-else class="empty">
                    <div class="empty-inner">
                      <div class="empty-icon">📄</div>
                      <p class="muted">No documents uploaded yet</p>
                      <p class="muted small">Save the car first, then upload documents</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Company -->
        <div v-else-if="current === 'company'" class="card">
          <div class="card-body">
            <h2 class="card-title">Company Info</h2>
            <form @submit.prevent="saveCompany">
              <div class="form-grid">
                <div class="field"><label class="label">Name</label><input class="input" v-model="company.name" /></div>
                <div class="field"><label class="label">Email</label><input class="input" v-model="company.email" /></div>
                <div class="field"><label class="label">Phone</label><input class="input" v-model="company.phone" /></div>
                <div class="field"><label class="label">Address</label><input class="input" v-model="company.address" /></div>
                <div class="field"><label class="label">Latitude</label><input class="input" type="number" step="0.000001" v-model.number="company.lat" /></div>
                <div class="field"><label class="label">Longitude</label><input class="input" type="number" step="0.000001" v-model.number="company.lng" /></div>
              </div>
              <div class="field" style="margin-top:.5rem;"><label class="label">About</label><textarea class="input" rows="6" v-model="company.about" /></div>
              <div style="margin-top:.75rem;"><button class="btn primary" :disabled="savingCompany">{{ savingCompany ? 'Saving…' : 'Save' }}</button></div>
            </form>
          </div>
        </div>

        <!-- Newsletter -->
        <div v-else-if="current === 'newsletter'" class="card">
          <div class="card-body">
            <h2 class="card-title">Newsletter</h2>
            <form @submit.prevent="sendNewsletter" class="space">
              <input class="input" placeholder="Subject" v-model="mail.subject" required />
              <textarea class="input" placeholder="HTML or text content" v-model="mail.html" rows="6" />
              <div>
                <button class="btn primary" :disabled="sending">{{ sending ? 'Sending…' : 'Send to all subscribers' }}</button>
              </div>
            </form>

            <h3 style="margin:1rem 0 .5rem;">Subscribers</h3>
            <div class="card" style="overflow:auto;">
              <table class="table">
                <thead><tr><th>ID</th><th>Email</th><th>Subscribed at</th></tr></thead>
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
        </div>

        <!-- Inquiries (mock for now) -->
        <div v-else-if="current === 'inquiries'" class="space">
          <div class="grid stats">
            <div class="card stat"><div class="card-body"><p class="muted">Total Inquiries</p><div class="value">{{ inquiries.length }}</div></div></div>
            <div class="card stat"><div class="card-body"><p class="muted">New</p><div class="value blue">{{ stats.new }}</div></div></div>
            <div class="card stat"><div class="card-body"><p class="muted">Contacted</p><div class="value amber">{{ stats.contacted }}</div></div></div>
            <div class="card stat"><div class="card-body"><p class="muted">Closed</p><div class="value green">{{ stats.closed }}</div></div></div>
          </div>
          <div class="card"><div class="card-body">Inquiries integration can be wired to backend when available.</div></div>
        </div>
      </main>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { CarsAPI, CompanyAPI, NewsletterAPI } from '../api.js';

// Navigation state
const current = ref('cars'); // default to cars while integrating
const mobileOpen = ref(false);

// Dashboard derived stats
const totals = reactive({ cars: 0, featured: 0 });
const byType = reactive({});
const recentActivity = ref([
  { action: 'Loaded admin data', details: 'Cars, company, newsletter', time: 'just now' },
]);
const avgPriceEUR = computed(() => {
  if (!carsState.items.length) return '—';
  const sum = carsState.items.reduce((a, c) => a + Number(c.price || 0), 0);
  const avg = sum / carsState.items.length;
  return formatPriceEUR(avg);
});
function percent(part, total) { if (!total) return 0; return Math.round((part / total) * 100); }

// Cars state backed by API
const carsState = reactive({ items: [], page: 1, totalPages: 1, q: '' });
const loadingCars = ref(false);
const saving = ref(false);
const toDelete = ref(null);
const uploading = ref(false);
const uploadingDocs = ref(false);

async function loadCars() {
  try {
    loadingCars.value = true;
    const data = await CarsAPI.list({ q: carsState.q, page: carsState.page, pageSize: 12, sort: 'created_at_desc' });
    carsState.items = data.items || [];
    carsState.totalPages = data.totalPages || 1;
    // Dashboard quick stats
    totals.cars = carsState.items.length;
    totals.featured = carsState.items.filter(x => !!x.featured).length;
    // Types breakdown (use body_type if present, else fallback)
    const counts = {};
    for (const c of carsState.items) {
      const t = c.body_type || c.type || 'Other';
      counts[t] = (counts[t] || 0) + 1;
    }
    for (const k in byType) delete byType[k];
    Object.assign(byType, counts);
  } finally { loadingCars.value = false; }
}
function carsGo(p) { carsState.page = p; loadCars(); }
function firstImage(c) { const m = (c.media || []).find(x => x.type==='image'); return m ? m.url : ''; }

function askDelete(c) { toDelete.value = c; }
async function confirmDelete() { if (!toDelete.value) return; try { saving.value = true; await CarsAPI.remove(toDelete.value.id); toDelete.value = null; await loadCars(); } finally { saving.value = false; } }
async function toggleFeatured(c, val) { await CarsAPI.feature(c.id, !!val); await loadCars(); }

// Form state (match backend schema keys)
const formTab = ref('basic');
const form = reactive({ id:null, title:'', make:'', model:'', year:'', price:'', mileage:'', fuel_type:'', transmission:'', body_type:'', color:'', vin:'', description:'', featured:false });
const media = ref([]); // from details API
const features = ref([]);
const specs = reactive({});
const documents = ref([]);

function blankForm() { Object.assign(form, { id:null, title:'', make:'', model:'', year:'', price:'', mileage:'', fuel_type:'', transmission:'', body_type:'', color:'', vin:'', description:'', featured:false }); media.value = []; features.value = []; clearSpecs(); documents.value = []; }
function clearSpecs() { for (const k of Object.keys(specs)) delete specs[k]; }

function startAddCar() { blankForm(); formTab.value = 'basic'; current.value = 'car-form'; mobileOpen.value = false; }
async function startEditCar(c) { blankForm(); Object.assign(form, c); formTab.value = 'basic'; current.value = 'car-form'; mobileOpen.value = false; await fetchCarDetails(c.id); }
function cancelForm() { current.value = 'cars'; }

async function fetchCarDetails(id) {
  try {
    const data = await CarsAPI.get(id);
    media.value = data.media || [];
    features.value = data.features || [];
    clearSpecs();
    Object.assign(specs, data.specs || {});
    documents.value = data.documents || [];
  } catch {}
}

async function saveCar() {
  try {
    saving.value = true;
    const payload = { ...form };
    delete payload.media; delete payload.features; delete payload.specs; delete payload.documents; // ensure no extra keys
    if (form.id) {
      await CarsAPI.update(form.id, payload);
    } else {
      const { id } = await CarsAPI.create(payload);
      form.id = id;
    }
    await persistFeatures();
    await persistSpecs();
    await fetchCarDetails(form.id);
    await loadCars();
    current.value = 'cars';
  } finally { saving.value = false; }
}

// Features
const newFeature = ref('');
function addFeature() { const v=(newFeature.value||'').trim(); if (!v) return; if (!features.value.includes(v)) features.value.push(v); newFeature.value=''; }
function removeFeature(i) { features.value.splice(i,1); }
async function persistFeatures() { if (!form.id) return; await CarsAPI.setFeatures(form.id, features.value || []); }

// Specs
const newSpecKey = ref('');
const newSpecValue = ref('');
function addSpecification() { const k=(newSpecKey.value||'').trim(); const v=(newSpecValue.value||'').trim(); if (!k || !v) return; specs[k]=v; newSpecKey.value=''; newSpecValue.value=''; }
function removeSpecification(key) { const { [key]:_, ...rest } = specs; clearSpecs(); Object.assign(specs, rest); }
async function persistSpecs() { if (!form.id) return; await CarsAPI.setSpecs(form.id, { ...specs }); }

// Media upload
const mediaInput = ref(null);
function triggerMedia() { mediaInput.value && mediaInput.value.click(); }
async function uploadMedia(e) { const files = Array.from(e.target.files || []); if (!files.length || !form.id) return; try { uploading.value = true; await CarsAPI.uploadMedia(form.id, files); e.target.value = ''; await fetchCarDetails(form.id); } finally { uploading.value = false; } }
async function deleteMedia(m) { if (!form.id || !m?.id) return; await CarsAPI.deleteMedia(form.id, m.id); await fetchCarDetails(form.id); }

// Documents
const docType = ref('');
const docInput = ref(null);
function triggerDocs() { docInput.value && docInput.value.click(); }
async function uploadDocuments(e) { const files = Array.from(e.target.files || []); if (!files.length || !form.id) return; try { uploadingDocs.value = true; await CarsAPI.uploadDocuments(form.id, files, docType.value || null); e.target.value=''; await fetchCarDetails(form.id); } finally { uploadingDocs.value = false; } }
async function deleteDocument(d) { if (!form.id || !d?.id) return; await CarsAPI.deleteDocument(form.id, d.id); await fetchCarDetails(form.id); }

// Company
const company = reactive({ name:'', address:'', phone:'', email:'', lat:52.52, lng:13.405, about:'' });
const savingCompany = ref(false);
async function loadCompany() { try { Object.assign(company, await CompanyAPI.get() || {}); } catch {} }
async function saveCompany() { try { savingCompany.value = true; Object.assign(company, await CompanyAPI.update(company)); } finally { savingCompany.value = false; } }

// Newsletter
const subscribers = ref([]);
const mail = reactive({ subject:'Latest cars from AM Automobile', html:'<p>Check our newest arrivals at https://yourdomain.com</p>' });
const sending = ref(false);
async function loadSubscribers() { try { const r = await NewsletterAPI.list(); subscribers.value = r.items || []; } catch {} }
async function sendNewsletter() { try { sending.value = true; await NewsletterAPI.send(mail); alert('Newsletter queued for sending'); } finally { sending.value = false; } }

// Inquiries (placeholder stats until backend exists)
const inquiries = ref([]);
const stats = computed(() => ({ total: inquiries.value.length, new: 0, contacted: 0, closed: 0 }));

// Helpers
function formatPriceEUR(v) { try { return new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(Number(v||0)); } catch { return `${v} €`; } }

// On mount, load data
onMounted(async () => {
  await loadCars();
  await loadCompany();
  await loadSubscribers();
});

function go(v) { current.value = v; mobileOpen.value = false; if (v==='cars') loadCars(); }
function logout() { try { window.history.length ? window.history.back() : (window.location.href = '/'); } catch { window.location.href = '/'; } }
</script>

<style scoped>
.admin-wrap { min-height: 100vh; display:flex; flex-direction:column; }
.space { display:grid; gap: 1rem; }
.topbar { position: sticky; top: 0; z-index: 30; background:#fff; border-bottom:1px solid #e5e7eb; }
.topbar-inner { display:flex; justify-content:space-between; align-items:center; padding:.8rem 1rem; }
.brand { display:flex; align-items:center; gap:.75rem; }
.brand h1 { font-size: 1.375rem; margin: 0; }
.icon-btn { border:1px solid #e5e7eb; border-radius:.5rem; width:40px; height:40px; display:inline-flex; align-items:center; justify-content:center; background:#fff; cursor:pointer; }
.icon-btn span { display:block; width:18px; height:2px; background:#0f172a; margin:2px 0; transition: .2s ease; }
.icon-btn span.open:nth-child(1) { transform: translateY(4px) rotate(45deg); }
.icon-btn span.open:nth-child(2) { opacity:0; }
.icon-btn span.open:nth-child(3) { transform: translateY(-4px) rotate(-45deg); }
.show-on-mobile { display:none; }

.admin-body { display:flex; min-height: calc(100vh - 64px); }
.sidebar { width: 260px; background:#fff; border-right:1px solid #e5e7eb; padding:1rem; position:sticky; top:64px; align-self:flex-start; height: calc(100vh - 64px); overflow:auto; }
.nav { display:flex; flex-direction:column; gap:.5rem; margin-top:.5rem; }
.nav-item { width:100%; text-align:left; display:flex; align-items:center; gap:.5rem; padding:.6rem .75rem; border-radius:.5rem; border:1px solid transparent; background:transparent; cursor:pointer; color:#0f172a; }
.nav-item .icon { width:1.25rem; text-align:center; }
.nav-item:hover { background:#f8fafc; }
.nav-item.active { background:#0b1b2b; color:#fff; }

.content { flex:1; padding: 1rem; }

/* Stats */
.grid { display:grid; gap: 1rem; }
.grid.stats { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid.two { grid-template-columns: repeat(1, minmax(0, 1fr)); }
@media(min-width: 768px){ .grid.stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media(min-width: 1024px){ .grid.stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.card { background:#fff; border:1px solid #e5e7eb; border-radius:.75rem; overflow:hidden; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
.card-body { padding: 1rem; }
.card-title { margin:.25rem 0 .75rem; font-size:1.1rem; }
.stat .muted { color:#6b7280; font-size:.85rem; margin:0; }
.stat .value { font-size:1.75rem; font-weight:700; }
.stat .value.blue { color:#2563eb; }
.stat .value.amber { color:#d97706; }
.stat .value.green { color:#16a34a; }
.stat .trend { font-size:.8rem; margin-top:.25rem; }
.stat .trend.up { color:#16a34a; }

.chart-placeholder, .pie-placeholder { height: 300px; border:1px dashed #cbd5e1; border-radius:.5rem; display:flex; align-items:center; justify-content:center; color:#64748b; background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #fff 10px, #fff 20px); }
.legend { display:flex; flex-direction:column; gap:.35rem; margin:0 0 .75rem; padding:0; list-style:none; color:#0f172a; }
.dot { display:inline-block; width:.6rem; height:.6rem; border-radius:999px; margin-right:.4rem; }
.dot.blue { background:#3b82f6; } .dot.green { background:#10b981; } .dot.amber { background:#f59e0b; } .dot.red { background:#ef4444; }

/* Cars */
.flex-between { display:flex; gap: 1rem; justify-content:space-between; align-items:center; }
.search-wrap { position:relative; flex:1; max-width: 420px; }
.search { padding-left: 2.1rem; }
.search-icon { position:absolute; left:.65rem; top:50%; transform:translateY(-50%); color:#9ca3af; }
.thumb { width:64px; height:64px; object-fit:cover; border-radius:.5rem; }
.bold { font-weight: 600; }
.row-actions { display:flex; gap:.25rem; justify-content:flex-end; }
.btn.danger, .btn.ghost.danger { color:#dc2626; }

/* Car form */
.form-header { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
.form-headings h2 { margin:0; }
.tabs { display:grid; gap:.75rem; }
.tabs-list { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:.5rem; }
@media(min-width: 720px){ .tabs-list { grid-template-columns: repeat(5, minmax(0,1fr)); } }
.tabs-list button { padding:.6rem .75rem; border:1px solid #e5e7eb; border-radius:.5rem; background:#fff; cursor:pointer; }
.tabs-list button.active { background:#0b1b2b; color:#fff; border-color:#0b1b2b; }
.tab-panel { display:block; }
.form-grid { display:grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap:.75rem; }
@media(min-width: 720px){ .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.field { display:flex; flex-direction:column; gap:.25rem; }
.row-inline { display:flex; gap:.5rem; align-items:center; }
.images-grid { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:.5rem; margin-top:.75rem; }
@media(min-width: 768px){ .images-grid { grid-template-columns: repeat(4, minmax(0,1fr)); } }
.img-item { position:relative; border-radius:.5rem; overflow:hidden; border:1px solid #e5e7eb; }
.img-item img { width:100%; height:140px; object-fit:cover; display:block; }
.img-remove { position:absolute; right:.35rem; top:.35rem; border:none; background:#dc2626; color:#fff; border-radius:.4rem; padding:.2rem .4rem; cursor:pointer; opacity:.9; }
.img-badge { position:absolute; left:.35rem; bottom:.35rem; background:#fff; color:#111827; border-radius:.4rem; padding:.1rem .4rem; font-size:.75rem; }

.empty { border:2px dashed #cbd5e1; border-radius:.5rem; padding:1.25rem; text-align:center; background: #f8fafc; }
.empty-inner { display:flex; align-items:center; justify-content:center; flex-direction:column; gap:.25rem; }
.empty-icon { font-size: 2rem; }

.chips { display:flex; gap:.5rem; flex-wrap:wrap; margin:.25rem 0; }
.chip { background:#f3f4f6; border:1px solid #e5e7eb; padding:.25rem .5rem; border-radius:999px; display:inline-flex; align-items:center; gap:.25rem; }
.chip .x { background:transparent; border:none; cursor:pointer; line-height:1; font-size:1rem; }

.spec-row { display:grid; grid-template-columns: 1fr; gap:.5rem; }
@media(min-width: 720px){ .spec-row { grid-template-columns: 1fr 1fr; } }
.spec-value { display:flex; gap:.5rem; }
.spec-list { display:grid; gap:.5rem; margin-top:.75rem; }
.spec-item { display:flex; align-items:center; justify-content:space-between; padding:.6rem .75rem; background:#f3f4f6; border-radius:.5rem; }
.spec-text { display:flex; align-items:center; gap:.5rem; }
.spec-val { color:#374151; }

.video-preview { position:relative; padding-top:56.25%; background:#1118270d; border-radius:.5rem; margin-top:.5rem; }
.video-placeholder { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#6b7280; border:1px dashed #cbd5e1; margin:.5rem; border-radius:.5rem; }

.docs { display:grid; gap:.5rem; margin-top:.75rem; }
.doc-item { display:flex; align-items:center; justify-content:space-between; padding:.6rem .75rem; background:#f3f4f6; border-radius:.5rem; }
.doc-left { display:flex; align-items:center; gap:.4rem; }

/* Company/newsletter/inquiries */
.contact { display:flex; flex-direction:column; gap:.2rem; font-size:.875rem; }
.msg { background:#f3f4f6; padding:.75rem; border-radius:.5rem; }

/* Simple dialog */
.dialog-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:50; padding:1rem; }
.dialog { background:#fff; border:1px solid #e5e7eb; border-radius:.75rem; padding:1rem; max-width:560px; width:100%; }
.dialog.large { max-width: 720px; }
.dialog h3 { margin:.25rem 0 .5rem; }
.dialog-actions { display:flex; gap:.5rem; justify-content:flex-end; margin-top:.75rem; }

/* Activity list */
.activity { display:flex; flex-direction:column; gap:.75rem; }
.activity .row { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:.75rem; border-bottom:1px solid #e5e7eb; }
.activity .row:last-child { border-bottom:none; }
.activity .title { font-weight:600; margin:0 0 .15rem; }
.activity .muted { color:#6b7280; margin:0; }
.activity .time { white-space:nowrap; color:#6b7280; font-size:.8rem; margin-left:1rem; }

/* Mobile */
@media(max-width: 1024px){
  .show-on-mobile { display:inline-flex; }
  .sidebar { position: fixed; left:0; top:64px; height: calc(100vh - 64px); transform: translateX(-100%); transition: transform .2s ease; z-index: 40; }
  .sidebar.open { transform: translateX(0); }
}
</style>
