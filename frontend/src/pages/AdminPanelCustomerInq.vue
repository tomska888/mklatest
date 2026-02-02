<template>
  <div class="space">
    <div class="page-header">
      <div>
        <h2 class="page-title">Customer Inquiries</h2>
      </div>
    </div>

    <div class="grid stats">
      <div class="card stat">
        <div class="card-body">
          <div class="stat-row">
            <div class="value">{{ stats.total || 0 }}</div>
            <div class="stat-icon blue">
              <i class="fa-solid fa-inbox"></i>
            </div>
          </div>
          <p class="muted">Total Inquiries</p>
        </div>
      </div>
      <div class="card stat">
        <div class="card-body">
          <div class="stat-row">
            <div class="value amber">{{ stats.pending || 0 }}</div>
            <div class="stat-icon amber">
              <i class="fa-solid fa-clock"></i>
            </div>
          </div>
          <p class="muted">Pending</p>
        </div>
      </div>
      <div class="card stat">
        <div class="card-body">
          <div class="stat-row">
            <div class="value purple">{{ stats.in_progress || 0 }}</div>
            <div class="stat-icon purple">
              <i class="fa-solid fa-message"></i>
            </div>
          </div>
          <p class="muted">In Progress</p>
        </div>
      </div>
      <div class="card stat">
        <div class="card-body">
          <div class="stat-row">
            <div class="value green">{{ stats.resolved || 0 }}</div>
            <div class="stat-icon green">
              <i class="fa-solid fa-check-circle"></i>
            </div>
          </div>
          <p class="muted">Resolved</p>
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="card">
      <div class="card-body">
        <div class="filter-tabs">
          <button 
            v-for="filter in filters" 
            :key="filter.value"
            :class="['filter-tab', { active: currentFilter === filter.value }]"
            @click="currentFilter = filter.value"
          >
            <i :class="filter.icon"></i>
            {{ filter.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Inquiries List -->
    <div v-if="loading" class="card">
      <div class="card-body center">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #64748b;"></i>
        <p style="color: #64748b; margin-top: 1rem;">Loading inquiries...</p>
      </div>
    </div>

    <div v-else-if="filteredInquiries.length === 0" class="card">
      <div class="card-body center">
        <i class="fa-solid fa-inbox" style="font-size: 3rem; color: #cbd5e1;"></i>
        <p style="color: #64748b; margin-top: 1rem;">No inquiries found</p>
      </div>
    </div>

    <div v-else class="inquiries-list">
      <div v-for="inquiry in filteredInquiries" :key="inquiry.id" class="card inquiry-card">
        <div class="card-body">
          <div class="inquiry-header">
            <div class="inquiry-info">
              <h3 class="inquiry-name">{{ inquiry.name }}</h3>
              <p class="inquiry-meta">
                <i class="fa-solid fa-envelope"></i> {{ inquiry.email }}
                <span v-if="inquiry.phone">
                  <i class="fa-solid fa-phone" style="margin-left: 1rem;"></i> {{ inquiry.phone }}
                </span>
              </p>
            </div>
            <div class="inquiry-actions">
              <button @click="openInquiry(inquiry)" class="btn-icon primary" title="View Details">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button @click="deleteInquiry(inquiry.id)" class="btn-icon danger" title="Delete">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>

          <div v-if="inquiry.subject" class="inquiry-subject">
            <strong>Subject:</strong> {{ inquiry.subject }}
          </div>

          <div class="inquiry-message">
            {{ inquiry.message }}
          </div>

          <div class="inquiry-footer">
            <span class="inquiry-date">
              <i class="fa-solid fa-calendar"></i>
              {{ formatDate(inquiry.created_at) }}
            </span>
            <span :class="['status-badge', inquiry.status]">
              <i :class="getStatusIcon(inquiry.status)"></i>
              {{ getStatusLabel(inquiry.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Inquiry Details Modal -->
    <div v-if="selectedInquiry" class="modal-backdrop" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Inquiry Details</h3>
          <button class="modal-close" @click="closeModal">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- Customer Info -->
          <div class="info-section">
            <h4><i class="fa-solid fa-user"></i> Customer Information</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>Name:</label>
                <span>{{ selectedInquiry.name }}</span>
              </div>
              <div class="info-item">
                <label>Email:</label>
                <span>{{ selectedInquiry.email }}</span>
              </div>
              <div class="info-item" v-if="selectedInquiry.phone">
                <label>Phone:</label>
                <span>{{ selectedInquiry.phone }}</span>
              </div>
              <div class="info-item">
                <label>Date:</label>
                <span>{{ formatDate(selectedInquiry.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Subject & Message -->
          <div class="info-section">
            <h4><i class="fa-solid fa-message"></i> Message</h4>
            <div v-if="selectedInquiry.subject" class="message-subject">
              <strong>Subject:</strong> {{ selectedInquiry.subject }}
            </div>
            <div class="message-content">
              {{ selectedInquiry.message }}
            </div>
          </div>

          <!-- Status Actions -->
          <div class="info-section">
            <h4><i class="fa-solid fa-flag"></i> Status</h4>
            <div class="status-buttons">
              <button
                :class="['status-btn', 'pending', { active: selectedInquiry.status === 'pending' }]"
                @click="updateInquiryStatus('pending')"
                title="Mark as Pending - Waiting to be replied"
              >
                <i class="fa-solid fa-clock"></i>
                <span>Pending</span>
              </button>
              <button
                :class="['status-btn', 'in_progress', { active: selectedInquiry.status === 'in_progress' }]"
                @click="updateInquiryStatus('in_progress')"
                title="Mark as In Progress - Currently replying"
              >
                <i class="fa-solid fa-spinner"></i>
                <span>In Progress</span>
              </button>
              <button
                :class="['status-btn', 'resolved', { active: selectedInquiry.status === 'resolved' }]"
                @click="updateInquiryStatus('resolved')"
                title="Mark as Resolved - Reply sent and case closed"
              >
                <i class="fa-solid fa-check-circle"></i>
                <span>Resolved</span>
              </button>
            </div>
          </div>

          <!-- Reply Section -->
          <div class="info-section">
            <h4><i class="fa-solid fa-reply"></i> Send Reply</h4>
            <div class="reply-form">
              <div class="form-field">
                <label>Subject:</label>
                <input 
                  v-model="replyForm.subject" 
                  type="text" 
                  class="input"
                  placeholder="Re: Customer Inquiry"
                />
              </div>
              <div class="form-field">
                <label>Message:</label>
                <textarea 
                  v-model="replyForm.message" 
                  class="input textarea"
                  rows="6"
                  placeholder="Type your reply here..."
                ></textarea>
              </div>
              <button 
                @click="sendReply" 
                class="btn primary"
                :disabled="!replyForm.subject || !replyForm.message || sending"
              >
                <i :class="sending ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-paper-plane'"></i>
                {{ sending ? 'Sending...' : 'Send Reply' }}
              </button>
            </div>
          </div>

          <!-- Previous Replies -->
          <div v-if="replies.length > 0" class="info-section">
            <h4><i class="fa-solid fa-history"></i> Previous Replies ({{ replies.length }})</h4>
            <div class="replies-list">
              <div v-for="reply in replies" :key="reply.id" class="reply-item">
                <div class="reply-header">
                  <strong>{{ reply.subject }}</strong>
                  <span class="reply-date">{{ formatDate(reply.sent_at) }}</span>
                </div>
                <div class="reply-body">{{ reply.message }}</div>
                <div class="reply-footer">
                  <span v-if="reply.sent_by_name">Sent by: {{ reply.sent_by_name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn ghost" @click="closeModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { InquiriesAPI } from '../api.js';

const inquiries = ref([]);
const stats = ref({ total: 0, pending: 0, in_progress: 0, resolved: 0 });
const loading = ref(true);
const currentFilter = ref('all');
const selectedInquiry = ref(null);
const replies = ref([]);
const sending = ref(false);

const replyForm = ref({
  subject: '',
  message: ''
});

const filters = [
  { label: 'All', value: 'all', icon: 'fa-solid fa-list' },
  { label: 'Pending', value: 'pending', icon: 'fa-solid fa-clock' },
  { label: 'In Progress', value: 'in_progress', icon: 'fa-solid fa-spinner' },
  { label: 'Resolved', value: 'resolved', icon: 'fa-solid fa-check-circle' }
];

const filteredInquiries = computed(() => {
  if (currentFilter.value === 'all') return inquiries.value;
  return inquiries.value.filter(i => i.status === currentFilter.value);
});

function getStatusLabel(status) {
  const labels = {
    'pending': 'Pending',
    'in_progress': 'In Progress',
    'resolved': 'Resolved'
  };
  return labels[status] || status;
}

function getStatusIcon(status) {
  const icons = {
    'pending': 'fa-solid fa-clock',
    'in_progress': 'fa-solid fa-spinner',
    'resolved': 'fa-solid fa-check-circle'
  };
  return icons[status] || 'fa-solid fa-circle';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

async function loadInquiries() {
  loading.value = true;
  try {
    const [inquiriesData, statsData] = await Promise.all([
      InquiriesAPI.list(),
      InquiriesAPI.stats()
    ]);
    inquiries.value = inquiriesData.items || [];
    stats.value = statsData;
  } catch (err) {
    console.error('Failed to load inquiries:', err);
  } finally {
    loading.value = false;
  }
}

async function openInquiry(inquiry) {
  selectedInquiry.value = inquiry;
  replyForm.value.subject = `Re: ${inquiry.subject || 'Your Inquiry'}`;
  replyForm.value.message = '';
  
  // Load previous replies
  try {
    const repliesData = await InquiriesAPI.getReplies(inquiry.id);
    replies.value = repliesData.items || [];
  } catch (err) {
    console.error('Failed to load replies:', err);
    replies.value = [];
  }
}

function closeModal() {
  selectedInquiry.value = null;
  replies.value = [];
  replyForm.value.subject = '';
  replyForm.value.message = '';
}

async function updateInquiryStatus(newStatus) {
  if (!selectedInquiry.value) return;
  
  try {
    await InquiriesAPI.updateStatus(selectedInquiry.value.id, newStatus);
    selectedInquiry.value.status = newStatus;
    
    // Update in list
    const inquiry = inquiries.value.find(i => i.id === selectedInquiry.value.id);
    if (inquiry) {
      inquiry.status = newStatus;
    }
    
    // Reload stats
    stats.value = await InquiriesAPI.stats();
  } catch (err) {
    console.error('Failed to update status:', err);
    alert('Failed to update status. Please try again.');
  }
}

async function sendReply() {
  if (!selectedInquiry.value || !replyForm.value.subject || !replyForm.value.message) return;
  
  sending.value = true;
  try {
    await InquiriesAPI.reply(selectedInquiry.value.id, {
      subject: replyForm.value.subject,
      message: replyForm.value.message
    });
    
    alert('Reply sent successfully!');
    
    // Reload replies
    const repliesData = await InquiriesAPI.getReplies(selectedInquiry.value.id);
    replies.value = repliesData.items || [];
    
    // Clear form
    replyForm.value.message = '';
    
    // Reload inquiry to get updated status
    await loadInquiries();
    const updatedInquiry = inquiries.value.find(i => i.id === selectedInquiry.value.id);
    if (updatedInquiry) {
      selectedInquiry.value = updatedInquiry;
    }
  } catch (err) {
    console.error('Failed to send reply:', err);
    alert('Failed to send reply. Please check SMTP configuration and try again.');
  } finally {
    sending.value = false;
  }
}

async function deleteInquiry(id) {
  if (!confirm('Are you sure you want to delete this inquiry?')) return;
  
  try {
    await InquiriesAPI.remove(id);
    inquiries.value = inquiries.value.filter(i => i.id !== id);
    stats.value = await InquiriesAPI.stats();
    
    if (selectedInquiry.value && selectedInquiry.value.id === id) {
      closeModal();
    }
  } catch (err) {
    console.error('Failed to delete inquiry:', err);
    alert('Failed to delete inquiry. Please try again.');
  }
}

onMounted(() => {
  loadInquiries();
});
</script>

<style scoped>
/* Space & Grid */
.space { display:grid; gap: 1.25rem; }
.grid { display:grid; gap: 1rem; }
.grid.stats { grid-template-columns: repeat(1, minmax(0, 1fr)); }
@media(min-width: 768px){ .grid.stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media(min-width: 1024px){ .grid.stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

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
.center { text-align: center; }

/* Stats Cards */
.stat { position: relative; overflow: visible; }
.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}
.stat-icon.blue { background: #eff6ff; color: #3b82f6; }
.stat-icon.amber { background: #fffbeb; color: #f59e0b; }
.stat-icon.purple { background: #faf5ff; color: #8b5cf6; }
.stat-icon.green { background: #f0fdf4; color: #10b981; }
.stat .muted { color:#64748b; font-size:.875rem; margin:0; font-weight: 500; }
.stat .value { font-size:2.25rem; font-weight:800; color: #0f172a; line-height: 1; }
.stat .value.amber { color:#d97706; }
.stat .value.purple { color:#8b5cf6; }
.stat .value.green { color:#16a34a; }

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.filter-tab {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.filter-tab:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}
.filter-tab.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Inquiries List */
.inquiries-list {
  display: grid;
  gap: 1rem;
}

.inquiry-card {
  transition: all 0.2s;
}

.inquiry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.inquiry-info {
  flex: 1;
}

.inquiry-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.25rem;
}

.inquiry-meta {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.inquiry-meta i {
  font-size: 0.75rem;
  margin-right: 0.25rem;
}

.inquiry-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-icon {
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f8fafc;
}

.btn-icon.primary {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #2563eb;
}

.btn-icon.primary:hover {
  background: #3b82f6;
  color: white;
}

.btn-icon.danger:hover {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}

.inquiry-subject {
  font-size: 0.9375rem;
  color: #334155;
  margin-bottom: 0.75rem;
}

.inquiry-message {
  color: #475569;
  font-size: 0.9375rem;
  line-height: 1.6;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  white-space: pre-wrap;
}

.inquiry-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.inquiry-date {
  font-size: 0.8125rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.status-badge.pending {
  background: #fffbeb;
  color: #d97706;
}

.status-badge.in_progress {
  background: #faf5ff;
  color: #8b5cf6;
}

.status-badge.resolved {
  background: #f0fdf4;
  color: #16a34a;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.modal {
  background: #fff;
  border-radius: 1rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.modal-close {
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: none;
  background: #f3f4f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e5e7eb;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h4 {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-section h4 i {
  color: #3b82f6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.info-item span {
  font-size: 0.9375rem;
  color: #0f172a;
}

.message-subject {
  font-size: 0.9375rem;
  color: #334155;
  margin-bottom: 0.75rem;
}

.message-content {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  color: #475569;
  font-size: 0.9375rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* Status Buttons */
.status-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.status-btn {
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.status-btn i {
  font-size: 1.5rem;
}

.status-btn.pending {
  color: #d97706;
}

.status-btn.pending:hover,
.status-btn.pending.active {
  background: #fffbeb;
  border-color: #fde68a;
}

.status-btn.in_progress {
  color: #8b5cf6;
}

.status-btn.in_progress:hover,
.status-btn.in_progress.active {
  background: #faf5ff;
  border-color: #e9d5ff;
}

.status-btn.resolved {
  color: #16a34a;
}

.status-btn.resolved:hover,
.status-btn.resolved.active {
  background: #f0fdf4;
  border-color: #86efac;
}

.status-btn.active {
  border-width: 3px;
}

/* Reply Form */
.reply-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

.input {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-family: inherit;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 120px;
}

/* Replies List */
.replies-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reply-item {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.reply-header strong {
  color: #0f172a;
  font-size: 0.9375rem;
}

.reply-date {
  font-size: 0.8125rem;
  color: #94a3b8;
}

.reply-body {
  color: #475569;
  font-size: 0.9375rem;
  line-height: 1.6;
  white-space: pre-wrap;
  margin-bottom: 0.5rem;
}

.reply-footer {
  font-size: 0.8125rem;
  color: #64748b;
  font-style: italic;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn.primary {
  background: #3b82f6;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.ghost {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.btn.ghost:hover {
  background: #f8fafc;
}

/* Responsive */
@media(max-width: 1024px){
  .page-header { flex-direction: column; align-items: stretch; }
}

@media(max-width: 768px){
  .inquiry-header {
    flex-direction: column;
  }
  
  .inquiry-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .status-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
