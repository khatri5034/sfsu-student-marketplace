<template>
  <div class="page">
    <div class="content">
      <div class="header">
        <h1>Trade Offers</h1>
        <p class="subtitle">Manage incoming and outgoing trade requests.</p>
      </div>

      <div class="tabs">
        <button
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === 'incoming' }"
          @click="activeTab = 'incoming'"
        >
          Incoming <span class="tab-count">{{ incoming.length }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === 'outgoing' }"
          @click="activeTab = 'outgoing'"
        >
          Outgoing <span class="tab-count">{{ outgoing.length }}</span>
        </button>
      </div>

      <p v-if="loading" class="state-msg">Loading trades…</p>
      <p v-else-if="error" class="state-msg error">{{ error }}</p>
      <p v-else-if="activeList.length === 0" class="state-msg">
        No {{ activeTab }} trade offers.
      </p>

      <div v-else class="trade-list">
        <div class="trade-card" v-for="t in activeList" :key="t.id">
          <div class="trade-sides">
            <div class="trade-side">
              <img v-if="t.offered_item_image" :src="t.offered_item_image" class="trade-thumb" />
              <div v-else class="trade-thumb trade-thumb--empty">📦</div>
              <p class="trade-item-title">{{ t.offered_item_title }}</p>
              <p class="trade-role-label">Offered by {{ t.requester_name }}</p>
            </div>

            <div class="trade-center">
              <span class="trade-arrow">⇄</span>
              <span class="status-badge" :class="'status--' + t.status">{{ t.status }}</span>
            </div>

            <div class="trade-side">
              <img v-if="t.requested_item_image" :src="t.requested_item_image" class="trade-thumb" />
              <div v-else class="trade-thumb trade-thumb--empty">📦</div>
              <p class="trade-item-title">{{ t.requested_item_title }}</p>
              <p class="trade-role-label">Requested item</p>
            </div>
          </div>

          <div class="trade-actions">
            <router-link
              v-if="t.conversation_id"
              :to="'/messages?conversation=' + t.conversation_id"
              class="btn btn--secondary"
            >
              View Conversation
            </router-link>

            <template v-if="activeTab === 'incoming' && t.status === 'pending'">
              <button class="btn btn--accept" :disabled="busy[t.id]" @click="updateStatus(t.id, 'accepted')">
                Accept
              </button>
              <button class="btn btn--decline" :disabled="busy[t.id]" @click="updateStatus(t.id, 'declined')">
                Decline
              </button>
            </template>

            <button
              v-if="activeTab === 'outgoing' && t.status === 'pending'"
              class="btn btn--cancel"
              :disabled="busy[t.id]"
              @click="updateStatus(t.id, 'cancelled')"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiJson, getStoredUser } from '../api.js'

export default {
  name: 'TradesView',
  components: {},
  data() {
    return {
      trades: [],
      loading: true,
      error: '',
      activeTab: 'incoming',
      busy: {}
    }
  },
  computed: {
    userId() {
      return getStoredUser()?.id || null
    },
    incoming() {
      return this.trades.filter(t => Number(t.requested_item_seller_id) === Number(this.userId))
    },
    outgoing() {
      return this.trades.filter(t => Number(t.requester_id) === Number(this.userId))
    },
    activeList() {
      return this.activeTab === 'incoming' ? this.incoming : this.outgoing
    }
  },
  async mounted() {
    if (!this.userId) {
      this.$router.push({ path: '/login', query: { redirect: '/trades' } })
      return
    }
    await this.loadTrades()
  },
  methods: {
    async loadTrades() {
      this.loading = true
      this.error = ''
      try {
        const data = await apiJson(`/api/trade-requests?user_id=${this.userId}`)
        this.trades = data.trades || []
      } catch (e) {
        this.error = e.message || 'Failed to load trades.'
      } finally {
        this.loading = false
      }
    },
    async updateStatus(tradeId, status) {
      this.busy = { ...this.busy, [tradeId]: true }
      try {
        await apiJson(`/api/trade-requests/${tradeId}`, {
          method: 'PATCH',
          body: JSON.stringify({ user_id: this.userId, status })
        })
        await this.loadTrades()
      } catch (e) {
        this.error = e.message || 'Action failed.'
      } finally {
        this.busy = { ...this.busy, [tradeId]: false }
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f8faff;
  font-family: Arial, sans-serif;
}

.content {
  max-width: 860px;
  margin: 0 auto;
  padding: 36px 24px;
}

.header {
  margin-bottom: 28px;
}

.header h1 {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 6px 0;
}

.subtitle {
  color: #6b7280;
  margin: 0;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tab-btn {
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  font-weight: 700;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: border-color 0.15s, color 0.15s;
}

.tab-btn--active {
  border-color: #4f46e5;
  color: #4f46e5;
}

.tab-count {
  background: #f3f4f6;
  border-radius: 20px;
  padding: 1px 8px;
  font-size: 12px;
  color: #6b7280;
}

.tab-btn--active .tab-count {
  background: #eef2ff;
  color: #4f46e5;
}

.state-msg {
  color: #6b7280;
  text-align: center;
  padding: 48px 0;
}

.state-msg.error { color: #dc2626; }

.trade-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trade-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.trade-sides {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.trade-side {
  flex: 1;
  text-align: center;
}

.trade-thumb {
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  display: block;
  margin: 0 auto 8px;
}

.trade-thumb--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  font-size: 28px;
}

.trade-item-title {
  font-weight: 700;
  font-size: 14px;
  color: #111827;
  margin: 0 0 2px 0;
}

.trade-role-label {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.trade-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.trade-arrow {
  font-size: 28px;
  color: #4f46e5;
}

.status-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 10px;
  border-radius: 20px;
}

.status--pending  { background: #fef3c7; color: #92400e; }
.status--accepted { background: #d1fae5; color: #065f46; }
.status--declined { background: #fee2e2; color: #991b1b; }
.status--cancelled{ background: #f3f4f6; color: #6b7280; }

.trade-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  border-top: 1px solid #f3f4f6;
  padding-top: 14px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: opacity 0.15s;
}

.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn--secondary { background: #f3f4f6; color: #374151; }
.btn--accept    { background: #d1fae5; color: #065f46; }
.btn--decline   { background: #fee2e2; color: #991b1b; }
.btn--cancel    { background: #f3f4f6; color: #6b7280; }
</style>
