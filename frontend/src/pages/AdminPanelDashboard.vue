<template>
  <div class="space">
    <div class="page-header">
      <div>
        <h2 class="page-title">Dashboard</h2>
      </div>
    </div>

    <!-- Main Dashboard Layout -->
    <div class="dashboard-layout">
      <!-- Left Sidebar - Stats & Type Breakdown -->
      <div class="dashboard-sidebar">
        <!-- Stats Cards -->
        <div class="card stat stat-primary">
          <div class="card-body">
            <div class="stat-header">
              <div class="stat-icon blue">
                <i class="fa-solid fa-car"></i>
              </div>
              <span class="stat-badge">Total</span>
            </div>
            <div class="value">{{ totals.cars || 0 }}</div>
            <p class="muted">Total Vehicles</p>
          </div>
        </div>

        <div class="card stat stat-info">
          <div class="card-body">
            <div class="stat-header">
              <div class="stat-icon purple">
                <i class="fa-solid fa-users"></i>
              </div>
              <span class="stat-badge info">Subscribers</span>
            </div>
            <div class="value">{{ subscribersCount || 0 }}</div>
            <p class="muted">Newsletter</p>
          </div>
        </div>

        <!-- Cars by Type -->
        <div class="card">
          <div class="card-body">
            <h2 class="card-title">Cars by Type</h2>
            <ul class="legend" v-if="Object.keys(byType).length">
              <li v-for="(count, label, idx) in byType" :key="label">
                <span class="dot" :class="getDotColor(idx)"></span>
                {{ label }} — {{ count }} ({{ percent(count, totals.cars) }}%)
              </li>
            </ul>
            <div class="empty-state" v-else>
              <i class="fa-solid fa-car"></i>
              <p>No vehicle data</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right - Recent Activity -->
      <div class="dashboard-main">
        <div class="card activity-card">
          <div class="card-body">
            <h2 class="card-title">Activity History</h2>
            
            <!-- Loading State -->
            <div class="activity-loading" v-if="activityLoading">
              <div class="loader"></div>
              <p>Loading activity...</p>
            </div>
            
            <!-- Activity List -->
            <div class="activity" v-else-if="recentActivity.length">
              <div class="row" v-for="(a,i) in recentActivity" :key="a.id || i">
                <div>
                  <p class="title">{{ a.action }}</p>
                  <p class="muted">{{ a.details }}</p>
                </div>
                <span class="time">{{ a.time }}</span>
              </div>
            </div>
            
            <!-- Empty State -->
            <div class="empty-state" v-else>
              <i class="fa-solid fa-clock"></i>
              <p>No activity yet</p>
            </div>
            
            <!-- Pagination -->
            <div class="activity-pagination" v-if="activityTotalPages > 1 && !activityLoading">
              <button
                class="btn btn-sm"
                :disabled="activityPage === 1"
                @click="emit('change-activity-page', activityPage - 1)"
              >
                <i class="fa-solid fa-chevron-left"></i>
                Previous
              </button>
              <div class="pagination-info">
                Page {{ activityPage }} of {{ activityTotalPages }}
              </div>
              <button
                class="btn btn-sm"
                :disabled="activityPage >= activityTotalPages"
                @click="emit('change-activity-page', activityPage + 1)"
              >
                Next
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  totals: { type: Object, required: true },
  byType: { type: Object, required: true },
  recentActivity: { type: Array, default: () => [] },
  subscribersCount: { type: Number, default: 0 },
  activityPage: { type: Number, default: 1 },
  activityTotalPages: { type: Number, default: 1 },
  activityLoading: { type: Boolean, default: false }
});

const emit = defineEmits(['change-activity-page']);

function percent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function getDotColor(index) {
  const colors = ['blue', 'green', 'amber', 'red', 'purple'];
  return colors[index % colors.length];
}
</script>

<style scoped>
/* Space & Grid */
.space { display:flex; flex-direction: column; gap: 1.25rem; }

/* Dashboard Layout */
.dashboard-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media(min-width: 1024px) {
  .dashboard-layout {
    flex-direction: row;
    align-items: flex-start;
  }
}

.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

@media(min-width: 1024px) {
  .dashboard-sidebar {
    width: 30%;
    flex-shrink: 0;
  }
}

.dashboard-main {
  flex: 1;
  min-width: 0;
}

.activity-card {
  height: 100%;
}

.activity-card .card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.activity-card .activity {
  flex: 1;
  overflow-y: auto;
  max-height: 600px;
}

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

/* Legends */
.pie-placeholder { height: 300px; border:1px dashed #cbd5e1; border-radius:.5rem; display:flex; align-items:center; justify-content:center; color:#64748b; background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #fff 10px, #fff 20px); }
.legend { display:flex; flex-direction:column; gap:.35rem; margin:0 0 .75rem; padding:0; list-style:none; color:#0f172a; }
.dot { display:inline-block; width:.6rem; height:.6rem; border-radius:999px; margin-right:.4rem; }
.dot.blue { background:#3b82f6; } .dot.green { background:#10b981; } .dot.amber { background:#f59e0b; } .dot.red { background:#ef4444; }
.dot.purple { background:#8b5cf6; }

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 0.5rem;
  color: #94a3b8;
  text-align: center;
}
.empty-state i {
  font-size: 2.5rem;
  color: #cbd5e1;
}
.empty-state p {
  margin: 0;
  font-size: 0.9375rem;
}

/* Activity list */
.activity { display:flex; flex-direction:column; gap:.75rem; margin-bottom: 1rem; }
.activity .row { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:.75rem; border-bottom:1px solid #e5e7eb; }
.activity .row:last-child { border-bottom:none; }
.activity .title { font-weight:600; margin:0 0 .15rem; color: #0f172a; }
.activity .muted { color:#6b7280; margin:0; font-size: 0.875rem; }
.activity .time { white-space:nowrap; color:#6b7280; font-size:.8rem; margin-left:1rem; }

/* Activity loading */
.activity-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
  color: #64748b;
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

/* Activity pagination */
.activity-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  gap: 0.75rem;
}

.activity-pagination .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fff;
  color: #475569;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.activity-pagination .btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #3b82f6;
  color: #3b82f6;
}

.activity-pagination .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.activity-pagination .pagination-info {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}
</style>
