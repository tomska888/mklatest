<template>
  <div class="space">
    <div class="page-header">
      <div>
        <h2 class="page-title">Newsletter Management</h2>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <h3 class="section-title">
          <i class="fa-solid fa-paper-plane"></i>
          Compose Newsletter
        </h3>

        <form @submit.prevent="$emit('send')" class="space">
          <!-- Subject Line -->
          <div class="field">
            <label class="label">Subject Line *</label>
            <input
              class="input"
              placeholder="Latest arrivals from MK Automobile"
              :value="mail.subject"
              @input="$emit('update:mail', { ...mail, subject: $event.target.value })"
              required
            />
          </div>

          <!-- Template Selection -->
          <div class="field">
            <label class="label">Email Template</label>
            <div class="template-selector">
              <button
                v-for="template in templates"
                :key="template.id"
                type="button"
                class="template-card"
                :class="{ active: selectedTemplate === template.id }"
                @click="selectTemplate(template)"
              >
                <i :class="template.icon"></i>
                <span>{{ template.name }}</span>
              </button>
            </div>
          </div>

          <!-- Two Column Layout: Editor and Preview -->
          <div class="editor-preview-layout">
            <!-- Left Column: Editor -->
            <div class="editor-column">
              <label class="label">Content *</label>
              <textarea
                class="input editor-textarea"
                placeholder="Enter your email content here..."
                :value="mail.html"
                @input="$emit('update:mail', { ...mail, html: $event.target.value })"
                required
              ></textarea>
            </div>

            <!-- Right Column: Live Preview -->
            <div class="preview-column">
              <label class="label">Live Preview</label>
              <div class="preview-container">
                <div class="preview-email">
                  <div class="preview-subject">
                    <strong>Subject:</strong> {{ mail.subject || 'No subject' }}
                  </div>
                  <div class="preview-divider"></div>
                  <div class="preview-content" v-html="previewHtml"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="alert alert-info">
            <i class="fa-solid fa-circle-info"></i>
            <div>
              <strong>Ready to send?</strong>
              <p>This newsletter will be sent to all {{ subscribers.length }} active subscribers.</p>
            </div>
          </div>
          <div class="action-buttons">
            <button class="btn primary" type="submit" :disabled="sending || !mail.subject || !mail.html">
              <i class="fa-solid fa-paper-plane"></i>
              {{ sending ? 'Sending…' : 'Send to All Subscribers' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="subscriber-header">
          <h3 class="section-title">
            <i class="fa-solid fa-users"></i>
            Subscriber List ({{ subscribers.length }})
          </h3>
          <div class="subscriber-actions">
            <button class="btn ghost" @click="$emit('refresh')" title="Refresh list">
              <i class="fa-solid fa-rotate"></i>
              Refresh
            </button>
            <button class="btn ghost" @click="exportSubscribers" title="Export to CSV">
              <i class="fa-solid fa-download"></i>
              Export CSV
            </button>
          </div>
        </div>
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 60px;">ID</th>
                <th>Email Address</th>
                <th style="width: 120px; text-align: center;">Newsletter</th>
                <th style="width: 120px; text-align: center;">Listings</th>
                <th style="width: 140px;">Subscribed</th>
                <th style="width: 80px; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in subscribers" :key="s.id">
                <td><span class="id-badge">#{{ s.id }}</span></td>
                <td>
                  <div class="cell-content">
                    <i class="fa-solid fa-envelope cell-icon"></i>
                    {{ s.email }}
                  </div>
                </td>
                <td style="text-align: center;">
                  <i
                    v-if="s.email_notifications"
                    class="fa-solid fa-check icon-check"
                    title="Subscribed to newsletters"
                  ></i>
                  <i
                    v-else
                    class="fa-solid fa-xmark icon-x"
                    title="Not subscribed to newsletters"
                  ></i>
                </td>
                <td style="text-align: center;">
                  <i
                    v-if="s.new_listings"
                    class="fa-solid fa-check icon-check"
                    title="Subscribed to new listings"
                  ></i>
                  <i
                    v-else
                    class="fa-solid fa-xmark icon-x"
                    title="Not subscribed to new listings"
                  ></i>
                </td>
                <td>{{ formatDateOnly(s.subscribed_at) }}</td>
                <td style="text-align: center;">
                  <button
                    class="btn-icon-delete"
                    @click="confirmRemove(s)"
                    title="Remove subscriber"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="!subscribers.length">
                <td colspan="6" class="empty-cell">
                  <i class="fa-solid fa-inbox"></i>
                  <span>No subscribers yet</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div v-if="subscriberToRemove" class="dialog-backdrop" @click="subscriberToRemove = null">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <div class="dialog-icon danger">
            <i class="fa-solid fa-trash"></i>
          </div>
          <h3>Remove Subscriber</h3>
        </div>
        <div class="dialog-body">
          <p>Are you sure you want to remove this subscriber?</p>
          <p class="warning-text">
            <strong>{{ subscriberToRemove.email }}</strong> will be permanently removed from the newsletter list.
          </p>
        </div>
        <div class="dialog-actions">
          <button class="btn ghost" @click="subscriberToRemove = null">Cancel</button>
          <button class="btn danger" @click="removeSubscriber">
            <i class="fa-solid fa-trash"></i>
            Remove Subscriber
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  subscribers: { type: Array, default: () => [] },
  mail: { type: Object, required: true },
  sending: { type: Boolean, default: false }
});

const emit = defineEmits(['send', 'update:mail', 'refresh', 'remove-subscriber']);

const selectedTemplate = ref('blank');
const subscriberToRemove = ref(null);

const templates = [
  {
    id: 'blank',
    name: 'Blank',
    icon: 'fa-solid fa-file',
    html: '<p>Start writing your newsletter content here...</p>'
  },
  {
    id: 'new-arrivals',
    name: 'New Arrivals',
    icon: 'fa-solid fa-car',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Vehicles Have Arrived!</h1>
    <p style="color: #f0f0f0; margin: 8px 0 0; font-size: 14px;">Fresh inventory from MK Automobile</p>
  </div>
  <div style="padding: 30px 20px;">
    <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px;">Check Out Our Latest Collection</h2>
    <p style="color: #666666; line-height: 1.6; margin: 0 0 15px;">We've just added premium vehicles to our showroom.</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="#" style="background: #667eea; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Browse New Arrivals</a>
    </div>
  </div>
  <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
    <p style="color: #999999; font-size: 13px; margin: 0 0 8px;">© 2026 {{COMPANY_NAME}}. All rights reserved.</p>
    <p style="color: #999999; font-size: 11px; margin: 0;"><a href="{{UNSUBSCRIBE_LINK}}" style="color: #667eea; text-decoration: none;">Unsubscribe</a></p>
  </div>
</div>`
  },
  {
    id: 'promotion',
    name: 'Promotion',
    icon: 'fa-solid fa-tag',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px 20px; text-align: center;">
    <div style="background: #ffffff; color: #f5576c; display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 12px; margin-bottom: 15px;">LIMITED TIME</div>
    <h1 style="color: #ffffff; margin: 0; font-size: 26px;">Special Discount!</h1>
    <p style="color: #ffffff; margin: 10px 0 0; font-size: 15px;">Save big on selected vehicles</p>
  </div>
  <div style="padding: 30px 20px;">
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px;">
      <h2 style="color: #856404; margin: 0 0 8px; font-size: 20px;">🎉 Up to 20% Off!</h2>
      <p style="color: #856404; margin: 0; font-size: 14px;">On selected models</p>
    </div>
    <p style="color: #666666; line-height: 1.6; margin: 0 0 15px;">Don't miss this exclusive opportunity to own your dream car at an unbeatable price.</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="#" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 700; font-size: 15px;">Claim Your Discount</a>
    </div>
  </div>
  <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
    <p style="color: #999999; font-size: 13px; margin: 0 0 8px;">© 2026 {{COMPANY_NAME}}. All rights reserved.</p>
    <p style="color: #999999; font-size: 11px; margin: 0;"><a href="{{UNSUBSCRIBE_LINK}}" style="color: #f5576c; text-decoration: none;">Unsubscribe</a></p>
  </div>
</div>`
  },
  {
    id: 'newsletter',
    name: 'Monthly Update',
    icon: 'fa-solid fa-newspaper',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
  <div style="background: #1e293b; padding: 25px 20px;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px; text-align: center;">MK Automobile Monthly</h1>
    <p style="color: #94a3b8; margin: 8px 0 0; text-align: center; font-size: 13px;">Your automotive update - February 2026</p>
  </div>
  <div style="padding: 30px 20px;">
    <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 15px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">This Month's Highlights</h2>
    
    <div style="margin: 20px 0;">
      <h3 style="color: #334155; font-size: 16px; margin: 0 0 8px;">🚗 New Inventory</h3>
      <p style="color: #64748b; line-height: 1.6; margin: 0; font-size: 14px;">5 new premium vehicles added to our collection.</p>
    </div>

    <div style="margin: 20px 0;">
      <h3 style="color: #334155; font-size: 16px; margin: 0 0 8px;">💰 Financing Options</h3>
      <p style="color: #64748b; line-height: 1.6; margin: 0; font-size: 14px;">Flexible payment plans available starting from 2.9%.</p>
    </div>

    <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
      <h3 style="color: #ffffff; margin: 0 0 12px; font-size: 17px;">Ready to Find Your Perfect Car?</h3>
      <a href="#" style="background: #ffffff; color: #2563eb; padding: 10px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px;">View Our Inventory</a>
    </div>
  </div>
  <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
    <p style="color: #999999; font-size: 13px; margin: 0 0 8px;">© 2026 {{COMPANY_NAME}}. All rights reserved.</p>
    <p style="color: #999999; font-size: 11px; margin: 0;"><a href="{{UNSUBSCRIBE_LINK}}" style="color: #3b82f6; text-decoration: none;">Unsubscribe</a></p>
  </div>
</div>`
  }
];

const previewHtml = computed(() => {
  if (!props.mail.html) {
    return '<p style="color: #999; text-align: center; padding: 40px 20px;">Your email preview will appear here...</p>';
  }
  // Replace template variables with preview values
  return props.mail.html
    .replace(/\{\{COMPANY_NAME\}\}/g, 'MK Automobile')
    .replace(/\{\{UNSUBSCRIBE_LINK\}\}/g, '#unsubscribe');
});

function selectTemplate(template) {
  selectedTemplate.value = template.id;
  emit('update:mail', { ...props.mail, html: template.html });
}

function formatDate(date) {
  try {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return date;
  }
}

function formatDateOnly(date) {
  try {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return date;
  }
}

function confirmRemove(subscriber) {
  subscriberToRemove.value = subscriber;
}

function removeSubscriber() {
  if (subscriberToRemove.value) {
    emit('remove-subscriber', subscriberToRemove.value.id);
    subscriberToRemove.value = null;
  }
}

function exportSubscribers() {
  if (!props.subscribers.length) return;
  
  // Create CSV content
  const headers = ['ID', 'Email', 'Email Notifications', 'New Listings', 'Subscription Date'];
  const rows = props.subscribers.map(s => [
    s.id,
    s.email,
    s.email_notifications ? 'Yes' : 'No',
    s.new_listings ? 'Yes' : 'No',
    formatDate(s.subscribed_at)
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
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
  margin: 0.5rem 0 0;
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
.field { display:flex; flex-direction:column; gap:.5rem; }
.label { font-weight: 600; color: #374151; font-size: 0.875rem; }

/* Field hints */
.field-hint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  color: #64748b;
}

/* Template Selector */
.template-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
}

.template-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem;
  background: #f8f9fa;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #475569;
}

.template-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

.template-card.active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1e40af;
}

.template-card i {
  font-size: 1.125rem;
  color: inherit;
}

/* Two-Column Layout */
.editor-preview-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.editor-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.editor-textarea {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  height: 500px;
}

/* Preview Column */
.preview-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-container {
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #f8f9fa;
  overflow: hidden;
  height: 500px;
}

.preview-email {
  background: #ffffff;
  height: 100%;
  overflow-y: auto;
}

.preview-subject {
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #475569;
}

.preview-subject strong {
  color: #1e293b;
}

.preview-divider {
  height: 1px;
  background: #e5e7eb;
}

.preview-content {
  padding: 1rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #1e293b;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-buttons .btn.primary {
  background: #3b82f6;
}

.action-buttons .btn.primary:hover {
  background: #2563eb;
}

.action-buttons .btn.primary:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

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

/* Table */
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
.table tbody tr:hover {
  background: #f8fafc;
}
.table td {
  padding: 1.25rem 1rem;
  vertical-align: middle;
}
.cell-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.cell-icon {
  color: #9ca3af;
}
.empty-cell {
  text-align: center !important;
  padding: 3rem 1.25rem !important;
  color: #64748b !important;
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

/* ID Badge */
.id-badge {
  font-family: monospace;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
}

/* Icon Styles */
.icon-check {
  color: #16a34a;
  font-size: 1.125rem;
}

.icon-x {
  color: #dc2626;
  font-size: 1.125rem;
}

/* Delete Button */
.btn-icon-delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #dc2626;
  font-size: 1rem;
  transition: all 0.15s ease;
  border-radius: 0.375rem;
}

.btn-icon-delete:hover {
  background: #fee2e2;
  transform: scale(1.1);
}

/* Subscriber Header */
.subscriber-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.subscriber-actions {
  display: flex;
  gap: 0.5rem;
}

/* Dialog */
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
  max-width: 500px;
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
@media(max-width: 1200px){
  .editor-preview-layout {
    grid-template-columns: 1fr;
  }
  
  .preview-column {
    position: relative;
    top: 0;
  }
  
  .template-selector {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media(max-width: 1024px){
  .page-header { flex-direction: column; align-items: stretch; }
}

@media(max-width: 640px) {
  .table th, .table td { padding: 0.75rem 0.5rem; font-size: 0.875rem; }
  
  .template-selector {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .btn {
    width: 100%;
  }
}
</style>
