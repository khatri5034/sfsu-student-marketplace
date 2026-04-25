<template>
  <div class="dashboard">
    <div class="container">
      <div class="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p class="welcome">Welcome back, <strong>{{ userName }}</strong></p>
        </div>
        <router-link to="/create-listing" class="btn-primary">+ Post a Listing</router-link>
      </div>

      <p v-if="loadError" class="load-error">{{ loadError }}</p>

      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-number">{{ myListings.length }}</span>
          <span class="stat-label">Active Listings</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">0</span>
          <span class="stat-label">Items Sold</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ conversations.length }}</span>
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
          <router-link to="/search" class="view-all">View all listings</router-link>
        </div>

        <div v-if="loading" class="empty-state"><p>Loading…</p></div>

        <div v-else-if="myListings.length" class="my-listings">
          <div v-for="listing in myListings" :key="listing.id" class="listing-row">
            <div class="listing-row-image">
              <span v-if="!listing.image">📦</span>
              <img v-else :src="listing.image" :alt="listing.title" />
            </div>
            <div class="listing-row-info">
              <p class="listing-row-title">{{ listing.title }}</p>
              <div class="listing-row-meta">
                <span class="meta-badge">{{ listing.condition }}</span>
                <span class="meta-badge meta-badge--price">
                  {{ listing.listingType === 'trade' ? 'Trade Only' : '$' + listing.price }}
                </span>
                <span class="meta-badge meta-badge--cat">{{ listing.category }}</span>
              </div>
            </div>
            <div class="listing-row-actions">
              <router-link :to="'/listing/' + listing.id" class="btn-icon">View</router-link>
              <button
                v-if="deleteConfirm !== listing.id"
                class="btn-icon btn-icon--danger"
                @click="deleteConfirm = listing.id"
              >Delete</button>
              <template v-else>
                <span class="confirm-text">Are you sure?</span>
                <button class="btn-icon btn-icon--danger" @click="deleteListing(listing.id)">Yes, delete</button>
                <button class="btn-icon" @click="deleteConfirm = null">Cancel</button>
              </template>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>📦 You haven't posted any listings yet.</p>
          <router-link to="/create-listing" class="btn-primary">Post Your First Listing</router-link>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-header">
          <h2>Recent Messages</h2>
          <router-link to="/messages" class="view-all">View all</router-link>
        </div>

        <div v-if="conversations.length" class="message-previews">
          <router-link
            v-for="conv in conversations"
            :key="conv.id"
            :to="'/messages?conversation=' + conv.id"
            class="message-preview"
          >
            <div class="preview-avatar">{{ (conv.partner_name || '?')[0] }}</div>
            <div class="preview-body">
              <p class="preview-name">{{ conv.partner_name }}</p>
              <p class="preview-listing">Re: {{ conv.item_title }}</p>
              <p class="preview-last">{{ conv.last_message_preview || '' }}</p>
            </div>
          </router-link>
        </div>

        <div v-else class="empty-state">
          <p>💬 No messages yet.</p>
          <router-link to="/search" class="btn-secondary">Browse and reach out to sellers</router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { apiJson, getStoredUser, mapSellerDashboardRow } from '../api.js'

export default {
  name: 'DashboardView',
  data() {
    return {
      user: getStoredUser(),
      myListings: [],
      conversations: [],
      deleteConfirm: null,
      loading: true,
      loadError: ''
    }
  },
  computed: {
    userName() {
      return this.user?.name || this.user?.email || 'Gator'
    },
    userId() {
      return this.user?.id
    }
  },
  async mounted() {
    if (!this.userId) {
      this.$router.push('/login')
      return
    }
    await this.refresh()
  },
  methods: {
    async refresh() {
      this.loading = true
      this.loadError = ''
      try {
        const [itemsRes, convRes] = await Promise.all([
          apiJson(`/api/items/by-seller/${this.userId}`),
          apiJson(`/api/messages/conversations?user_id=${this.userId}`)
        ])
        this.myListings = (itemsRes.items || []).map(mapSellerDashboardRow)
        this.conversations = convRes.conversations || []
      } catch (e) {
        this.loadError = e.message || 'Failed to load dashboard.'
      } finally {
        this.loading = false
      }
    },
    async deleteListing(id) {
      try {
        await apiJson(`/api/items/${id}?seller_id=${this.userId}`, { method: 'DELETE' })
        this.myListings = this.myListings.filter(l => l.id !== id)
        this.deleteConfirm = null
      } catch (e) {
        this.loadError = e.message || 'Delete failed.'
        this.deleteConfirm = null
      }
    }
  }
}
</script>

<style scoped>
.dashboard { padding: 40px 0 80px; background: #f8faff; }

.load-error { color: #dc2626; margin-bottom: 16px; }

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

.my-listings { display: flex; flex-direction: column; gap: 12px; }

.listing-row {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.listing-row-image {
  width: 56px;
  height: 56px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  overflow: hidden;
}

.listing-row-image img { width: 100%; height: 100%; object-fit: cover; }

.listing-row-info { flex: 1; min-width: 0; }

.listing-row-title { font-size: 15px; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.listing-row-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }

.meta-badge {
  font-size: 11px;
  font-weight: 700;
  background: #eef2ff;
  color: #4f46e5;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: capitalize;
}

.meta-badge--price { background: #d1fae5; color: #065f46; }

.meta-badge--cat { background: #fef3c7; color: #92400e; text-transform: capitalize; }

.listing-row-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.confirm-text { font-size: 13px; color: #dc2626; font-weight: 600; }

.btn-icon {
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  text-decoration: none;
  transition: background 0.2s;
}

.btn-icon:hover { background: #f3f4f6; }

.btn-icon--danger { color: #dc2626; border-color: #fca5a5; }

.btn-icon--danger:hover { background: #fee2e2; }

.empty-state { background: white; border: 1px dashed #d1d5db; border-radius: 16px; padding: 48px; text-align: center; color: #6b7280; display: flex; flex-direction: column; align-items: center; gap: 16px; }

.message-previews { display: flex; flex-direction: column; gap: 12px; }

.message-preview {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  transition: box-shadow 0.2s;
}

.message-preview:hover { box-shadow: 0 4px 16px rgba(79, 70, 229, 0.08); }

.preview-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #4f46e5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  flex-shrink: 0;
}

.preview-body { flex: 1; min-width: 0; }

.preview-name { font-size: 14px; font-weight: 700; color: #111827; }

.preview-listing { font-size: 12px; color: #4f46e5; margin: 2px 0; font-weight: 600; }

.preview-last { font-size: 13px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .dashboard-header { flex-direction: column; gap: 16px; }
  .listing-row { flex-wrap: wrap; }
  .listing-row-actions { width: 100%; justify-content: flex-end; }
}
</style>
