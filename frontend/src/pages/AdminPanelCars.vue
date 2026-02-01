<template>
  <div class="space">
    <div class="page-header">
      <div class="page-header-text">
        <h2 class="page-title">Car Management</h2>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-bar">
      <div class="search-wrap">
        <i class="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          class="input search"
          placeholder="Search by make, model, title..."
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          @keyup.enter="$emit('search')"
        />
      </div>
      <div class="row-inline">
        <button class="btn outline" @click="$emit('search')" :disabled="loading">
          <i class="fa-solid fa-magnifying-glass"></i>
          {{ loading ? 'Searching…' : 'Search' }}
        </button>
        <button class="btn outline" @click="$emit('reset-filters')" :disabled="loading">
          <i class="fa-solid fa-filter-circle-xmark"></i>
          Reset
        </button>
        <button class="btn primary" @click="$emit('add-car')">
          <i class="fa-solid fa-plus"></i>
          Add New Vehicle
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card table-card">
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th style="width:120px; text-align:center;">Image</th>
              <th style="min-width:240px; text-align:left;">Vehicle Details</th>
              <th style="min-width:180px; text-align:left;">Specifications</th>
              <th style="min-width:120px; text-align:left;">Price</th>
              <th style="width:100px; text-align:center;">Featured</th>
              <th style="width:100px; text-align:center;">Published</th>
              <th style="text-align:center; width: 140px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in cars" :key="c.id" class="table-row">
              <td>
                <div class="thumb-wrapper">
                  <img
                    v-if="firstImage(c)"
                    :src="firstImage(c)"
                    :alt="c.title || (c.make + ' ' + c.model)"
                    class="thumb"
                  />
                  <div v-else class="thumb-placeholder">
                    <i class="fa-solid fa-car"></i>
                  </div>
                </div>
              </td>
              <td>
                <div class="cell-content">
                  <div class="vehicle-title">{{ c.title || 'Untitled' }}</div>
                  <div class="vehicle-meta">
                    <i class="fa-solid fa-building"></i>
                    {{ c.make || '—' }}
                    <span class="meta-divider">|</span>
                    <i class="fa-solid fa-car"></i>
                    {{ c.model || '—' }}
                  </div>
                  <div v-if="c.vin" class="vehicle-vin">
                    <i class="fa-solid fa-barcode"></i>
                    VIN: {{ c.vin }}
                  </div>
                </div>
              </td>
              <td>
                <div class="specs-cell">
                  <div class="spec-row-inline">
                    <i class="fa-solid fa-calendar-days"></i>
                    <span class="spec-value">{{ c.year || '—' }}</span>
                  </div>
                  <div class="spec-row-inline">
                    <i class="fa-solid fa-gauge-high"></i>
                    <span class="spec-value">{{ c.mileage ? formatNumber(c.mileage) + ' km' : '—' }}</span>
                  </div>
                  <div class="spec-row-inline">
                    <i class="fa-solid fa-gas-pump"></i>
                    <span class="spec-value">{{ c.fuel_type || '—' }}</span>
                  </div>
                  <div class="spec-row-inline">
                    <i class="fa-solid fa-gears"></i>
                    <span class="spec-value">{{ c.transmission || '—' }}</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="price-cell">
                  <div class="price-amount">{{ formatPriceEUR(c.price) }}</div>
                </div>
              </td>
              <td style="text-align:center;">
                <label
                  class="toggle-switch"
                  :class="{ disabled: !c.published }"
                  :title="!c.published ? 'Publish the car first to feature it' : (c.featured ? 'Featured' : 'Not featured')"
                >
                  <input
                    type="checkbox"
                    :checked="!!c.featured"
                    :disabled="!c.published"
                    @change="$emit('toggle-featured', c, $event.target.checked)"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </td>
              <td style="text-align:center;">
                <label class="toggle-switch" :title="c.published ? 'Published' : 'Not published'">
                  <input type="checkbox" :checked="!!c.published" @change="$emit('toggle-published', c, $event.target.checked)" />
                  <span class="toggle-slider toggle-slider-published"></span>
                </label>
              </td>
              <td style="text-align:right;">
                <div class="row-actions">
                  <button class="btn-action primary" @click="$emit('edit-car', c)" title="Edit Vehicle">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn-action danger" @click="$emit('delete-car', c)" title="Delete Vehicle">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="loading">
              <td colspan="7" class="loading-cell">
                <div class="loader"></div>
                <span>Loading vehicles...</span>
              </td>
            </tr>
            <tr v-else-if="!cars.length">
              <td colspan="7" class="empty-cell">
                <i class="fa-solid fa-inbox"></i>
                <span>No cars found</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <div class="pagination-info">
        Showing {{ cars.length }} of {{ totals.cars }} vehicles
      </div>
      <div class="pagination-controls">
        <button 
          class="btn outline" 
          :disabled="currentPage <= 1 || loading" 
          @click="$emit('change-page', currentPage - 1)"
        >
          <i class="fa-solid fa-chevron-left"></i>
          Previous
        </button>
        <div class="pagination-pages">
          <span class="page-number">{{ currentPage }}</span>
          <span class="page-divider">/</span>
          <span class="page-total">{{ totalPages }}</span>
        </div>
        <button 
          class="btn outline" 
          :disabled="currentPage >= totalPages || loading" 
          @click="$emit('change-page', currentPage + 1)"
        >
          Next
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div v-if="deleteTarget" class="dialog-backdrop" @click.self="$emit('cancel-delete')">
      <div class="dialog dialog-danger">
        <div class="dialog-header">
          <div class="dialog-icon danger">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h3>Delete Vehicle</h3>
        </div>
        <div class="dialog-body">
          <p>Are you sure you want to delete <strong>{{ deleteTarget.title || (deleteTarget.make + ' ' + deleteTarget.model) }}</strong>?</p>
          <p class="warning-text">This action cannot be undone. All associated images, features, and specifications will be permanently deleted.</p>
        </div>
        <div class="dialog-actions">
          <button class="btn outline" @click="$emit('cancel-delete')" :disabled="saving">Cancel</button>
          <button class="btn danger" @click="$emit('confirm-delete')" :disabled="saving">
            <i class="fa-solid fa-trash"></i>
            {{ saving ? 'Deleting…' : 'Delete Permanently' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cars: { type: Array, default: () => [] },
  totals: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  searchQuery: { type: String, default: '' },
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  deleteTarget: { type: Object, default: null }
});

defineEmits([
  'add-car',
  'edit-car',
  'delete-car',
  'confirm-delete',
  'cancel-delete',
  'toggle-featured',
  'toggle-published',
  'search',
  'reset-filters',
  'change-page',
  'update:searchQuery'
]);

function firstImage(c) { 
  const m = (c.media || []).find(x => x.type === 'image'); 
  return m ? m.url : ''; 
}

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
</script>

<style scoped>
/* Space & Grid */
.space { display:grid; gap: 1.25rem; }

/* Page Headers */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.page-header-text {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
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
  margin: 0;
}
.filters-bar .btn.primary {
  background: #3b82f6;
  color: #fff;
  border: none;
}
.filters-bar .btn.primary:hover {
  background: #2563eb;
}
.filters-bar .btn.outline:has(i.fa-filter-circle-xmark) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}
.filters-bar .btn.outline:has(i.fa-filter-circle-xmark):hover {
  background: #e2e8f0;
  border-color: #94a3b8;
}

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
.search-wrap { position:relative; flex:1; }
.search { padding-left: 2.75rem; font-size: 0.9375rem; }
.search-icon { position:absolute; left:1rem; top:50%; transform:translateY(-50%); color:#9ca3af; font-size: 1rem; }

/* Cards */
.card { background:#fff; border:1px solid #e5e7eb; border-radius:.75rem; overflow:hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08); transition: box-shadow 0.2s ease; }
.card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.12); }

/* Table Enhancements */
.table-card { overflow: hidden; }
.table-wrapper { overflow-x: auto; }
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
.table-row:hover { background: #f8fafc; }
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
  font-size: 1.0625rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
  margin-bottom: 0.375rem;
}
.vehicle-meta {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  letter-spacing: 0.01em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.vehicle-meta i {
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
  gap: 0.625rem;
  font-size: 0.875rem;
}
.spec-row-inline i {
  width: 1.125rem;
  text-align: center;
  color: #3b82f6;
  font-size: 1rem;
  flex-shrink: 0;
}
.spec-value {
  color: #0f172a;
  font-weight: 600;
  flex: 1;
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
  align-items: center;
}
.price-amount {
  font-size: 1.375rem;
  font-weight: 800;
  color: #000000;
  line-height: 1;
}
.loading-cell, .empty-cell {
  text-align: center !important;
  padding: 3rem 1.25rem !important;
  color: #64748b !important;
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
@keyframes spin {
  to { transform: rotate(360deg); }
}
.empty-cell i {
  font-size: 2.5rem;
  color: #cbd5e1;
  display: block;
  margin-bottom: 0.5rem;
}

.empty-cell span {
  display: block;
  font-size: 0.9375rem;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}
.toggle-switch.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.toggle-switch input:disabled {
  cursor: not-allowed;
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
.toggle-slider-published {
  background-color: #cbd5e1;
}
.toggle-switch input:checked + .toggle-slider-published {
  background-color: #3b82f6;
}

/* Action Buttons */
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

/* Row Inline */
.row-inline { display:flex; gap:.5rem; align-items:center; }

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

/* Responsive */
@media(max-width: 1024px){
  .pagination { flex-direction: column; gap: 1rem; }
  .filters-bar { flex-direction: column; }
  .search-wrap { max-width: none; }
}
@media(max-width: 640px) {
  .table th, .table td { padding: 0.75rem 0.5rem; font-size: 0.875rem; }
  .thumb-wrapper { width: 60px; height: 60px; }
}
</style>
