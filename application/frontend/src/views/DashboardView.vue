<template>
  <div class="dashboard">
    <div class="container">
      <div class="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p class="welcome">Welcome back, <strong>Gator</strong></p>
        </div>
        <router-link to="/search" class="btn-primary">+ Post a Listing</router-link>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-number">0</span>
          <span class="stat-label">Active Listings</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">0</span>
          <span class="stat-label">Items Sold</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">0</span>
          <span class="stat-label">Messages</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">0</span>
          <span class="stat-label">Saved Items</span>
        </div>
      </div>

      <section class="dashboard-section">
        <div class="section-header">
          <h2>My Listings</h2>
          <router-link to="/search" class="view-all">View all</router-link>
        </div>
        <div class="empty-state">
          <p>📦 You haven't posted any listings yet.</p>
          <router-link to="/search" class="btn-primary">Post Your First Listing</router-link>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-header">
          <h2>Recent Messages</h2>
          <router-link to="/messages" class="view-all">View all</router-link>
        </div>
        <div class="empty-state">
          <p>💬 No messages yet.</p>
          <router-link to="/search" class="btn-secondary">Browse and reach out to sellers</router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default { name: 'DashboardView' }
</script>

<style scoped>
.dashboard { padding: 40px 0 80px; background: #f8faff; }

.dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; }

h1 { font-size: 40px; color: #111827; margin-bottom: 6px; }

.welcome { color: #6b7280; font-size: 16px; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }

.stat-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 6px; }

.stat-number { font-size: 36px; font-weight: 800; color: #4f46e5; }

.stat-label { font-size: 13px; color: #6b7280; font-weight: 600; }

.dashboard-section { margin-bottom: 48px; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }

h2 { font-size: 24px; color: #111827; }

.view-all { color: #4f46e5; font-weight: 700; text-decoration: none; font-size: 14px; }

.empty-state { background: white; border: 1px dashed #d1d5db; border-radius: 16px; padding: 48px; text-align: center; color: #6b7280; display: flex; flex-direction: column; align-items: center; gap: 16px; }

@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .dashboard-header { flex-direction: column; gap: 16px; }
}
</style>