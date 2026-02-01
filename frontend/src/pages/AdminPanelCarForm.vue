<template>
  <div class="space">
    <!-- Header -->
    <div class="form-header">
      <button class="btn ghost back-btn" @click="$emit('cancel')" title="Back to vehicles" aria-label="Back">
        <i class="fa-solid fa-arrow-left"></i>
        Back
      </button>
      <div class="form-headings">
        <h2>{{ form.id ? 'Edit Car' : 'Add New Car' }}</h2>
      </div>
      <button class="btn primary save-car-btn" @click="$emit('save')" :disabled="saving || !isFormValid">
        <i class="fa-solid fa-floppy-disk"></i>
        {{ saving ? 'Saving…' : 'Save Car' }}
      </button>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <div class="tabs-list">
        <button :class="{ active: currentTab==='basic' }" @click="$emit('update:currentTab', 'basic')">Basic Info</button>
        <button :class="{ active: currentTab==='images' }" @click="$emit('update:currentTab', 'images')">Images</button>
        <button :class="{ active: currentTab==='features' }" @click="$emit('update:currentTab', 'features')">Features</button>
        <button :class="{ active: currentTab==='specs' }" @click="$emit('update:currentTab', 'specs')">Specifications</button>
        <button :class="{ active: currentTab==='media' }" @click="$emit('update:currentTab', 'media')">Media & Docs</button>
      </div>

      <!-- Basic Info -->
      <div v-show="currentTab==='basic'" class="tab-panel">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title">Car Information</h2>
            <div class="form-grid">
              <div class="field">
                <label class="label" for="title">Title *</label>
                <input id="title" class="input" :value="form.title" @input="updateField('title', $event.target.value)" placeholder="e.g., 2021 Škoda Octavia Combi" required />
              </div>
              <div class="field">
                <label class="label" for="make">Make *</label>
                <CustomSelect
                  :model-value="form.make"
                  :options="makeOptions"
                  placeholder="Select or type to search..."
                  button-class="full"
                  :searchable="true"
                  @update:model-value="updateField('make', $event)"
                />
              </div>
              <div class="field">
                <label class="label" for="model">Model *</label>
                <CustomSelect
                  :model-value="form.model"
                  :options="availableModels"
                  placeholder="Select make first..."
                  button-class="full"
                  :searchable="true"
                  @update:model-value="updateField('model', $event)"
                />
              </div>
              <div class="field">
                <label class="label" for="year">Year *</label>
                <input id="year" type="number" class="input" :value="form.year" @input="updateField('year', Number($event.target.value))" :min="1900" :max="new Date().getFullYear()+1" required />
              </div>
              <div class="field">
                <label class="label" for="price">Price (€) *</label>
                <input id="price" type="number" class="input" :value="form.price" @input="updateField('price', Number($event.target.value))" min="0" required />
              </div>
              <div class="field">
                <label class="label" for="mileage">Mileage (km)</label>
                <input id="mileage" type="number" class="input" :value="form.mileage" @input="updateField('mileage', Number($event.target.value))" min="0" />
              </div>
              <div class="field">
                <label class="label" for="fuel_type">Fuel</label>
                <CustomSelect
                  :model-value="form.fuel_type"
                  :options="fuelTypeOptions"
                  placeholder="Select fuel type..."
                  button-class="full"
                  @update:model-value="updateField('fuel_type', $event)"
                />
              </div>
              <div class="field">
                <label class="label" for="transmission">Transmission</label>
                <CustomSelect
                  :model-value="form.transmission"
                  :options="transmissionOptions"
                  placeholder="Select transmission..."
                  button-class="full"
                  @update:model-value="updateField('transmission', $event)"
                />
              </div>
              <div class="field">
                <label class="label" for="body_type">Body type</label>
                <CustomSelect
                  :model-value="form.body_type"
                  :options="bodyTypeOptions"
                  placeholder="Select body type..."
                  button-class="full"
                  @update:model-value="updateField('body_type', $event)"
                />
              </div>
              <div class="field">
                <label class="label" for="color">Color</label>
                <input id="color" class="input" :value="form.color" @input="updateField('color', $event.target.value)" />
              </div>
              <div class="field">
                <label class="label" for="vin">VIN</label>
                <input id="vin" class="input" :value="form.vin" @input="updateField('vin', $event.target.value)" />
              </div>
            </div>

            <div class="field" style="margin-top:.5rem;">
              <label class="label" for="description">Description</label>
              <textarea id="description" class="input" rows="6" :value="form.description" @input="updateField('description', $event.target.value)" placeholder="Describe the vehicle condition, history, and key selling points..."></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Images -->
      <div v-show="currentTab==='images'" class="tab-panel">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title">Car Images</h2>
            <p class="muted" style="margin-top:-0.5rem; margin-bottom:1rem;">
              <i class="fa-solid fa-grip-vertical"></i> Drag images to reorder them • First image is the primary display
            </p>

            <div class="row-inline">
              <input
                ref="mediaInput"
                type="file"
                multiple
                accept="image/*,video/*"
                class="file-input-hidden"
                @change="$emit('upload-media', $event)"
                :disabled="!form.id || uploading"
              />
              <button class="btn primary upload-images-btn" @click="$emit('trigger-media-input')" :disabled="!form.id || uploading">
                <i class="fa-solid fa-upload"></i>
                {{ uploading ? 'Uploading…' : 'Choose Files & Upload' }}
              </button>
            </div>

            <div v-if="(media||[]).length" class="images-grid">
              <div
                v-for="(m, index) in media"
                :key="m.id"
                class="img-item"
                :class="{ 'dragging': draggedItem === m.id, 'primary-image': index === 0 }"
                draggable="true"
                @dragstart="handleDragStart($event, m.id)"
                @dragend="handleDragEnd"
                @dragover.prevent="handleDragOver($event, m.id)"
                @drop.prevent="handleDrop(m.id)"
              >
                <div class="drag-handle" title="Drag to reorder">
                  <i class="fa-solid fa-grip-vertical"></i>
                </div>
                <div v-if="index === 0" class="primary-badge" title="Primary image shown in listings">
                  <i class="fa-solid fa-star"></i> Primary
                </div>
                <div class="order-badge">{{ index + 1 }}</div>
                <img v-if="m.type==='image'" :src="m.url" alt="" class="media-preview" />
                <div v-else class="video-placeholder">
                  <i class="fa-solid fa-video"></i>
                  <span>Video</span>
                </div>
                <button class="img-remove" @click="$emit('delete-media', m)" title="Delete image">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
            <div v-else class="empty">
              <div class="empty-inner">
                <div class="empty-icon"><i class="fa-regular fa-image"></i></div>
                <p class="muted">No images uploaded yet</p>
                <p class="muted small">Save the car first, then upload media</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div v-show="currentTab==='features'" class="tab-panel">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title">Car Features</h2>
            <p class="muted" style="margin-top:-0.5rem; margin-bottom:1rem;">
              <i class="fa-solid fa-info-circle"></i> Select from library or add custom features • Features are saved for reuse across vehicles
            </p>

            <!-- Feature Library Selector -->
            <div class="feature-selector-wrap">
              <div class="feature-selector-header">
                <h3 class="feature-selector-title">
                  <i class="fa-solid fa-book"></i>
                  Feature Library
                </h3>
                <button class="btn ghost small" @click="showFeatureManager = true">
                  <i class="fa-solid fa-cog"></i>
                  Manage Library
                </button>
              </div>

              <!-- Category Tabs -->
              <div class="category-tabs">
                <button
                  v-for="cat in featureCategories"
                  :key="cat.id"
                  :class="['category-tab', { active: selectedCategory === cat.id }]"
                  @click="selectedCategory = cat.id"
                >
                  <i :class="cat.icon"></i>
                  {{ cat.name }}
                </button>
              </div>

              <!-- Features Grid -->
              <div class="features-library">
                <div
                  v-for="feature in filteredLibraryFeatures"
                  :key="feature"
                  :class="['feature-badge', { selected: features.includes(feature) }]"
                  @click="toggleFeature(feature)"
                >
                  <i v-if="features.includes(feature)" class="fa-solid fa-check"></i>
                  {{ feature }}
                </div>
                <div v-if="!filteredLibraryFeatures.length" class="empty-features">
                  <i class="fa-regular fa-folder-open"></i>
                  <span>No features in this category yet</span>
                </div>
              </div>

              <!-- Add Custom Feature -->
              <div class="add-custom-feature">
                <h3 class="feature-selector-title">
                  <i class="fa-solid fa-plus-circle"></i>
                  Add Custom Feature
                </h3>
                <div class="row-inline">
                  <CustomSelect
                    :model-value="selectedCategory"
                    :options="categorySelectOptions"
                    placeholder="Select category..."
                    button-class="category-select"
                    @update:model-value="selectedCategory = $event"
                  />
                  <input
                    class="input"
                    placeholder="Type new feature name..."
                    v-model="newFeature"
                    @keydown.enter.prevent="addCustomFeature"
                  />
                  <button class="btn primary add-feature-btn" @click="addCustomFeature">
                    <i class="fa-solid fa-plus"></i>
                    Add
                  </button>
                </div>
              </div>
            </div>

            <!-- Selected Features -->
            <div class="selected-features-section">
              <div class="section-header-inline">
                <h3 class="feature-selector-title">
                  <i class="fa-solid fa-check-circle"></i>
                  Selected Features ({{ features.length }})
                </h3>
              </div>

              <div v-if="features.length" class="chips">
                <span v-for="(f,i) in features" :key="f+i" class="chip">
                  {{ f }}
                  <button type="button" class="x" @click="$emit('remove-feature', i)">×</button>
                </span>
              </div>
              <div v-else class="empty">
                <div class="empty-inner">
                  <p class="muted">No features selected yet</p>
                  <p class="muted small">Click features from the library above to add them</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Specifications -->
      <div v-show="currentTab==='specs'" class="tab-panel">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title">Technical Specifications</h2>
            <p class="muted" style="margin-top:-0.5rem; margin-bottom:1rem;">
              <i class="fa-solid fa-info-circle"></i> Add detailed technical specifications for this vehicle
            </p>

            <!-- Specification Input Section -->
            <div class="spec-input-section">
              <div class="spec-input-header">
                <h3 class="section-subtitle">
                  <i class="fa-solid fa-plus-circle"></i>
                  Add New Specification
                </h3>
              </div>
              
              <div class="spec-input-grid">
                <div class="field">
                  <label class="label" for="spec-key">Specification Name *</label>
                  <input
                    id="spec-key"
                    class="input"
                    placeholder="e.g., Engine, Horsepower, Torque"
                    :value="newSpecKey"
                    @input="$emit('update:newSpecKey', $event.target.value)"
                    @keydown.enter.prevent="$emit('add-spec')"
                  />
                </div>
                <div class="field">
                  <label class="label" for="spec-value">Value *</label>
                  <div class="spec-value-input">
                    <input
                      id="spec-value"
                      class="input"
                      placeholder="e.g., 2.0L Turbo, 245 HP, 370 Nm"
                      :value="newSpecValue"
                      @input="$emit('update:newSpecValue', $event.target.value)"
                      @keydown.enter.prevent="$emit('add-spec')"
                    />
                    <button
                      class="btn primary add-spec-btn"
                      @click="$emit('add-spec')"
                      :disabled="!newSpecKey || !newSpecValue"
                      title="Add specification"
                    >
                      <i class="fa-solid fa-plus"></i>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Current Specifications List -->
            <div class="specs-list-section">
              <div class="section-header-inline">
                <h3 class="section-subtitle">
                  <i class="fa-solid fa-list-check"></i>
                  Current Specifications ({{ Object.keys(specs).length }})
                </h3>
              </div>

              <div v-if="Object.keys(specs).length" class="spec-list">
                <div v-for="(val, key) in specs" :key="key" class="spec-item">
                  <div class="spec-item-content">
                    <div class="spec-icon">
                      <i class="fa-solid fa-gauge"></i>
                    </div>
                    <div class="spec-details">
                      <span class="spec-key">{{ key }}</span>
                      <span class="spec-value">{{ val }}</span>
                    </div>
                  </div>
                  <button
                    class="btn ghost small spec-remove-btn"
                    @click="$emit('remove-spec', key)"
                    title="Remove specification"
                  >
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
              <div v-else class="empty">
                <div class="empty-inner">
                  <div class="empty-icon"><i class="fa-solid fa-gauge"></i></div>
                  <p class="muted">No specifications added yet</p>
                  <p class="muted small">Add technical details like engine type, horsepower, transmission details, etc.</p>
                </div>
              </div>
            </div>

            <!-- Common Specifications Quick Add -->
            <div class="quick-specs-section">
              <div class="spec-input-header">
                <h3 class="section-subtitle">
                  <i class="fa-solid fa-bolt"></i>
                  Quick Add Common Specs
                </h3>
              </div>
              <div class="quick-specs-grid">
                <button
                  v-for="quickSpec in commonSpecs"
                  :key="quickSpec.name"
                  class="quick-spec-btn"
                  @click="quickAddSpec(quickSpec.name)"
                  :disabled="specs[quickSpec.name]"
                  :title="specs[quickSpec.name] ? 'Already added' : 'Click to add'"
                >
                  <i :class="quickSpec.icon"></i>
                  {{ quickSpec.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Media & Docs (documents) -->
      <div v-show="currentTab==='media'" class="tab-panel">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title">Vehicle Documents</h2>
            <p class="muted" style="margin-top:-0.5rem; margin-bottom:1rem;">
              <i class="fa-solid fa-info-circle"></i> Upload important documents like service records, registration, inspection reports, etc.
            </p>

            <!-- Upload Section -->
            <div class="doc-upload-section">
              <div class="doc-upload-header">
                <h3 class="section-subtitle">
                  <i class="fa-solid fa-cloud-arrow-up"></i>
                  Upload Documents
                </h3>
              </div>
              
              <p class="muted small" style="margin-bottom: 1rem;">
                Accepted: PDF, Word, Excel, Text, Images • Max 10MB per file
              </p>

              <div class="doc-upload-form">
                <div class="field">
                  <label class="label" for="doc-type">Document Type</label>
                  <CustomSelect
                    :model-value="docType"
                    :options="documentTypes"
                    placeholder="Select document type..."
                    button-class="full"
                    @update:model-value="$emit('update:docType', $event)"
                  />
                </div>
                
                <div class="field">
                  <label class="label">File Upload</label>
                  <div class="file-upload-wrapper">
                    <input
                      ref="docInput"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*"
                      class="file-input-hidden"
                      @change="$emit('upload-documents', $event)"
                      :disabled="!form.id || uploadingDocs"
                    />
                    <button
                      class="btn primary upload-docs-btn"
                      @click="$emit('trigger-doc-input')"
                      :disabled="!form.id || uploadingDocs"
                    >
                      <i class="fa-solid fa-upload"></i>
                      {{ uploadingDocs ? 'Uploading…' : 'Choose Files & Upload' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Document Categories -->
            <div v-if="(documents||[]).length" class="docs-section">
              <div class="section-header-inline">
                <h3 class="section-subtitle">
                  <i class="fa-solid fa-folder-open"></i>
                  Uploaded Documents ({{ documents.length }})
                </h3>
                <div class="doc-filters">
                  <button
                    v-for="type in ['All', ...documentTypes]"
                    :key="type"
                    :class="['doc-filter-btn', { active: selectedDocFilter === type }]"
                    @click="selectedDocFilter = type"
                  >
                    {{ type }}
                    <span class="filter-count">{{ getDocumentCountByType(type) }}</span>
                  </button>
                </div>
              </div>

              <!-- Documents Grid -->
              <div class="docs-grid">
                <div
                  v-for="doc in filteredDocuments"
                  :key="doc.id"
                  class="doc-card"
                >
                  <div class="doc-card-icon" :class="getDocIconClass(doc.filename)">
                    <i :class="getDocIcon(doc.filename)"></i>
                  </div>
                  <div class="doc-card-content">
                    <div class="doc-card-header">
                      <h4 class="doc-name" :title="doc.filename">{{ doc.filename || getFileNameFromUrl(doc.url) }}</h4>
                      <button
                        class="btn ghost small doc-delete-btn"
                        @click="$emit('delete-document', doc)"
                        title="Delete document"
                      >
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                    <div class="doc-card-meta">
                      <span v-if="doc.doc_type" class="doc-type-badge">
                        <i class="fa-solid fa-tag"></i>
                        {{ doc.doc_type }}
                      </span>
                      <span v-if="doc.size" class="doc-size">
                        <i class="fa-solid fa-file-lines"></i>
                        {{ formatFileSize(doc.size) }}
                      </span>
                      <span v-if="doc.uploaded_at" class="doc-date">
                        <i class="fa-solid fa-clock"></i>
                        {{ formatDate(doc.uploaded_at) }}
                      </span>
                    </div>
                    <div class="doc-card-actions">
                      <a
                        :href="doc.url"
                        target="_blank"
                        class="btn outline small"
                        title="View document"
                      >
                        <i class="fa-solid fa-eye"></i>
                        View
                      </a>
                      <a
                        :href="doc.url"
                        :download="doc.filename"
                        class="btn outline small"
                        title="Download document"
                      >
                        <i class="fa-solid fa-download"></i>
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty">
              <div class="empty-inner">
                <div class="empty-icon"><i class="fa-solid fa-file-circle-plus"></i></div>
                <p class="muted">No documents uploaded yet</p>
                <p class="muted small">Save the car first, then upload important documents</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feature Library Manager Modal -->
    <div v-if="showFeatureManager" class="dialog-backdrop" @click.self="showFeatureManager = false">
      <div class="dialog dialog-large">
        <div class="dialog-header">
          <div class="dialog-icon info">
            <i class="fa-solid fa-book"></i>
          </div>
          <h3>Manage Feature Library</h3>
          <button class="dialog-close" @click="showFeatureManager = false">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="dialog-body">
          <p class="muted" style="margin-bottom: 1rem;">
            Organize your feature library by categories. These features will be available for all vehicles.
          </p>

          <div v-for="cat in featureCategories" :key="cat.id" class="library-category-section">
            <div
              class="library-category-header clickable"
              @click="toggleCategoryExpansion(cat.id)"
            >
              <div class="category-header-left">
                <i
                  :class="['chevron-icon', 'fa-solid', isCategoryExpanded(cat.id) ? 'fa-chevron-down' : 'fa-chevron-right']"
                ></i>
                <h4>
                  <i :class="cat.icon"></i>
                  {{ cat.name }}
                </h4>
              </div>
              <span class="badge">{{ getFeaturesByCategory(cat.id).length }} features</span>
            </div>
            <div v-show="isCategoryExpanded(cat.id)" class="library-features-list">
              <div
                v-for="(feature, idx) in getFeaturesByCategory(cat.id)"
                :key="idx"
                class="library-feature-item"
              >
                <span>{{ feature }}</span>
                <button
                  class="btn ghost small danger"
                  @click="removeFromLibrary(cat.id, feature)"
                  title="Remove from library"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
              <div v-if="!getFeaturesByCategory(cat.id).length" class="empty-category">
                No features in this category
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="btn outline" @click="resetLibraryToDefaults">
            <i class="fa-solid fa-rotate-left"></i>
            Reset to Defaults
          </button>
          <button class="btn primary done-btn" @click="showFeatureManager = false">
            <i class="fa-solid fa-check"></i>
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CustomSelect from '../components/CustomSelect.vue';

const draggedItem = ref(null);
const dragOverItem = ref(null);
const mediaInput = ref(null);
const docInput = ref(null);

// Feature Library State
const showFeatureManager = ref(false);
const selectedCategory = ref('comfort');
const newFeature = ref('');
const expandedCategories = ref(new Set(['comfort', 'safety', 'technology', 'exterior', 'interior', 'performance', 'other']));

// Documents State
const selectedDocFilter = ref('All');

// Document Types
const documentTypes = [
  'Service Record',
  'Registration',
  'Inspection Report',
  'Insurance',
  'Purchase Agreement',
  'Owner\'s Manual',
  'Warranty',
  'Receipt',
  'Other'
];

// Filtered documents based on selected filter
const filteredDocuments = computed(() => {
  if (selectedDocFilter.value === 'All') {
    return props.documents;
  }
  return props.documents.filter(doc => doc.doc_type === selectedDocFilter.value);
});

// Get document count by type
const getDocumentCountByType = (type) => {
  if (type === 'All') {
    return props.documents.length;
  }
  return props.documents.filter(doc => doc.doc_type === type).length;
};

// Get document icon based on file extension
const getDocIcon = (filename) => {
  if (!filename) return 'fa-solid fa-file';
  
  const ext = filename.split('.').pop().toLowerCase();
  
  const iconMap = {
    'pdf': 'fa-solid fa-file-pdf',
    'doc': 'fa-solid fa-file-word',
    'docx': 'fa-solid fa-file-word',
    'xls': 'fa-solid fa-file-excel',
    'xlsx': 'fa-solid fa-file-excel',
    'txt': 'fa-solid fa-file-lines',
    'jpg': 'fa-solid fa-file-image',
    'jpeg': 'fa-solid fa-file-image',
    'png': 'fa-solid fa-file-image',
    'gif': 'fa-solid fa-file-image',
    'bmp': 'fa-solid fa-file-image',
    'webp': 'fa-solid fa-file-image'
  };
  
  return iconMap[ext] || 'fa-solid fa-file';
};

// Get document icon class for styling
const getDocIconClass = (filename) => {
  if (!filename) return 'doc-icon-default';
  
  const ext = filename.split('.').pop().toLowerCase();
  
  const classMap = {
    'pdf': 'doc-icon-pdf',
    'doc': 'doc-icon-word',
    'docx': 'doc-icon-word',
    'xls': 'doc-icon-excel',
    'xlsx': 'doc-icon-excel',
    'txt': 'doc-icon-text',
    'jpg': 'doc-icon-image',
    'jpeg': 'doc-icon-image',
    'png': 'doc-icon-image',
    'gif': 'doc-icon-image',
    'bmp': 'doc-icon-image',
    'webp': 'doc-icon-image'
  };
  
  return classMap[ext] || 'doc-icon-default';
};

// Get filename from URL
const getFileNameFromUrl = (url) => {
  if (!url) return 'Unknown';
  return url.split('/').pop();
};

// Format file size
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Feature Categories
const featureCategories = [
  { id: 'comfort', name: 'Comfort', icon: 'fa-solid fa-couch' },
  { id: 'safety', name: 'Safety', icon: 'fa-solid fa-shield-halved' },
  { id: 'technology', name: 'Technology', icon: 'fa-solid fa-microchip' },
  { id: 'exterior', name: 'Exterior', icon: 'fa-solid fa-car-side' },
  { id: 'interior', name: 'Interior', icon: 'fa-solid fa-door-open' },
  { id: 'performance', name: 'Performance', icon: 'fa-solid fa-gauge-high' },
  { id: 'other', name: 'Other', icon: 'fa-solid fa-ellipsis' }
];

// Default Feature Library
const defaultFeatureLibrary = {
  comfort: [
    'Air Conditioning',
    'Climate Control',
    'Heated Seats',
    'Ventilated Seats',
    'Leather Seats',
    'Power Seats',
    'Memory Seats',
    'Lumbar Support',
    'Cruise Control',
    'Adaptive Cruise Control',
    'Massage Seats'
  ],
  safety: [
    'ABS',
    'ESP',
    'Airbags',
    'Lane Assist',
    'Blind Spot Monitor',
    'Rear Cross Traffic Alert',
    'Emergency Brake Assist',
    'Parking Sensors',
    'Parking Camera',
    '360° Camera',
    'Tire Pressure Monitor',
    'Hill Start Assist',
    'Traction Control'
  ],
  technology: [
    'Navigation System',
    'Apple CarPlay',
    'Android Auto',
    'Bluetooth',
    'USB Ports',
    'Wireless Charging',
    'Premium Sound System',
    'Head-Up Display',
    'Digital Cockpit',
    'Voice Control',
    'WiFi Hotspot',
    'Smartphone Integration'
  ],
  exterior: [
    'LED Headlights',
    'Xenon Headlights',
    'Fog Lights',
    'Daytime Running Lights',
    'Panoramic Sunroof',
    'Sunroof',
    'Tinted Windows',
    'Power Mirrors',
    'Heated Mirrors',
    'Rain Sensor',
    'Roof Rails',
    'Tow Hook',
    'Alloy Wheels'
  ],
  interior: [
    'Leather Steering Wheel',
    'Heated Steering Wheel',
    'Multifunction Steering Wheel',
    'Electric Windows',
    'Ambient Lighting',
    'Keyless Entry',
    'Start-Stop Button',
    'Electric Tailgate',
    'Folding Rear Seats',
    'Armrest',
    'Cup Holders',
    'Storage Compartments'
  ],
  performance: [
    'Sport Mode',
    'Eco Mode',
    'AWD',
    'Four Wheel Drive',
    'Sport Suspension',
    'Air Suspension',
    'Launch Control',
    'Paddle Shifters',
    'Limited Slip Differential',
    'Turbocharger',
    'Supercharger'
  ],
  other: []
};

// Feature Library - load from localStorage or use defaults
const featureLibrary = ref({});

// Load feature library from localStorage
const loadFeatureLibrary = () => {
  const stored = localStorage.getItem('carFeatureLibrary');
  if (stored) {
    try {
      featureLibrary.value = JSON.parse(stored);
    } catch {
      featureLibrary.value = { ...defaultFeatureLibrary };
    }
  } else {
    featureLibrary.value = { ...defaultFeatureLibrary };
  }
};

// Save feature library to localStorage
const saveFeatureLibrary = () => {
  localStorage.setItem('carFeatureLibrary', JSON.stringify(featureLibrary.value));
};

// Get features by category
const getFeaturesByCategory = (categoryId) => {
  return featureLibrary.value[categoryId] || [];
};

// Filtered library features based on selected category
const filteredLibraryFeatures = computed(() => {
  return getFeaturesByCategory(selectedCategory.value);
});

// Category select options for CustomSelect
const categorySelectOptions = computed(() => {
  return featureCategories.map(c => c.name);
});

// Toggle feature selection
const toggleFeature = (feature) => {
  const index = props.features.indexOf(feature);
  if (index > -1) {
    emit('remove-feature', index);
  } else {
    emit('add-feature', feature);
  }
};

// Add custom feature to library and current car
const addCustomFeature = () => {
  const feature = newFeature.value.trim();
  if (!feature) return;

  // Add to library if not exists
  const categoryFeatures = featureLibrary.value[selectedCategory.value] || [];
  if (!categoryFeatures.includes(feature)) {
    categoryFeatures.push(feature);
    featureLibrary.value[selectedCategory.value] = categoryFeatures;
    saveFeatureLibrary();
  }

  // Add to current car features if not exists
  if (!props.features.includes(feature)) {
    emit('add-feature', feature);
  }

  newFeature.value = '';
};

// Remove feature from library
const removeFromLibrary = (categoryId, feature) => {
  const categoryFeatures = featureLibrary.value[categoryId] || [];
  const index = categoryFeatures.indexOf(feature);
  if (index > -1) {
    categoryFeatures.splice(index, 1);
    featureLibrary.value[categoryId] = categoryFeatures;
    saveFeatureLibrary();
  }
};

// Reset library to defaults
const resetLibraryToDefaults = () => {
  if (confirm('Are you sure you want to reset the feature library to defaults? This will remove all custom features.')) {
    featureLibrary.value = { ...defaultFeatureLibrary };
    saveFeatureLibrary();
  }
};

// Toggle category expansion in the manager
const toggleCategoryExpansion = (categoryId) => {
  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId);
  } else {
    expandedCategories.value.add(categoryId);
  }
  // Force reactivity update
  expandedCategories.value = new Set(expandedCategories.value);
};

// Check if category is expanded
const isCategoryExpanded = (categoryId) => {
  return expandedCategories.value.has(categoryId);
};

// Common Specifications for Quick Add
const commonSpecs = [
  { name: 'Engine', icon: 'fa-solid fa-gear' },
  { name: 'Horsepower', icon: 'fa-solid fa-gauge-high' },
  { name: 'Torque', icon: 'fa-solid fa-bolt' },
  { name: 'Transmission Type', icon: 'fa-solid fa-gears' },
  { name: 'Drive Type', icon: 'fa-solid fa-road' },
  { name: 'Fuel Consumption', icon: 'fa-solid fa-gas-pump' },
  { name: 'CO2 Emissions', icon: 'fa-solid fa-leaf' },
  { name: '0-100 km/h', icon: 'fa-solid fa-stopwatch' },
  { name: 'Top Speed', icon: 'fa-solid fa-tachometer-alt' },
  { name: 'Number of Doors', icon: 'fa-solid fa-door-open' },
  { name: 'Number of Seats', icon: 'fa-solid fa-chair' },
  { name: 'Trunk Capacity', icon: 'fa-solid fa-suitcase' },
];

// Quick add specification
const quickAddSpec = (specName) => {
  emit('update:newSpecKey', specName);
  // Focus the value input
  setTimeout(() => {
    const valueInput = document.getElementById('spec-value');
    if (valueInput) {
      valueInput.focus();
    }
  }, 100);
};

// Initialize feature library on mount
onMounted(() => {
  loadFeatureLibrary();
});

// Comprehensive list of car makes
const makeOptions = [
  'Abarth', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti', 'Cadillac',
  'Chevrolet', 'Chrysler', 'Citroën', 'Dacia', 'Daewoo', 'Daihatsu', 'Dodge', 'Ferrari',
  'Fiat', 'Ford', 'Genesis', 'GMC', 'Honda', 'Hummer', 'Hyundai', 'Infiniti', 'Isuzu',
  'Jaguar', 'Jeep', 'Kia', 'Lada', 'Lamborghini', 'Lancia', 'Land Rover', 'Lexus',
  'Lincoln', 'Lotus', 'Maserati', 'Maybach', 'Mazda', 'McLaren', 'Mercedes-Benz', 'MG',
  'Mini', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 'Porsche', 'RAM', 'Renault',
  'Rolls-Royce', 'Rover', 'Saab', 'Seat', 'Skoda', 'Smart', 'SsangYong', 'Subaru',
  'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
];

// Models by make
const modelsByMake = {
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'e-tron'],
  'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'i3', 'i4', 'iX'],
  'Mercedes-Benz': ['A-Class', 'B-Class', 'C-Class', 'CLA', 'CLS', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS'],
  'Volkswagen': ['Polo', 'Golf', 'Jetta', 'Passat', 'Arteon', 'Tiguan', 'Touareg', 'T-Roc', 'T-Cross', 'ID.3', 'ID.4', 'ID.5'],
  'Skoda': ['Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq'],
  'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Mustang', 'EcoSport', 'Puma', 'Kuga', 'Edge', 'Explorer', 'Ranger', 'F-150'],
  'Toyota': ['Yaris', 'Corolla', 'Camry', 'Avalon', 'C-HR', 'RAV4', 'Highlander', 'Land Cruiser', 'Prius', 'Mirai'],
  'Honda': ['Fit', 'Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'Odyssey'],
  'Hyundai': ['i10', 'i20', 'i30', 'Elantra', 'Sonata', 'Kona', 'Tucson', 'Santa Fe', 'Ioniq'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'Stonic', 'Sportage', 'Sorento', 'EV6', 'Niro'],
  'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Ariya', '370Z', 'GT-R'],
  'Mazda': ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'MX-5'],
  'Opel': ['Corsa', 'Astra', 'Insignia', 'Crossland', 'Grandland', 'Mokka'],
  'Peugeot': ['208', '308', '508', '2008', '3008', '5008'],
  'Renault': ['Clio', 'Megane', 'Talisman', 'Captur', 'Kadjar', 'Koleos', 'Zoe'],
  'Seat': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco'],
  'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C40'],
  'Fiat': ['500', 'Panda', 'Tipo', '500X', '500L'],
  'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover Velar'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
  'Mini': ['Cooper', 'Clubman', 'Countryman'],
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale'],
  'Lexus': ['IS', 'ES', 'LS', 'NX', 'RX', 'UX'],
  'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'WRX'],
  'Mitsubishi': ['Mirage', 'Lancer', 'Outlander', 'Eclipse Cross', 'Pajero'],
  'Suzuki': ['Swift', 'Vitara', 'S-Cross', 'Jimny'],
  'Dacia': ['Sandero', 'Logan', 'Duster', 'Jogger', 'Spring'],
  'Citroën': ['C3', 'C4', 'C5', 'C3 Aircross', 'C5 Aircross'],
  'Chevrolet': ['Spark', 'Cruze', 'Malibu', 'Equinox', 'Traverse', 'Tahoe', 'Silverado', 'Camaro', 'Corvette'],
  'Dodge': ['Charger', 'Challenger', 'Durango', 'Ram 1500'],
  'GMC': ['Sierra', 'Canyon', 'Acadia', 'Terrain', 'Yukon'],
  'Jaguar': ['XE', 'XF', 'XJ', 'F-Type', 'E-Pace', 'F-Pace', 'I-Pace'],
  'Maserati': ['Ghibli', 'Quattroporte', 'Levante', 'GranTurismo'],
  'Ferrari': ['Roma', 'Portofino', '488', 'F8', 'SF90'],
  'Lamborghini': ['Huracan', 'Aventador', 'Urus'],
  'Aston Martin': ['DB11', 'Vantage', 'DBS', 'DBX'],
  'Bentley': ['Continental', 'Flying Spur', 'Bentayga'],
  'Rolls-Royce': ['Ghost', 'Phantom', 'Wraith', 'Cullinan'],
};

// Fuel type options
const fuelTypeOptions = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Plug-in Hybrid'];

// Transmission options
const transmissionOptions = ['Manual', 'Automatic'];

// Body type options
const bodyTypeOptions = ['Sedan', 'Hatchback', 'SUV', 'Coupe', 'Wagon', 'Convertible', 'Van', 'Pickup'];

const props = defineProps({
  form: { type: Object, required: true },
  currentTab: { type: String, default: 'basic' },
  media: { type: Array, default: () => [] },
  features: { type: Array, default: () => [] },
  specs: { type: Object, default: () => ({}) },
  documents: { type: Array, default: () => [] },
  newFeature: { type: String, default: '' },
  newSpecKey: { type: String, default: '' },
  newSpecValue: { type: String, default: '' },
  docType: { type: String, default: '' },
  saving: { type: Boolean, default: false },
  uploading: { type: Boolean, default: false },
  uploadingDocs: { type: Boolean, default: false }
});

const emit = defineEmits([
  'update:form',
  'update:currentTab',
  'update:newFeature',
  'update:newSpecKey',
  'update:newSpecValue',
  'update:docType',
  'save',
  'cancel',
  'upload-media',
  'delete-media',
  'trigger-media-input',
  'reorder-media',
  'add-feature',
  'remove-feature',
  'save-features',
  'add-spec',
  'remove-spec',
  'save-specs',
  'upload-documents',
  'delete-document',
  'trigger-doc-input'
]);

const isFormValid = computed(() => {
  return props.form.title && props.form.make && props.form.model && props.form.year && props.form.price;
});

// Get available models based on selected make
const availableModels = computed(() => {
  if (!props.form.make) {
    return [];
  }
  return modelsByMake[props.form.make] || [];
});

function updateField(field, value) {
  // If make changes, clear the model field
  if (field === 'make') {
    emit('update:form', { ...props.form, [field]: value, model: '' });
  } else {
    emit('update:form', { ...props.form, [field]: value });
  }
}

// Drag and drop handlers for image reordering
function handleDragStart(event, itemId) {
  draggedItem.value = itemId;
  event.dataTransfer.effectAllowed = 'move';
  event.target.style.opacity = '0.5';
}

function handleDragEnd(event) {
  event.target.style.opacity = '1';
  draggedItem.value = null;
  dragOverItem.value = null;
}

function handleDragOver(event, itemId) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  dragOverItem.value = itemId;
}

function handleDrop(targetId) {
  if (!draggedItem.value || draggedItem.value === targetId) {
    return;
  }

  const items = [...props.media];
  const draggedIndex = items.findIndex(m => m.id === draggedItem.value);
  const targetIndex = items.findIndex(m => m.id === targetId);

  if (draggedIndex === -1 || targetIndex === -1) {
    return;
  }

  // Reorder the array
  const [draggedMedia] = items.splice(draggedIndex, 1);
  items.splice(targetIndex, 0, draggedMedia);

  // Emit the new order as an array of IDs
  const newOrder = items.map(m => m.id);
  emit('reorder-media', newOrder);
}
</script>

<style scoped>
/* Space & Grid */
.space { display:grid; gap: 1.25rem; }

/* Form Header */
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
.form-headings .muted { margin: 0.25rem 0 0; color: #64748b; font-size: 0.9375rem; }

/* Tabs */
.tabs { display:grid; gap:.75rem; }
.tabs-list { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:.5rem; }
@media(min-width: 720px){ .tabs-list { grid-template-columns: repeat(5, minmax(0,1fr)); } }
.tabs-list button { padding:.6rem .75rem; border:1px solid #e5e7eb; border-radius:.5rem; background:#fff; cursor:pointer; }
.tabs-list button.active { background:#3b82f6; color:#fff; }
.tab-panel { display:block; }

/* Cards */
.card { background:#fff; border:1px solid #e5e7eb; border-radius:.75rem; overflow:visible; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.card-body { padding: 1.5rem; overflow: visible; }
.card-title { margin:.5rem 0 1rem; font-size:1.125rem; font-weight: 600; color: #0f172a; }

/* Form Elements */
.form-grid { display:grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap:.75rem; }
@media(min-width: 720px){ .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.field { display:flex; flex-direction:column; gap:.25rem; }
.label { font-weight: 500; color: #374151; font-size: 0.875rem; }
.row-inline { display:flex; gap:.5rem; align-items:center; margin-bottom: 1rem;}

/* Images Grid */
.images-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 1rem;
  margin-top: 1rem;
}
@media(min-width: 768px){
  .images-grid {
    grid-template-columns: repeat(3, minmax(0,1fr));
  }
}
@media(min-width: 1024px){
  .images-grid {
    grid-template-columns: repeat(4, minmax(0,1fr));
  }
}

.img-item {
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  background: #fff;
  cursor: move;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.img-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.img-item.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.img-item.primary-image {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.img-item.primary-image:hover {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

.media-preview {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.drag-handle {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 0.375rem;
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
  cursor: move;
  z-index: 2;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.drag-handle:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.05);
}

.primary-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
  border-radius: 0.375rem;
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
}

.order-badge {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 2;
  min-width: 1.75rem;
  text-align: center;
  backdrop-filter: blur(4px);
}

.img-remove {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  border: none;
  background: #dc2626;
  color: #fff;
  border-radius: 0.375rem;
  padding: 0.375rem 0.5rem;
  cursor: pointer;
  opacity: 0.9;
  z-index: 2;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-remove:hover {
  opacity: 1;
  background: #b91c1c;
  transform: scale(1.05);
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  border: 2px dashed #cbd5e1;
  border-radius: 0.5rem;
  background: #f8fafc;
  height: 180px;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.video-placeholder i {
  font-size: 2rem;
  color: #3b82f6;
}

/* Empty State */
.empty { border:2px dashed #cbd5e1; border-radius:.5rem; padding:1.25rem; text-align:center; background: #f8fafc; }
.empty-inner { display:flex; align-items:center; justify-content:center; flex-direction:column; gap:.25rem; }
.empty-icon { font-size: 2rem; color: #9ca3af; }
.muted { color: #64748b; font-size: 0.875rem; margin: 0; }
.muted.small { font-size: 0.8125rem; }

/* Feature Library Styles */
.feature-selector-wrap {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.feature-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.feature-selector-title {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.feature-selector-title i {
  color: #3b82f6;
}

.category-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.category-tab {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s ease;
}

.category-tab i {
  font-size: 0.875rem;
}

.category-tab:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.category-tab.active {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}

.features-library {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
  min-height: 120px;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
  background: #fff;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.feature-badge {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  height: fit-content;
}

.feature-badge:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.feature-badge.selected {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #1e40af;
  font-weight: 600;
}

.feature-badge i {
  font-size: 0.75rem;
  color: #3b82f6;
}

.empty-features {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #9ca3af;
}

.empty-features i {
  font-size: 2rem;
}

.add-custom-feature {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.add-custom-feature .row-inline {
  margin-top: 0.75rem;
}

.selected-features-section {
  margin-top: 1.5rem;
}

.section-header-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

/* Features Chips */
.chips { display:flex; gap:.5rem; flex-wrap:wrap; margin:.25rem 0; }
.chip { background:#f3f4f6; border:1px solid #e5e7eb; padding:.25rem .5rem; border-radius:999px; display:inline-flex; align-items:center; gap:.25rem; }
.chip .x { background:transparent; border:none; cursor:pointer; line-height:1; font-size:1rem; }

/* Library Manager Modal Styles */
.library-category-section {
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #fff;
}

.library-category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.2s ease;
}

.library-category-header.clickable {
  cursor: pointer;
  user-select: none;
}

.library-category-header.clickable:hover {
  background: #f1f5f9;
}

.category-header-left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.chevron-icon {
  color: #64748b;
  font-size: 0.875rem;
  transition: transform 0.2s ease;
  width: 0.875rem;
  text-align: center;
}

.library-category-header h4 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.library-category-header h4 i {
  color: #3b82f6;
}

.library-features-list {
  padding: 1rem;
  display: grid;
  gap: 0.5rem;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.library-feature-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.75rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.library-feature-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.library-feature-item span {
  color: #374151;
  font-weight: 500;
}

.library-feature-item .btn.danger {
  color: #dc2626;
}

.library-feature-item .btn.danger:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.empty-category {
  text-align: center;
  padding: 1.5rem;
  color: #9ca3af;
  font-size: 0.875rem;
  font-style: italic;
}

/* Specifications */
.spec-input-section {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.spec-input-header {
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-subtitle i {
  color: #3b82f6;
}

.spec-input-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media(min-width: 720px) {
  .spec-input-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.spec-value-input {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.spec-value-input .input {
  flex: 1;
}

.add-spec-btn {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
  white-space: nowrap;
  padding: 0.5rem 1rem;
}

.add-spec-btn:hover:not(:disabled) {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
}

.add-spec-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.specs-list-section {
  margin-bottom: 1.5rem;
}

.save-specs-btn {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
}

.save-specs-btn:hover:not(:disabled) {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
}

.spec-list {
  display: grid;
  gap: 0.625rem;
  margin-top: 0.75rem;
}

.spec-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.spec-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.spec-item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.spec-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.spec-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.spec-key {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.9375rem;
}

.spec-value {
  color: #64748b;
  font-size: 0.875rem;
}

.spec-remove-btn {
  color: #dc2626;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.spec-remove-btn:hover {
  opacity: 1;
  background: #fee2e2 !important;
}

.quick-specs-section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.quick-specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 0.75rem;
}

@media(min-width: 640px) {
  .quick-specs-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media(min-width: 1024px) {
  .quick-specs-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.quick-spec-btn {
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  transition: all 0.2s ease;
  text-align: center;
}

.quick-spec-btn i {
  color: #3b82f6;
  font-size: 0.875rem;
}

.quick-spec-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.quick-spec-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f9fafb;
}

.quick-spec-btn:disabled i {
  color: #9ca3af;
}

/* Old spec styles for documents section */
.spec-row { display:grid; grid-template-columns: 1fr; gap:.5rem; }
@media(min-width: 720px){ .spec-row { grid-template-columns: 1fr 1fr; } }
.spec-value { display:flex; gap:.5rem; }
.spec-text { display:flex; align-items:center; gap:.5rem; }
.bold { font-weight: 600; color: #0f172a; }
.spec-val { color:#374151; }

/* Documents */
.docs { display:grid; gap:.5rem; margin-top:.75rem; }
.doc-item { display:flex; align-items:center; justify-content:space-between; padding:.6rem .75rem; background:#f3f4f6; border-radius:.5rem; }
.doc-left { display:flex; align-items:center; gap:.4rem; }

/* Badge */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1;
  background: #f1f5f9;
  color: #475569;
}

/* Dialog Styles */
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
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.dialog-large {
  max-width: 900px;
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
  flex-shrink: 0;
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

.dialog-icon.info {
  background: #dbeafe;
  color: #3b82f6;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  flex: 1;
}

.dialog-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.dialog-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.dialog-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.dialog-body p {
  margin: 0 0 0.75rem;
  color: #475569;
  line-height: 1.6;
}

.dialog-actions {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  background: #f9fafb;
  border-radius: 0 0 1rem 1rem;
  flex-shrink: 0;
}

.library-category-section {
  margin-bottom: 1.5rem;
}

.library-category-section:last-child {
  margin-bottom: 0;
}

.library-category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.library-category-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.library-category-header h4 i {
  color: #3b82f6;
}

.library-features-list {
  display: grid;
  gap: 0.5rem;
}

.library-feature-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.library-feature-item span {
  font-size: 0.875rem;
  color: #0f172a;
  font-weight: 500;
}

.empty-category {
  padding: 1rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  font-style: italic;
}

.btn.small {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.btn.danger {
  color: #dc2626;
}

.btn.danger:hover {
  background: #fee2e2;
}

/* Save Car Button */
.save-car-btn {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
}
.save-car-btn:hover:not(:disabled) {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
}

/* Upload Images Button */
.upload-images-btn {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
}
.upload-images-btn:hover:not(:disabled) {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
}

/* Add Feature Button */
.add-feature-btn {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
}
.add-feature-btn:hover:not(:disabled) {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
}

/* Done Button in Library Manager */
.done-btn {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
}
.done-btn:hover:not(:disabled) {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
}

/* CustomSelect full width styling */
:deep(.custom-select) { width: 100%; }
:deep(.select-trigger.full) { width: 100%; justify-content: flex-start; min-width: 0; }
:deep(.select-trigger.category-select) { width: 100%; }

/* Responsive */
@media(max-width: 1024px){
  .form-header { flex-direction: column; align-items: stretch; }
  .features-library {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media(max-width: 640px){
  .category-tabs {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .features-library {
    grid-template-columns: 1fr;
  }
  
  .row-inline {
    flex-direction: column;
    align-items: stretch;
  }
  
  .section-header-inline {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .doc-filters {
    justify-content: center;
  }
  
  .doc-card {
    flex-direction: column;
  }
  
  .doc-card-icon {
    align-self: center;
  }
}

/* Documents Section */
.doc-upload-section {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.doc-upload-header {
  margin-bottom: 1rem;
}

.doc-upload-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media(min-width: 720px) {
  .doc-upload-form {
    grid-template-columns: 1fr 2fr;
  }
}

.file-upload-wrapper {
  display: flex;
  flex-direction: column;
}

.file-input-hidden {
  display: none;
}

.upload-docs-btn {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
  width: 30%;
}

.upload-docs-btn:hover:not(:disabled) {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
}

.docs-section {
  margin-top: 1.5rem;
}

.doc-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

.doc-filter-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: #fff;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s ease;
}

.doc-filter-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.doc-filter-btn.active {
  background: #dbeafe;
  color: #1e40af;
  border-color: #3b82f6;
  font-weight: 600;
}

.filter-count {
  background: #e5e7eb;
  color: #374151;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 1.25rem;
  text-align: center;
}

.doc-filter-btn.active .filter-count {
  background: #3b82f6;
  color: #fff;
}

.docs-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

@media(min-width: 640px) {
  .docs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media(min-width: 1024px) {
  .docs-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.doc-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.doc-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.doc-card-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.doc-icon-pdf {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
}

.doc-icon-word {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
}

.doc-icon-excel {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
}

.doc-icon-text {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: #fff;
}

.doc-icon-image {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: #fff;
}

.doc-icon-default {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: #fff;
}

.doc-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.doc-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.doc-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.doc-delete-btn {
  color: #dc2626;
  opacity: 0.7;
  flex-shrink: 0;
  padding: 0.25rem 0.5rem;
}

.doc-delete-btn:hover {
  opacity: 1;
  background: #fee2e2 !important;
}

.doc-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.doc-card-meta > span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #64748b;
}

.doc-card-meta i {
  font-size: 0.75rem;
  color: #9ca3af;
}

.doc-type-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.doc-size {
  font-weight: 500;
}

.doc-date {
  font-style: italic;
}

.doc-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.doc-card-actions .btn {
  flex: 1;
  justify-content: center;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}
</style>
