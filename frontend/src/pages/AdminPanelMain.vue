<template>
  <section class="admin-wrap">
    <!-- Toast Notifications -->
    <div class="toast-container">
      <div v-for="toast in toasts" :key="toast.id" :class="['toast', toast.type]">
        <div class="toast-icon">
          <i v-if="toast.type === 'success'" class="fa-solid fa-circle-check"></i>
          <i v-else-if="toast.type === 'error'" class="fa-solid fa-circle-exclamation"></i>
          <i v-else-if="toast.type === 'warning'" class="fa-solid fa-triangle-exclamation"></i>
          <i v-else class="fa-solid fa-circle-info"></i>
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div v-if="toast.message" class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" @click="removeToast(toast.id)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
    <!-- Top Navigation Bar -->
    <header class="topbar">
      <div class="topbar-container">
        <div class="topbar-brand">
          <h1 class="topbar-title">Admin Dashboard</h1>
        </div>
        <nav class="topbar-nav">
          <button
            class="nav-item"
            :class="{ active: current === 'dashboard' }"
            @click="go('dashboard')"
            title="Dashboard"
          >
            <i class="fa-solid fa-chart-line icon"></i>
            <span class="nav-text">Dashboard</span>
          </button>
          <button
            class="nav-item"
            :class="{ active: ['cars','car-form'].includes(current) }"
            @click="go('cars')"
          >
            <i class="fa-solid fa-car icon"></i>
            <span class="nav-text">Car Management</span>
          </button>
          <button
            class="nav-item"
            :class="{ active: current === 'inquiries' }"
            @click="go('inquiries')"
          >
            <i class="fa-solid fa-comments icon"></i>
            <span class="nav-text">Inquiries</span>
          </button>
          <button
            class="nav-item"
            :class="{ active: current === 'company' }"
            @click="go('company')"
          >
            <i class="fa-solid fa-building icon"></i>
            <span class="nav-text">Company</span>
          </button>
          <button
            class="nav-item"
            :class="{ active: current === 'newsletter' }"
            @click="go('newsletter')"
          >
            <i class="fa-solid fa-envelope icon"></i>
            <span class="nav-text">Newsletter</span>
          </button>
        </nav>
        <button class="icon-btn mobile-menu-btn" @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
          <span :class="{ open: mobileOpen }"></span>
          <span :class="{ open: mobileOpen }"></span>
          <span :class="{ open: mobileOpen }"></span>
        </button>
      </div>
    </header>
    
    <!-- Mobile Menu Overlay -->
    <div v-if="mobileOpen" class="mobile-overlay" @click="mobileOpen = false">
      <nav class="mobile-nav" @click.stop>
        <button
          class="nav-item"
          :class="{ active: current === 'dashboard' }"
          @click="go('dashboard')"
        >
          <i class="fa-solid fa-chart-line icon"></i>
          <span class="nav-text">Dashboard</span>
        </button>
        <button
          class="nav-item"
          :class="{ active: ['cars','car-form'].includes(current) }"
          @click="go('cars')"
        >
          <i class="fa-solid fa-car icon"></i>
          <span class="nav-text">Car Management</span>
        </button>
        <button
          class="nav-item"
          :class="{ active: current === 'inquiries' }"
          @click="go('inquiries')"
        >
          <i class="fa-solid fa-comments icon"></i>
          <span class="nav-text">Inquiries</span>
        </button>
        <button
          class="nav-item"
          :class="{ active: current === 'company' }"
          @click="go('company')"
        >
          <i class="fa-solid fa-building icon"></i>
          <span class="nav-text">Company</span>
        </button>
        <button
          class="nav-item"
          :class="{ active: current === 'newsletter' }"
          @click="go('newsletter')"
        >
          <i class="fa-solid fa-envelope icon"></i>
          <span class="nav-text">Newsletter</span>
        </button>
      </nav>
    </div>
    
    <div class="admin-body">
      <!-- Main Content -->
      <main class="content">
        <!-- Dashboard -->
        <AdminPanelDashboard
          v-if="current === 'dashboard'"
          :totals="totals"
          :byType="byType"
          :recentActivity="recentActivity"
          :subscribersCount="subscribers.length"
          :activityPage="activityState.page"
          :activityTotalPages="activityState.totalPages"
          :activityLoading="activityState.loading"
          @change-activity-page="activityGo"
        />
        
        <!-- Cars List -->
        <AdminPanelCars
          v-else-if="current === 'cars'"
          :cars="carsState.items"
          :totals="totals"
          :loading="loadingCars"
          :saving="saving"
          :deleteTarget="toDelete"
          :searchQuery="carsState.q"
          :currentPage="carsState.page"
          :totalPages="carsState.totalPages"
          @search="loadCars"
          @reset-filters="resetFilters"
          @add-car="startAddCar"
          @edit-car="startEditCar"
          @delete-car="askDelete"
          @confirm-delete="confirmDelete"
          @cancel-delete="toDelete = null"
          @toggle-featured="toggleFeatured"
          @toggle-published="togglePublished"
          @change-page="carsGo"
          @update:searchQuery="carsState.q = $event"
        />
        
        <!-- Car Form -->
        <AdminPanelCarForm
          v-else-if="current === 'car-form'"
          :form="form"
          :current-tab="formTab"
          :media="media"
          :features="features"
          :specs="specs"
          :documents="documents"
          :saving="saving"
          :uploading="uploading"
          :uploadingDocs="uploadingDocs"
          :isFormValid="isFormValid"
          :newFeature="newFeature"
          :newSpecKey="newSpecKey"
          :newSpecValue="newSpecValue"
          :docType="docType"
          @update:current-tab="formTab = $event"
          @update:newFeature="newFeature = $event"
          @update:newSpecKey="newSpecKey = $event"
          @update:newSpecValue="newSpecValue = $event"
          @update:docType="docType = $event"
          @cancel="cancelForm"
          @save="saveCar"
          @add-feature="addFeature"
          @remove-feature="removeFeature"
          @persist-features="persistFeatures"
          @add-specification="addSpecification"
          @remove-specification="removeSpecification"
          @persist-specs="persistSpecs"
          @upload-media="uploadMedia"
          @delete-media="deleteMedia"
          @trigger-media-input="triggerMedia"
          @reorder-media="reorderMedia"
          @upload-documents="uploadDocuments"
          @delete-document="deleteDocument"
          @trigger-doc-input="triggerDocs"
          ref="carFormRef"
        />
        
        <!-- Company -->
        <AdminPanelCompany
          v-else-if="current === 'company'"
          :company="company"
          :savingCompany="savingCompany"
          @save="saveCompany"
          @update:company="Object.assign(company, $event)"
        />
        
        <!-- Newsletter -->
        <AdminPanelNewsletter
          v-else-if="current === 'newsletter'"
          :subscribers="subscribers"
          :mail="mail"
          :sending="sending"
          @send="sendNewsletter"
          @update:mail="Object.assign(mail, $event)"
          @refresh="loadSubscribers"
          @remove-subscriber="removeSubscriber"
        />
        
        <!-- Inquiries -->
        <AdminPanelCustomerInq
          v-else-if="current === 'inquiries'"
          :inquiries="inquiries"
          :stats="stats"
        />
      </main>
    </div>
  </section>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { CarsAPI, CompanyAPI, NewsletterAPI, ActivityAPI, InquiriesAPI } from '../api.js';
// Import subpage components
import AdminPanelDashboard from './AdminPanelDashboard.vue';
import AdminPanelCars from './AdminPanelCars.vue';
import AdminPanelCarForm from './AdminPanelCarForm.vue';
import AdminPanelCompany from './AdminPanelCompany.vue';
import AdminPanelNewsletter from './AdminPanelNewsletter.vue';
import AdminPanelCustomerInq from './AdminPanelCustomerInq.vue';
// Toast notification system
const toasts = ref([]);
let toastId = 0;
function showToast(type, title, message = '') {
  const id = ++toastId;
  toasts.value.push({ id, type, title, message });
  setTimeout(() => removeToast(id), 5000);
}
function removeToast(id) {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index > -1) toasts.value.splice(index, 1);
}
// Navigation state
const current = ref('cars');
const mobileOpen = ref(false);
const sidebarCollapsed = ref(false);
const refreshing = ref(false);
// Dashboard derived stats
const totals = reactive({ cars: 0, featured: 0 });
const byType = reactive({});

// Activity state with pagination
const activityState = reactive({
  items: [],
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
  loading: false
});

// Computed property for recent activity (for backward compatibility)
const recentActivity = computed(() => activityState.items);

async function loadActivity(page = 1) {
  try {
    activityState.loading = true;
    const data = await ActivityAPI.list({ page, pageSize: activityState.pageSize });
    activityState.items = data.items.map(item => ({
      id: item.id,
      action: item.action,
      details: item.details,
      time: formatActivityTime(item.createdAt),
      timestamp: new Date(item.createdAt)
    }));
    activityState.page = data.page;
    activityState.total = data.total;
    activityState.totalPages = data.totalPages;
  } catch (error) {
    console.error('Failed to load activity:', error);
    showToast('error', 'Failed to load activity logs', error.message);
  } finally {
    activityState.loading = false;
  }
}

function formatActivityTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

async function addActivity(action, details) {
  try {
    await ActivityAPI.create({ action, details });
    // Reload activity to show the new entry
    await loadActivity(activityState.page);
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't show error toast for activity logging failures (non-critical)
  }
}

function activityGo(page) {
  loadActivity(page);
}
const avgPriceEUR = computed(() => {
  if (!carsState.items.length) return '—';
  const sum = carsState.items.reduce((a, c) => a + Number(c.price || 0), 0);
  const avg = sum / carsState.items.length;
  return formatPriceEUR(avg);
});
function percent(part, total) { if (!total) return 0; return Math.round((part / total) * 100); }
// Cars state backed by API
const carsState = reactive({
  items: [],
  page: 1,
  totalPages: 1,
  q: ''
});
const loadingCars = ref(false);
const saving = ref(false);
const toDelete = ref(null);
const uploading = ref(false);
const uploadingDocs = ref(false);
async function loadCars() {
  try {
    loadingCars.value = true;
    const data = await CarsAPI.list({ q: carsState.q, page: carsState.page, pageSize: 12, sort: 'created_at_desc', showUnpublished: 'true' });
    // Use data from API
    carsState.items = data.items || [];
    carsState.totalPages = data.totalPages || 1;
    // Dashboard quick stats
    totals.cars = data.total || 0;
    totals.featured = carsState.items.filter(x => !!x.featured).length;
    // Types breakdown
    const counts = {};
    for (const c of carsState.items) {
      const t = c.body_type || c.type || 'Other';
      counts[t] = (counts[t] || 0) + 1;
    }
    for (const k in byType) delete byType[k];
    Object.assign(byType, counts);
  } catch (error) {
    showToast('error', 'Failed to load vehicles', error.message);
  } finally {
    loadingCars.value = false;
  }
}
function carsGo(p) { carsState.page = p; loadCars(); }
function firstImage(c) { const m = (c.media || []).find(x => x.type==='image'); return m ? m.url : ''; }
function resetFilters() { carsState.q = ''; carsState.page = 1; loadCars(); }
function askDelete(c) { toDelete.value = c; }
async function confirmDelete() {
  if (!toDelete.value) return;
  const carTitle = toDelete.value.title || 'Vehicle';
  try {
    saving.value = true;
    await CarsAPI.remove(toDelete.value.id);
    showToast('success', 'Vehicle deleted', 'The vehicle has been permanently removed');
    addActivity('Deleted vehicle', carTitle);
    toDelete.value = null;
    await loadCars();
  } catch (error) {
    showToast('error', 'Delete failed', error.message);
  } finally {
    saving.value = false;
  }
}
async function toggleFeatured(c, val) {
  if (!c.published && val) {
    showToast('warning', 'Cannot feature unpublished vehicle', 'Please publish the vehicle first before featuring it');
    return;
  }
  try {
    await CarsAPI.feature(c.id, !!val);
    showToast('success', val ? 'Vehicle featured' : 'Feature removed');
    addActivity(val ? 'Featured vehicle' : 'Removed feature', c.title || `Car #${c.id}`);
    await loadCars();
  } catch (error) {
    showToast('error', 'Update failed', error.message);
  }
}
async function togglePublished(c, val) {
  try {
    // If unpublishing, also remove featured status
    if (!val && c.featured) {
      await CarsAPI.feature(c.id, false);
    }
    await CarsAPI.publish(c.id, !!val);
    showToast('success', val ? 'Vehicle published' : 'Vehicle unpublished');
    addActivity(val ? 'Published vehicle' : 'Unpublished vehicle', c.title || `Car #${c.id}`);
    await loadCars();
  } catch (error) {
    showToast('error', 'Update failed', error.message);
  }
}
// Form state (match backend schema keys)
const formTab = ref('basic');
const form = reactive({ id:null, title:'', make:'', model:'', year:'', price:'', mileage:'', fuel_type:'', transmission:'', body_type:'', color:'', vin:'', description:'', featured:false, published:false });
const media = ref([]); // from details API
const features = ref([]);
const specs = reactive({});
const documents = ref([]);
function blankForm() { Object.assign(form, { id:null, title:'', make:'', model:'', year:'', price:'', mileage:'', fuel_type:'', transmission:'', body_type:'', color:'', vin:'', description:'', featured:false, published:false }); media.value = []; features.value = []; clearSpecs(); documents.value = []; }
function clearSpecs() { for (const k of Object.keys(specs)) delete specs[k]; }
function startAddCar() { blankForm(); formTab.value = 'basic'; current.value = 'car-form'; mobileOpen.value = false; }
async function startEditCar(c) { blankForm(); Object.assign(form, c); formTab.value = 'basic'; current.value = 'car-form'; mobileOpen.value = false; await fetchCarDetails(c.id); }
function cancelForm() { current.value = 'cars'; }
async function fetchCarDetails(id) {
  try {
    const data = await CarsAPI.get(id, { showUnpublished: 'true' });
    media.value = data.media || [];
    features.value = data.features || [];
    clearSpecs();
    Object.assign(specs, data.specs || {});
    documents.value = data.documents || [];
  } catch {}
}
// Form validation
const isFormValid = computed(() => {
  return form.title && form.make && form.model && form.year && form.price;
});
async function saveCar() {
  if (!isFormValid.value) {
    showToast('warning', 'Missing required fields', 'Please fill in all required fields');
    return;
  }
  
  try {
    saving.value = true;
    const payload = { ...form };
    delete payload.media; delete payload.features; delete payload.specs; delete payload.documents;
    
    const isUpdate = !!form.id;
    if (isUpdate) {
      await CarsAPI.update(form.id, payload);
      showToast('success', 'Vehicle updated', 'Changes have been saved successfully');
      addActivity('Updated vehicle', form.title || `Car #${form.id}`);
    } else {
      const { id } = await CarsAPI.create(payload);
      form.id = id;
      showToast('success', 'Vehicle created', 'New vehicle added to inventory');
      addActivity('Added new vehicle', form.title || `Car #${id}`);
    }
    
    await persistFeatures();
    await persistSpecs();
    await fetchCarDetails(form.id);
    await loadCars();
    current.value = 'cars';
  } catch (error) {
    showToast('error', 'Save failed', error.message);
  } finally {
    saving.value = false;
  }
}
// Features
const newFeature = ref('');
function addFeature(feature) {
  // Support both direct string parameter and newFeature ref
  const v = typeof feature === 'string' ? feature.trim() : (newFeature.value || '').trim();
  if (!v) return;
  if (!features.value.includes(v)) {
    features.value.push(v);
    showToast('success', 'Feature added');
  }
  if (typeof feature !== 'string') {
    newFeature.value = '';
  }
}
function removeFeature(i) { features.value.splice(i, 1); }
async function persistFeatures() {
  if (!form.id) return;
  try {
    await CarsAPI.setFeatures(form.id, features.value || []);
    showToast('success', 'Features saved');
  } catch (error) {
    showToast('error', 'Failed to save features', error.message);
  }
}
// Specs
const newSpecKey = ref('');
const newSpecValue = ref('');
function addSpecification() { const k=(newSpecKey.value||'').trim(); const v=(newSpecValue.value||'').trim(); if (!k || !v) return; specs[k]=v; newSpecKey.value=''; newSpecValue.value=''; }
function removeSpecification(key) { const { [key]:_, ...rest } = specs; clearSpecs(); Object.assign(specs, rest); }
async function persistSpecs() { if (!form.id) return; await CarsAPI.setSpecs(form.id, { ...specs }); }
// Media upload
const carFormRef = ref(null);
function triggerMedia() {
  const input = carFormRef.value?.$refs?.mediaInput;
  if (input) input.click();
}
async function uploadMedia(e) { const files = Array.from(e.target.files || []); if (!files.length || !form.id) return; try { uploading.value = true; await CarsAPI.uploadMedia(form.id, files); e.target.value = ''; await fetchCarDetails(form.id); showToast('success', 'Images uploaded'); } finally { uploading.value = false; } }
async function reorderMedia(newOrder) {
  if (!form.id || !newOrder || !newOrder.length) return;
  try {
    await CarsAPI.reorderMedia(form.id, newOrder);
    // Update local state immediately for smooth UX
    const reorderedMedia = newOrder.map(id => media.value.find(m => m.id === id)).filter(Boolean);
    media.value = reorderedMedia;
    showToast('success', 'Image order updated');
  } catch (error) {
    showToast('error', 'Failed to update order', error.message);
    await fetchCarDetails(form.id); // Reload on error
  }
}
async function deleteMedia(m) { if (!form.id || !m?.id) return; await CarsAPI.deleteMedia(form.id, m.id); showToast('success', 'Image deleted'); await fetchCarDetails(form.id); }
// Documents
const docType = ref('');
function triggerDocs() {
  const input = carFormRef.value?.$refs?.docInput;
  if (input) input.click();
}
async function uploadDocuments(e) { const files = Array.from(e.target.files || []); if (!files.length || !form.id) return; try { uploadingDocs.value = true; await CarsAPI.uploadDocuments(form.id, files, docType.value || null); e.target.value=''; await fetchCarDetails(form.id); } finally { uploadingDocs.value = false; } }
async function deleteDocument(d) { if (!form.id || !d?.id) return; await CarsAPI.deleteDocument(form.id, d.id); await fetchCarDetails(form.id); }
// Company
const company = reactive({ name:'', address:'', phone:'', email:'', lat:52.52, lng:13.405, about:'' });
const savingCompany = ref(false);
async function loadCompany() {
  try {
    Object.assign(company, await CompanyAPI.get() || {});
  } catch (error) {
    showToast('error', 'Failed to load company info', error.message);
  }
}
async function saveCompany() {
  try {
    savingCompany.value = true;
    Object.assign(company, await CompanyAPI.update(company));
    showToast('success', 'Company information saved');
    addActivity('Updated company info', company.name || 'Company details');
  } catch (error) {
    showToast('error', 'Save failed', error.message);
  } finally {
    savingCompany.value = false;
  }
}
// Newsletter
const subscribers = ref([]);
const mail = reactive({ subject:'Latest cars from MK Automobile', html:'<p>Check our newest arrivals at https://yourdomain.com</p>' });
const sending = ref(false);
async function loadSubscribers() {
  try {
    const r = await NewsletterAPI.list();
    const prevCount = subscribers.value.length;
    subscribers.value = r.items || [];
    const newCount = subscribers.value.length;
    // Track new subscribers
    if (prevCount > 0 && newCount > prevCount) {
      const diff = newCount - prevCount;
      addActivity('New subscriber(s)', `${diff} new newsletter subscriber${diff > 1 ? 's' : ''}`);
    }
  } catch (error) {
    showToast('error', 'Failed to load subscribers', error.message);
  }
}
async function sendNewsletter() {
  if (!mail.subject || !mail.html) {
    showToast('warning', 'Missing content', 'Please fill in subject and content');
    return;
  }
  
  try {
    sending.value = true;
    const count = subscribers.value.length;
    await NewsletterAPI.send(mail);
    showToast('success', 'Newsletter sent', `Sent to ${count} subscribers`);
    addActivity('Sent newsletter', `"${mail.subject}" to ${count} subscribers`);
    mail.subject = 'Latest cars from MK Automobile';
    mail.html = '<p>Check our newest arrivals at https://yourdomain.com</p>';
  } catch (error) {
    showToast('error', 'Send failed', error.message);
  } finally {
    sending.value = false;
  }
}
async function removeSubscriber(id) {
  try {
    await NewsletterAPI.remove(id);
    showToast('success', 'Subscriber removed', 'The subscriber has been removed from the list');
    addActivity('Removed subscriber', `Subscriber #${id}`);
    await loadSubscribers();
  } catch (error) {
    showToast('error', 'Failed to remove subscriber', error.message);
  }
}
// Inquiries
const inquiries = ref([]);
const inquiriesStats = ref({ total: 0, pending: 0, in_progress: 0, resolved: 0 });

async function loadInquiries() {
  try {
    const [inquiriesData, statsData] = await Promise.all([
      InquiriesAPI.list(),
      InquiriesAPI.stats()
    ]);
    inquiries.value = inquiriesData.items || [];
    inquiriesStats.value = statsData;
  } catch (error) {
    console.error('Failed to load inquiries:', error);
    showToast('error', 'Failed to load inquiries', error.message);
  }
}

// Backward compatibility computed property
const stats = computed(() => inquiriesStats.value);
// Helpers
function formatPriceEUR(v) {
  try {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(v || 0));
  } catch {
    return `${v} €`;
  }
}
function formatNumber(v) {
  try {
    return new Intl.NumberFormat('de-DE').format(Number(v || 0));
  } catch {
    return v;
  }
}
function formatDate(date) {
  try {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return date;
  }
}
async function loadAllData() {
  refreshing.value = true;
  try {
    await Promise.all([loadCars(), loadCompany(), loadSubscribers(), loadActivity(), loadInquiries()]);
    showToast('success', 'Data refreshed');
  } catch (error) {
    showToast('error', 'Refresh failed', error.message);
  } finally {
    refreshing.value = false;
  }
}
// On mount, load data
onMounted(async () => {
  try {
    await loadAllData();
    addActivity('Dashboard loaded', 'Admin panel initialized');
  } catch (error) {
    showToast('error', 'Failed to load initial data', error.message);
  }
});
function go(v) {
  current.value = v;
  mobileOpen.value = false;
  if (v === 'cars') loadCars();
}
function logout() {
  try {
    window.history.length ? window.history.back() : (window.location.href = '/');
  } catch {
    window.location.href = '/';
  }
}
</script>
<style scoped>
/* Toast Notifications */
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 420px;
}
.toast {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  animation: slideIn 0.3s ease;
  border-left: 4px solid #3b82f6;
}
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.toast.success { border-left-color: #10b981; }
.toast.error { border-left-color: #ef4444; }
.toast.warning { border-left-color: #f59e0b; }
.toast.info { border-left-color: #3b82f6; }
.toast-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}
.toast.success .toast-icon { color: #10b981; }
.toast.error .toast-icon { color: #ef4444; }
.toast.warning .toast-icon { color: #f59e0b; }
.toast.info .toast-icon { color: #3b82f6; }
.toast-content {
  flex: 1;
}
.toast-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.125rem;
}
.toast-message {
  font-size: 0.875rem;
  color: #6b7280;
}
.toast-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  flex-shrink: 0;
}
.toast-close:hover {
  background: #f3f4f6;
  color: #111827;
}
/* Admin Layout */
.admin-wrap { min-height: 100vh; display:flex; flex-direction:column; background: #f9fafb; }

/* Top Navigation Bar */
.topbar {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  top: 0;
  z-index: 30;
  border-radius: 0.75rem;
  margin: 0.5rem;
}

.topbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 2rem;
  max-width: 1920px;
  margin: 0 auto;
  gap: 2rem;
}

.topbar-brand {
  flex-shrink: 0;
}

.topbar-title {
  font-size: 1.25rem;
  margin: 0;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
}

.topbar-nav {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
  align-items: center;
}

.mobile-menu-btn {
  display: inline-flex;
}

/* Hide burger menu on desktop */
@media(min-width: 1025px){
  .mobile-menu-btn {
    display: none !important;
  }
}

.space { display:grid; gap: 1.25rem; }
.icon-btn {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  width: 40px;
  height: 40px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #fff;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}
.icon-btn span {
  display: block;
  width: 18px;
  height: 2px;
  background: #0f172a;
  transition: all 0.2s ease;
  margin: 0;
}
.icon-btn span.open:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.icon-btn span.open:nth-child(2) { opacity: 0; }
.icon-btn span.open:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

@keyframes spin {
  to { transform: rotate(360deg); }
}
.spinning {
  animation: spin 1s linear infinite;
}

.admin-body {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px);
}

.nav-item {
  text-align: center;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  color: #0f172a;
  font-weight: 500;
  transition: all 0.15s ease;
  position: relative;
  justify-content: center;
  white-space: nowrap;
}

.nav-item .icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.nav-text {
  font-size: 0.9375rem;
}

.nav-item:hover {
  background: #f8fafc;
  color: #1e40af;
}

.nav-item.active {
  background: #3b82f6;
  color: #fff;
  box-shadow: 0 2px 4px rgba(30, 64, 175, 0.2);
}

/* Mobile Menu Overlay */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: none;
  animation: fadeIn 0.2s ease;
}

.mobile-nav {
  position: absolute;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background: #fff;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  animation: slideInRight 0.2s ease;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.mobile-nav .nav-item {
  justify-content: flex-start;
  text-align: left;
  padding: 0.875rem 1rem;
}

.content {
  flex: 1;
  padding-top: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}
/* Page Headers */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}
.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.page-subtitle {
  font-size: 0.9375rem;
  color: #64748b;
  margin: 0.375rem 0 0;
}
.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.section-title i {
  color: #3b82f6;
}
/* Stats */
.grid { display:grid; gap: 1rem; }
.grid.stats { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid.two { grid-template-columns: repeat(1, minmax(0, 1fr)); }
@media(min-width: 768px){ .grid.stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media(min-width: 1024px){ .grid.stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.card { background:#fff; border:1px solid #e5e7eb; border-radius:.75rem; overflow:hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08); transition: box-shadow 0.2s ease; }
.card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.12); }
.card-body { padding: 1.5rem; }
.card-title { margin:.5rem 0 1rem; font-size:1.125rem; font-weight: 600; color: #0f172a; }
/* Enhanced Stats Cards */
.stat { position: relative; overflow: visible; }
.stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: .75rem .75rem 0 0;
}
.stat.stat-success::before { background: linear-gradient(90deg, #10b981, #34d399); }
.stat.stat-warning::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.stat.stat-info::before { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
.stat-icon.blue { background: #eff6ff; color: #3b82f6; }
.stat-icon.green { background: #f0fdf4; color: #10b981; }
.stat-icon.amber { background: #fffbeb; color: #f59e0b; }
.stat-icon.purple { background: #faf5ff; color: #8b5cf6; }
.stat-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}
.stat-badge.success { background: #dcfce7; color: #16a34a; }
.stat-badge.warning { background: #fef3c7; color: #d97706; }
.stat-badge.info { background: #ede9fe; color: #7c3aed; }
.stat .muted { color:#64748b; font-size:.875rem; margin:0.5rem 0 0; font-weight: 500; }
.stat .value { font-size:2.25rem; font-weight:800; color: #0f172a; line-height: 1; margin: 0.5rem 0; }
.stat .value.small { font-size: 1.75rem; }
.stat .value.blue { color:#2563eb; }
.stat .value.amber { color:#d97706; }
.stat .value.green { color:#16a34a; }
.stat-footer {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}
.stat .trend {
  font-size:.8125rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.stat .trend.up { color:#16a34a; }
.stat .trend.neutral { color:#64748b; }
.chart-placeholder, .pie-placeholder { height: 300px; border:1px dashed #cbd5e1; border-radius:.5rem; display:flex; align-items:center; justify-content:center; color:#64748b; background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #fff 10px, #fff 20px); }
.legend { display:flex; flex-direction:column; gap:.35rem; margin:0 0 .75rem; padding:0; list-style:none; color:#0f172a; }
.dot { display:inline-block; width:.6rem; height:.6rem; border-radius:999px; margin-right:.4rem; }
.dot.blue { background:#3b82f6; } .dot.green { background:#10b981; } .dot.amber { background:#f59e0b; } .dot.red { background:#ef4444; }
/* Filters Bar */
.filters-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  background: #fff;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}
.search-wrap { position:relative; flex:1; max-width: 480px; }
.search { padding-left: 2.75rem; font-size: 0.9375rem; }
.search-icon { position:absolute; left:1rem; top:50%; transform:translateY(-50%); color:#9ca3af; font-size: 1rem; }
/* Table Enhancements */
.table-card {
  overflow: hidden;
}
.table-wrapper {
  overflow-x: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e5e7eb;
}
.table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}
.table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;
}
.table-row:hover {
  background: #f8fafc;
}
.table td {
  padding: 1.25rem 1rem;
  vertical-align: middle;
}
.thumb-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}
.table-row:hover .thumb-wrapper {
  border-color: #3b82f6;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.15);
}
.thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.thumb-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 2rem;
}
.cell-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.vehicle-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
  margin-bottom: 0.25rem;
}
.vehicle-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  flex-wrap: wrap;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}
.meta-item i {
  font-size: 0.75rem;
  color: #94a3b8;
}
.meta-divider {
  color: #cbd5e1;
  font-weight: 300;
}
.vehicle-vin {
  font-size: 0.8125rem;
  color: #94a3b8;
  font-family: 'Courier New', monospace;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: #f8fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  width: fit-content;
}
.vehicle-vin i {
  font-size: 0.75rem;
}
.specs-cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.spec-row-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}
.spec-row-inline i {
  width: 1rem;
  text-align: center;
  color: #3b82f6;
  font-size: 0.875rem;
}
.spec-label {
  color: #64748b;
  min-width: 60px;
}
.spec-value {
  color: #0f172a;
  font-weight: 600;
}
.spec-value-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 0.375rem;
  font-weight: 700;
  font-size: 0.875rem;
}
.price-cell {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.price-amount {
  font-size: 1.25rem;
  font-weight: 800;
  color: #059669;
  line-height: 1;
}
.price-label {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
}
.cell-subtitle {
  font-size: 0.8125rem;
  color: #64748b;
}
.cell-icon {
  color: #9ca3af;
  margin-right: 0.5rem;
}
.bold { font-weight: 600; color: #0f172a; }
.price-text {
  color: #059669;
  font-weight: 700;
}
.year-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  background: #f1f5f9;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #475569;
}
.loading-cell, .empty-cell {
  text-align: center;
  padding: 3rem 1.25rem !important;
  color: #64748b;
}
.loading-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.loader {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.empty-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.empty-cell i {
  font-size: 2rem;
  color: #cbd5e1;
}
/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}
.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.toggle-slider {
  position: absolute;
  inset: 0;
  background-color: #cbd5e1;
  border-radius: 9999px;
  transition: 0.2s;
}
.toggle-slider:before {
  content: "";
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.2s;
}
.toggle-switch input:checked + .toggle-slider {
  background-color: #10b981;
}
.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}
.row-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
.btn-action {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.15s ease;
  background: #f1f5f9;
  color: #475569;
}
.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.btn-action.primary {
  background: #dbeafe;
  color: #1e40af;
}
.btn-action.primary:hover {
  background: #3b82f6;
  color: #fff;
}
.btn-action.danger {
  background: #fee2e2;
  color: #dc2626;
}
.btn-action.danger:hover {
  background: #dc2626;
  color: #fff;
}
.icon-btn-small { padding: 0.5rem !important; }
.btn.danger, .btn.ghost.danger { color:#dc2626; }
.btn.danger:hover { background: #fee2e2; }
/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #fff;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}
.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}
.pagination-controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.pagination-pages {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.5rem;
  font-weight: 600;
}
.page-number {
  color: #64748b;
}
.page-divider {
  color: #cbd5e1;
}
.page-total {
  color: #64748b;
}
/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1;
}
.badge.success { background: #dcfce7; color: #16a34a; }
.badge.warning { background: #fef3c7; color: #d97706; }
.badge.danger { background: #fee2e2; color: #dc2626; }
.badge.info { background: #dbeafe; color: #2563eb; }
.badge-outline { background: transparent; border: 1px solid #e5e7eb; color: #475569; }
.id-badge {
  font-family: monospace;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
}
/* Car form */
.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: #fff;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.form-headings h2 { margin:0; font-size: 1.5rem; font-weight: 700; color: #0f172a; }
.form-headings .muted { margin: 0.25rem 0 0; }
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
.empty-icon { font-size: 2rem; color: #9ca3af; }
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
/* Alerts */
.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  border: 1px solid;
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
.alert-info {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
}
.alert-success {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #166534;
}
.alert-warning {
  background: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}
.alert-error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}
/* Enhanced Dialogs */
.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.dialog {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 0;
  max-width: 560px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: scaleIn 0.2s ease;
}
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.dialog.large { max-width: 720px; }
.dialog-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.dialog-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}
.dialog-icon.danger {
  background: #fee2e2;
  color: #dc2626;
}
.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}
.dialog-body {
  padding: 1.5rem;
}
.dialog-body p {
  margin: 0 0 0.75rem;
  color: #475569;
  line-height: 1.6;
}
.dialog-body p:last-child {
  margin-bottom: 0;
}
.warning-text {
  color: #dc2626;
  font-weight: 500;
  background: #fef2f2;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border-left: 3px solid #dc2626;
}
.dialog-actions {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  background: #f9fafb;
  border-radius: 0 0 1rem 1rem;
}
/* Activity list */
.activity { display:flex; flex-direction:column; gap:.75rem; }
.activity .row { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:.75rem; border-bottom:1px solid #e5e7eb; }
.activity .row:last-child { border-bottom:none; }
.activity .title { font-weight:600; margin:0 0 .15rem; }
.activity .muted { color:#6b7280; margin:0; }
.activity .time { white-space:nowrap; color:#6b7280; font-size:.8rem; margin-left:1rem; }
/* Field hints */
.field-hint {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  color: #64748b;
}
/* Responsive */
@media(max-width: 1024px){
  .topbar-container {
    padding: 0.75rem 1rem;
  }
  
  .topbar-nav {
    display: none !important;
  }
  
  .mobile-overlay {
    display: flex;
    justify-content: flex-end;
  }
  
  .content { padding: 1rem; }
  .page-title { font-size: 1.5rem; }
  .toast-container { right: 0.5rem; left: 0.5rem; max-width: none; }
  .form-header { flex-direction: column; align-items: stretch; }
  .pagination { flex-direction: column; gap: 1rem; }
  .filters-bar { flex-direction: column; }
  .search-wrap { max-width: none; }
}
@media(max-width: 640px) {
  .brand-subtitle { display: none; }
  .hide-sm { display: none; }
  .table th, .table td { padding: 0.75rem 0.5rem; font-size: 0.875rem; }
  .thumb-wrapper { width: 60px; height: 60px; }
}
</style>