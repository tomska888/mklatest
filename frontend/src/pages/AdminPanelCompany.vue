<template>
  <div class="space">
    <div class="page-header">
      <div>
        <h2 class="page-title">Company Information</h2>
      </div>
      <button class="btn primary save-btn" @click="$emit('save')" :disabled="saving">
        <i class="fa-solid fa-floppy-disk"></i>
        {{ saving ? 'Saving…' : 'Save Changes' }}
      </button>
    </div>

    <div class="card">
      <div class="card-body">
        <h3 class="section-title">
          <i class="fa-solid fa-building"></i>
          Business Details
        </h3>
        <div class="form-grid">
          <div class="field">
            <label class="label">Company Name *</label>
            <input 
              class="input" 
              :value="company.name" 
              @input="$emit('update:company', { ...company, name: $event.target.value })"
              placeholder="MK Automobile" 
              required 
            />
          </div>
          <div class="field">
            <label class="label">Email Address *</label>
            <input 
              class="input" 
              type="email" 
              :value="company.email" 
              @input="$emit('update:company', { ...company, email: $event.target.value })"
              placeholder="contact@mkauto.com" 
              required 
            />
          </div>
          <div class="field">
            <label class="label">Phone Number *</label>
            <input 
              class="input" 
              type="tel" 
              :value="company.phone" 
              @input="$emit('update:company', { ...company, phone: $event.target.value })"
              placeholder="+49 123 456789" 
              required 
            />
          </div>
          <div class="field">
            <label class="label">Address</label>
            <input 
              class="input" 
              :value="company.address" 
              @input="$emit('update:company', { ...company, address: $event.target.value })"
              placeholder="Street, City, Country" 
            />
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <h3 class="section-title">
          <i class="fa-solid fa-map-marker-alt"></i>
          Location Coordinates
        </h3>
        <div class="form-grid">
          <div class="field">
            <label class="label">Latitude</label>
            <input 
              class="input" 
              type="number" 
              step="0.000001" 
              :value="company.lat" 
              @input="$emit('update:company', { ...company, lat: Number($event.target.value) })"
              placeholder="52.520008" 
            />
          </div>
          <div class="field">
            <label class="label">Longitude</label>
            <input 
              class="input" 
              type="number" 
              step="0.000001" 
              :value="company.lng" 
              @input="$emit('update:company', { ...company, lng: Number($event.target.value) })"
              placeholder="13.404954" 
            />
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <h3 class="section-title">
          <i class="fa-solid fa-align-left"></i>
          About Your Company
        </h3>
        <div class="field">
          <label class="label">Description</label>
          <textarea 
            class="input" 
            rows="8" 
            :value="company.about" 
            @input="$emit('update:company', { ...company, about: $event.target.value })"
            placeholder="Tell customers about your business, history, and values..."
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  company: { type: Object, required: true },
  saving: { type: Boolean, default: false }
});

defineEmits(['save', 'update:company']);
</script>

<style scoped>
/* Space */
.space { display:grid; gap: 1.25rem; }

/* Page Headers */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

/* Cards */
.card { background:#fff; border:1px solid #e5e7eb; border-radius:.75rem; overflow:hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08); transition: box-shadow 0.2s ease; }
.card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.12); }
.card-body { padding: 1.5rem; }

/* Section Title */
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

/* Form Elements */
.form-grid { display:grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap:.75rem; }
@media(min-width: 720px){ .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.field { display:flex; flex-direction:column; gap:.25rem; }
.label { font-weight: 500; color: #374151; font-size: 0.875rem; }

/* Field hints */
.field-hint {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  color: #64748b;
}

/* Save Button */
.save-btn {
  background-color: #3b82f6 !important;
}
.save-btn:hover:not(:disabled) {
  background-color: #2563eb !important;
}

/* Responsive */
@media(max-width: 1024px){
  .page-header { flex-direction: column; align-items: stretch; }
}
</style>
