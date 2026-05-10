<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="modal-close" @click="$emit('close')">✕</button>
      <h2>Offer a Trade</h2>
      <p class="modal-subtitle">For: <strong>{{ listing.title }}</strong></p>

      <div v-if="submitted" class="success-state">
        <div class="success-icon">✅</div>
        <h3>Trade request sent!</h3>
        <p>The seller will be notified. You can discuss details in your conversation.</p>
        <div class="success-actions">
          <router-link
            v-if="lastConversationId"
            :to="'/messages?conversation=' + lastConversationId"
            class="btn-primary"
            @click="$emit('close')"
          >
            View Conversation
          </router-link>
          <button class="btn-secondary" @click="$emit('close')">Done</button>
        </div>
      </div>

      <form v-else @submit.prevent="submit">
        <div class="form-group">
          <label>Which of your listings are you offering?</label>

          <p v-if="loadingListings" class="hint">Loading your listings…</p>

          <p v-else-if="myListings.length === 0" class="hint">
            You have no active listings to offer.
            <router-link to="/create-listing" @click="$emit('close')">Create a listing first.</router-link>
          </p>

          <select v-else v-model="selectedOfferedItemId" required>
            <option :value="null" disabled>Select one of your listings…</option>
            <option v-for="item in myListings" :key="item.id" :value="item.id">
              {{ item.title }}
            </option>
          </select>
        </div>

        <p v-if="error" class="modal-error">{{ error }}</p>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="$emit('close')">Cancel</button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="!selectedOfferedItemId || loading || myListings.length === 0"
          >
            {{ loading ? 'Sending…' : 'Send Trade Request' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { apiJson, getStoredUser } from '../api.js'

export default {
  name: 'TradeRequestModal',
  emits: ['close', 'trade-sent'],
  props: {
    listing: { type: Object, required: true }
  },
  data() {
    return {
      myListings: [],
      selectedOfferedItemId: null,
      userId: null,
      loadingListings: true,
      loading: false,
      error: '',
      submitted: false,
      lastConversationId: null
    }
  },
  async mounted() {
    const user = getStoredUser()
    if (!user?.id) return
    this.userId = user.id
    try {
      const data = await apiJson(`/api/items/by-seller/${user.id}`)
      this.myListings = (data.items || []).filter(
        i => i.status !== 'removed' && i.approval_status === 'approved' && i.id !== this.listing.id
      )
    } catch {
      // non-critical — select will just be empty
    } finally {
      this.loadingListings = false
    }
  },
  methods: {
    async submit() {
      this.loading = true
      this.error = ''
      try {
        const data = await apiJson('/api/trade-requests', {
          method: 'POST',
          body: JSON.stringify({
            requester_id: this.userId,
            requested_item_id: this.listing.id,
            offered_item_id: this.selectedOfferedItemId
          })
        })
        this.lastConversationId = data.conversation_id
        this.submitted = true
        this.$emit('trade-sent', { conversation_id: data.conversation_id })
      } catch (e) {
        this.error = e.message || 'Failed to send trade request.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 520px;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 20px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
}

.modal-close:hover { color: #111827; }

h2 { font-size: 24px; color: #111827; margin-bottom: 6px; }

.modal-subtitle { color: #6b7280; font-size: 15px; margin-bottom: 28px; }

.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }

.form-group label { font-size: 14px; font-weight: 700; color: #374151; }

.form-group select {
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 15px;
  font-family: Arial, sans-serif;
  background: white;
  cursor: pointer;
}

.form-group select:focus { outline: none; border-color: #4f46e5; }

.hint {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.hint a { color: #4f46e5; font-weight: 700; text-decoration: none; }

.modal-error { color: #dc2626; font-size: 14px; margin: 0 0 16px 0; }

.modal-actions { display: flex; gap: 12px; justify-content: flex-end; }

.success-state {
  text-align: center;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.success-icon { font-size: 48px; }

.success-state h3 { font-size: 20px; color: #111827; margin: 0; }

.success-state p { color: #6b7280; font-size: 15px; margin: 0; }

.success-actions { display: flex; gap: 10px; }

.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(90deg, #4f46e5 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.btn-secondary {
  padding: 10px 20px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
