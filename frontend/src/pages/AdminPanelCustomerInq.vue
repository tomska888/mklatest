<template>
  <div class="space">
    <div class="page-header">
      <div>
        <h2 class="page-title">Customer Inquiries</h2>
        <p class="page-subtitle">Manage customer questions and requests</p>
      </div>
    </div>

    <div class="grid stats">
      <div class="card stat">
        <div class="card-body">
          <div class="stat-header">
            <div class="stat-icon blue">
              <i class="fa-solid fa-inbox"></i>
            </div>
          </div>
          <div class="value">{{ inquiries.length }}</div>
          <p class="muted">Total Inquiries</p>
        </div>
      </div>
      <div class="card stat">
        <div class="card-body">
          <div class="stat-header">
            <div class="stat-icon amber">
              <i class="fa-solid fa-clock"></i>
            </div>
          </div>
          <div class="value blue">{{ stats.new }}</div>
          <p class="muted">Pending</p>
        </div>
      </div>
      <div class="card stat">
        <div class="card-body">
          <div class="stat-header">
            <div class="stat-icon purple">
              <i class="fa-solid fa-message"></i>
            </div>
          </div>
          <div class="value amber">{{ stats.contacted }}</div>
          <p class="muted">In Progress</p>
        </div>
      </div>
      <div class="card stat">
        <div class="card-body">
          <div class="stat-header">
            <div class="stat-icon green">
              <i class="fa-solid fa-check-circle"></i>
            </div>
          </div>
          <div class="value green">{{ stats.closed }}</div>
          <p class="muted">Resolved</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="alert alert-info">
          <i class="fa-solid fa-circle-info"></i>
          <div>
            <strong>Feature Coming Soon</strong>
            <p>The inquiry management system will be integrated with the backend in a future update. You'll be able to track, respond to, and manage customer inquiries directly from this panel.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  inquiries: { type: Array, default: () => [] }
});

const stats = computed(() => ({ 
  total: props.inquiries.length, 
  new: 0, 
  contacted: 0, 
  closed: 0
}));
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

/* Cards */
.card { background:#fff; border:1px solid #e5e7eb; border-radius:.75rem; overflow:hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08); transition: box-shadow 0.2s ease; }
.card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.12); }
.card-body { padding: 1.5rem; }

/* Stats Cards */
.stat { position: relative; overflow: visible; }
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
.stat-icon.amber { background: #fffbeb; color: #f59e0b; }
.stat-icon.purple { background: #faf5ff; color: #8b5cf6; }
.stat-icon.green { background: #f0fdf4; color: #10b981; }
.stat .muted { color:#64748b; font-size:.875rem; margin:0.5rem 0 0; font-weight: 500; }
.stat .value { font-size:2.25rem; font-weight:800; color: #0f172a; line-height: 1; margin: 0.5rem 0; }
.stat .value.blue { color:#2563eb; }
.stat .value.amber { color:#d97706; }
.stat .value.green { color:#16a34a; }

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

/* Responsive */
@media(max-width: 1024px){
  .page-header { flex-direction: column; align-items: stretch; }
}
</style>
