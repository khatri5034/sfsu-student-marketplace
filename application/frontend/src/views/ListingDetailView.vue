<template>
  <div class="detail-page">
    <div class="container">
      <router-link to="/search" class="back-link">← Back to Listings</router-link>

      <p v-if="loadError" class="load-error">{{ loadError }}</p>
      <p v-if="loading" class="loading">Loading…</p>

      <div v-if="listing && !loading" class="detail-layout">
        <p v-if="listing.approvalStatus && listing.approvalStatus !== 'approved'" class="approval-banner">
          This listing is {{ approvalStatusLabel }}. Only you can see it until it is approved.
        </p>

        <div class="image-section">
          <div class="main-image">
            <img v-if="currentImageSrc" :src="currentImageSrc" :alt="listing.title" />
            <div v-else class="image-placeholder">📦</div>

            <button
              v-if="canNavigateImages"
              class="gallery-nav gallery-nav--prev"
              type="button"
              @click="goToPrevImage"
              aria-label="Previous image"
            >
              ‹
            </button>

            <button
              v-if="canNavigateImages"
              class="gallery-nav gallery-nav--next"
              type="button"
              @click="goToNextImage"
              aria-label="Next image"
            >
              ›
            </button>
          </div>

          <div v-if="imageList.length > 1" class="thumbnail-row">
            <button
              v-for="(img, idx) in imageList"
              :key="`${img}-${idx}`"
              type="button"
              class="thumbnail-btn"
              :class="{ 'thumbnail-btn--active': idx === currentImageIndex }"
              @click="setCurrentImage(idx)"
            >
              <img :src="img" :alt="`Listing image ${idx + 1}`" />
            </button>
          </div>
        </div>

        <div class="info-section">
          <div class="badges">
            <span class="badge badge--category">{{ listing.categoryLabel }}</span>
            <span class="badge" :class="typeClass">{{ typeLabel }}</span>
            <span v-if="listing.course" class="badge badge--course">{{ listing.course }}</span>
          </div>

          <h1>{{ listing.title }}</h1>

          <div class="price-row">
            <span v-if="listing.listingType !== 'trade'" class="price">${{ listing.price }}</span>
            <span v-else class="price price--trade">Trade Only</span>
          </div>

          <div class="description">
            <h3>Description</h3>
            <p>{{ listing.description }}</p>
          </div>

          <div class="meetup-section">
            <h3>Pickup Location</h3>
            <MeetupLocationPicker
              :modelValue="listing.pickupLocationId"
              :readonly="true"
              :locations="pickupLocations"
            />
          </div>

          <div class="seller-card">
            <div class="seller-avatar">{{ sellerInitial }}</div>
            <div class="seller-info">
              <p class="seller-name">{{ listing.sellerName }}</p>
              <p class="seller-since">{{ listing.sellerEmail }}</p>
            </div>
          </div>

          <div v-if="!loggedIn" class="auth-prompt">
            <p>Log in with your SFSU email to contact this seller.</p>
            <router-link to="/login" class="btn-primary">Log in to Message</router-link>
          </div>

          <div v-else class="actions">
            <button
              class="btn-primary"
              :disabled="msgBusy || !listing.publicApproved"
              @click="openInlineMessages"
            >
              {{ msgBusy ? '…' : '💬 Message Seller' }}
            </button>

            <button
              v-if="listing.listingType !== 'sale' && listing.publicApproved"
              class="btn-secondary"
              @click="showTradeModal = true"
            >
              🔄 Offer Trade
            </button>
          </div>

          <div v-if="showInlineMessages" class="inline-messages">
            <div class="inline-header">
              <h3>Message Seller</h3>
              <button type="button" class="close-inline" @click="showInlineMessages = false">×</button>
            </div>

            <p v-if="messageError" class="message-error">{{ messageError }}</p>

            <div class="inline-thread">
              <div v-if="messageLoading" class="empty-message">Loading messages…</div>

              <div v-else-if="threadMessages.length">
                <div
                  v-for="msg in threadMessages"
                  :key="msg.id"
                  class="inline-bubble"
                  :class="msg.sender === 'me' ? 'inline-bubble--me' : 'inline-bubble--them'"
                >
                  <p>{{ msg.body }}</p>
                  <span>{{ msg.time }}</span>
                </div>
              </div>

              <div v-else class="empty-message">
                No messages yet. Start the conversation.
              </div>
            </div>

            <div class="inline-reply">
              <input
                v-model="replyText"
                type="text"
                placeholder="Type your message..."
                @keyup.enter="sendInlineMessage"
              />

              <button
                class="btn-primary"
                :disabled="!replyText.trim() || sendBusy"
                @click="sendInlineMessage"
              >
                {{ sendBusy ? 'Sending…' : 'Send' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!loading && !loadError" class="not-found">
        <p>Listing not found.</p>
        <router-link to="/search" class="btn-primary">Back to Search</router-link>
      </div>
    </div>

    <TradeRequestModal
      v-if="showTradeModal && listing"
      :listing="listing"
      @close="showTradeModal = false"
      @trade-sent="onTradeSent"
    />
  </div>
</template>

<script>
import MeetupLocationPicker from '../components/MeetupLocationPicker.vue'
import TradeRequestModal from '../components/TradeRequestModal.vue'
import { apiJson, mapDetailToListing, getStoredUser } from '../api.js'

export default {
  name: 'ListingDetailView',
  components: { MeetupLocationPicker, TradeRequestModal },
  data() {
    return {
      showTradeModal: false,
      loggedIn: !!localStorage.getItem('gf_user'),
      pickupLocations: [],
      listing: null,
      currentImageIndex: 0,
      loading: true,
      loadError: '',
      msgBusy: false,

      showInlineMessages: false,
      conversationId: null,
      threadMessages: [],
      replyText: '',
      messageLoading: false,
      sendBusy: false,
      messageError: ''
    }
  },
  computed: {
    sellerInitial() {
      const n = this.listing?.sellerName || '?'
      return n.trim().charAt(0).toUpperCase()
    },
    approvalStatusLabel() {
      return this.listing?.approvalStatus || 'pending'
    },
    typeLabel() {
      const map = { sale: 'For Sale', trade: 'Trade Only', both: 'Sale or Trade' }
      return map[this.listing?.listingType] || ''
    },
    typeClass() {
      const map = { sale: 'badge--sale', trade: 'badge--trade', both: 'badge--both' }
      return map[this.listing?.listingType] || ''
    },
    imageList() {
      const images = this.listing?.images
      return Array.isArray(images) ? images.filter(Boolean) : []
    },
    currentImageSrc() {
      if (!this.imageList.length) return this.listing?.image || null
      return this.imageList[this.currentImageIndex] || this.imageList[0]
    },
    canNavigateImages() {
      return this.imageList.length > 1
    }
  },
  watch: {
    '$route.params.id'() {
      this.fetchAll()
    }
  },
  mounted() {
    this.loggedIn = !!localStorage.getItem('gf_user')
    this.fetchAll()
  },
  methods: {
    onTradeSent({ conversation_id }) {
      this.showTradeModal = false
      this.$router.push({ path: '/messages', query: { conversation: String(conversation_id) } })
    },
    async fetchAll() {
      this.loading = true
      this.loadError = ''
      this.listing = null
      this.showInlineMessages = false
      this.conversationId = null
      this.threadMessages = []
      this.replyText = ''
      this.messageError = ''

      const id = Number.parseInt(this.$route.params.id, 10)

      if (!Number.isInteger(id)) {
        this.loading = false
        return
      }

      try {
        const user = getStoredUser()
        const viewerQs = user?.id ? `?viewer_id=${encodeURIComponent(user.id)}` : ''

        const [meta, detail] = await Promise.all([
          apiJson('/api/meta/pickup-locations'),
          apiJson(`/api/items/${id}${viewerQs}`)
        ])

        this.pickupLocations = meta.pickup_locations || []
        this.listing = mapDetailToListing(detail.item, detail.images)
        this.currentImageIndex = 0
      } catch (e) {
        if (e.status === 404) this.listing = null
        else this.loadError = e.message || 'Failed to load listing.'
      } finally {
        this.loading = false
      }
    },

    mapThreadMessages(rows, currentUserId) {
      return (rows || []).map(m => ({
        id: m.id,
        sender: Number(m.sender_id) === Number(currentUserId) ? 'me' : 'them',
        body: m.body,
        time: m.created_at
          ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : ''
      }))
    },

    async openInlineMessages() {
      const user = getStoredUser()

      if (!user?.id || !this.listing) return

      this.msgBusy = true
      this.messageError = ''
      this.showInlineMessages = true

      try {
        const data = await apiJson('/api/conversations', {
          method: 'POST',
          body: JSON.stringify({
            buyer_id: user.id,
            item_id: this.listing.id
          })
        })

        this.conversationId = data.conversation_id
        await this.loadInlineThread()
      } catch (e) {
        this.messageError = e.message || 'Could not open conversation.'
      } finally {
        this.msgBusy = false
      }
    },

    async loadInlineThread() {
      const user = getStoredUser()

      if (!user?.id || !this.conversationId) return

      this.messageLoading = true
      this.messageError = ''

      try {
        const data = await apiJson(
          `/api/messages/conversations/${this.conversationId}?user_id=${user.id}`
        )

        this.threadMessages = this.mapThreadMessages(data.messages, user.id)
      } catch (e) {
        this.messageError = e.message || 'Failed to load messages.'
      } finally {
        this.messageLoading = false
      }
    },

    async sendInlineMessage() {
      const text = this.replyText.trim()
      const user = getStoredUser()

      if (!text || !user?.id || !this.conversationId) return

      this.sendBusy = true
      this.messageError = ''

      try {
        await apiJson(`/api/messages/conversations/${this.conversationId}/messages`, {
          method: 'POST',
          body: JSON.stringify({
            user_id: user.id,
            body: text
          })
        })

        this.replyText = ''
        await this.loadInlineThread()
      } catch (e) {
        this.messageError = e.message || 'Send failed.'
      } finally {
        this.sendBusy = false
      }
    },

    setCurrentImage(index) {
      if (!Number.isInteger(index)) return
      if (index < 0 || index >= this.imageList.length) return
      this.currentImageIndex = index
    },

    goToPrevImage() {
      if (!this.imageList.length) return
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.imageList.length) % this.imageList.length
    },

    goToNextImage() {
      if (!this.imageList.length) return
      this.currentImageIndex = (this.currentImageIndex + 1) % this.imageList.length
    }
  }
}
</script>

<style scoped>
.detail-page {
  padding: 40px 0 80px;
  background: #f8faff;
  min-height: 100vh;
}

.load-error {
  color: #dc2626;
  margin-bottom: 16px;
}

.loading {
  color: #6b7280;
}

.back-link {
  display: block;
  color: #4f46e5;
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 32px;
  text-align: left;
}

.back-link:hover {
  text-decoration: underline;
}

.detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}

.approval-banner {
  grid-column: 1 / -1;
  background: #fef3c7;
  color: #92400e;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  border: 1px solid #fcd34d;
}

.image-section {
  position: sticky;
  top: 100px;
}

.main-image {
  position: relative;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  font-size: 96px;
}

.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.65);
  color: #fff;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-nav--prev {
  left: 12px;
}

.gallery-nav--next {
  right: 12px;
}

.thumbnail-row {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  overflow-x: auto;
}

.thumbnail-btn {
  width: 68px;
  height: 68px;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  background: #fff;
}

.thumbnail-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-btn--active {
  border-color: #4f46e5;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 5px 12px;
  border-radius: 20px;
}

.badge--category {
  background: #eef2ff;
  color: #4f46e5;
}

.badge--course {
  background: #fef3c7;
  color: #92400e;
}

.badge--sale {
  background: #d1fae5;
  color: #065f46;
}

.badge--trade {
  background: #fce7f3;
  color: #9d174d;
}

.badge--both {
  background: #e0e7ff;
  color: #3730a3;
}

h1 {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  line-height: 1.25;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.price {
  font-size: 36px;
  font-weight: 800;
  color: #111827;
}

.price--trade {
  font-size: 24px;
  color: #9d174d;
}

.condition-badge {
  background: #eef2ff;
  color: #4f46e5;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}

.description h3,
.meetup-section h3 {
  font-size: 16px;
  color: #374151;
  margin-bottom: 10px;
}

.description p {
  color: #4b5563;
  font-size: 15px;
  line-height: 1.7;
}

.seller-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 18px 20px;
}

.seller-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #4f46e5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  flex-shrink: 0;
}

.seller-name {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.seller-since {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
}

.auth-prompt {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.auth-prompt p {
  color: #92400e;
  font-size: 14px;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.inline-messages {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.inline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inline-header h3 {
  font-size: 16px;
  color: #111827;
}

.close-inline {
  border: none;
  background: #f3f4f6;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
}

.inline-thread {
  min-height: 120px;
  max-height: 260px;
  overflow-y: auto;
  background: #f8faff;
  border-radius: 12px;
  padding: 14px;
}

.inline-bubble {
  max-width: 78%;
  padding: 10px 12px;
  border-radius: 14px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.inline-bubble p {
  font-size: 14px;
  line-height: 1.45;
}

.inline-bubble span {
  font-size: 11px;
  opacity: 0.65;
  align-self: flex-end;
}

.inline-bubble--me {
  margin-left: auto;
  background: #4f46e5;
  color: white;
}

.inline-bubble--them {
  margin-right: auto;
  background: #e5e7eb;
  color: #111827;
}

.inline-reply {
  display: flex;
  gap: 10px;
}

.inline-reply input {
  flex: 1;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
}

.inline-reply input:focus {
  outline: none;
  border-color: #4f46e5;
}

.message-error {
  color: #dc2626;
  font-size: 14px;
}

.empty-message {
  color: #6b7280;
  font-size: 14px;
  text-align: center;
  padding: 28px 0;
}

.not-found {
  text-align: center;
  padding: 80px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .image-section {
    position: static;
  }

  .main-image {
    height: 240px;
  }

  h1 {
    font-size: 24px;
  }

  .price {
    font-size: 28px;
  }

  .inline-reply {
    flex-direction: column;
  }
}
</style>
