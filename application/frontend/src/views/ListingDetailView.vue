<template>
  <div class="detail-page">
    <div class="container">
      <router-link to="/search" class="back-link">← Back to Listings</router-link>

      <p v-if="loadError" class="load-error">{{ loadError }}</p>
      <p v-if="loading" class="loading">Loading…</p>

      <div v-if="listing && !loading" class="detail-layout">
        <div class="image-section">
          <div class="main-image">
            <img v-if="listing.image" :src="listing.image" :alt="listing.title" />
            <div v-else class="image-placeholder">📦</div>
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
            <span class="condition-badge">{{ listing.condition }}</span>
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
            <button class="btn-primary" :disabled="msgBusy" @click="messageSeller">{{ msgBusy ? '…' : '💬 Message Seller' }}</button>
            <button
              v-if="listing.listingType !== 'sale'"
              class="btn-secondary"
              @click="showTradeModal = true"
            >🔄 Offer Trade</button>
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
      loading: true,
      loadError: '',
      msgBusy: false
    }
  },
  computed: {
    sellerInitial() {
      const n = this.listing?.sellerName || '?'
      return n.trim().charAt(0).toUpperCase()
    },
    typeLabel() {
      const map = { sale: 'For Sale', trade: 'Trade Only', both: 'Sale or Trade' }
      return map[this.listing?.listingType] || ''
    },
    typeClass() {
      const map = { sale: 'badge--sale', trade: 'badge--trade', both: 'badge--both' }
      return map[this.listing?.listingType] || ''
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
    async fetchAll() {
      this.loading = true
      this.loadError = ''
      this.listing = null
      const id = Number.parseInt(this.$route.params.id, 10)
      if (!Number.isInteger(id)) {
        this.loading = false
        return
      }
      try {
        const [meta, detail] = await Promise.all([
          apiJson('/api/meta/pickup-locations'),
          apiJson(`/api/items/${id}`)
        ])
        this.pickupLocations = meta.pickup_locations || []
        this.listing = mapDetailToListing(detail.item, detail.images)
      } catch (e) {
        if (e.status === 404) this.listing = null
        else this.loadError = e.message || 'Failed to load listing.'
      } finally {
        this.loading = false
      }
    },
    async messageSeller() {
      const user = getStoredUser()
      if (!user?.id || !this.listing) return
      this.msgBusy = true
      try {
        const data = await apiJson('/api/conversations', {
          method: 'POST',
          body: JSON.stringify({ buyer_id: user.id, item_id: this.listing.id })
        })
        this.$router.push(`/messages?conversation=${data.conversation_id}`)
      } catch (e) {
        this.loadError = e.message || 'Could not start conversation.'
      } finally {
        this.msgBusy = false
      }
    }
  }
}
</script>

<style scoped>
.detail-page { padding: 40px 0 80px; background: #f8faff; min-height: 100vh; }

.load-error { color: #dc2626; margin-bottom: 16px; }
.loading { color: #6b7280; }

.back-link {
  display: inline-block;
  color: #4f46e5;
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 32px;
}

.back-link:hover { text-decoration: underline; }

.detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}

.image-section { position: sticky; top: 100px; }

.main-image {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.main-image img { width: 100%; height: 100%; object-fit: cover; }

.image-placeholder { font-size: 96px; }

.info-section { display: flex; flex-direction: column; gap: 24px; }

.badges { display: flex; flex-wrap: wrap; gap: 8px; }

.badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 5px 12px;
  border-radius: 20px;
}

.badge--category { background: #eef2ff; color: #4f46e5; }
.badge--course { background: #fef3c7; color: #92400e; }
.badge--sale { background: #d1fae5; color: #065f46; }
.badge--trade { background: #fce7f3; color: #9d174d; }
.badge--both { background: #e0e7ff; color: #3730a3; }

h1 { font-size: 32px; font-weight: 800; color: #111827; line-height: 1.25; }

.price-row { display: flex; align-items: center; gap: 16px; }

.price { font-size: 36px; font-weight: 800; color: #111827; }

.price--trade { font-size: 24px; color: #9d174d; }

.condition-badge {
  background: #eef2ff;
  color: #4f46e5;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}

.description h3,
.meetup-section h3 { font-size: 16px; color: #374151; margin-bottom: 10px; }

.description p { color: #4b5563; font-size: 15px; line-height: 1.7; }

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

.seller-name { font-size: 16px; font-weight: 700; color: #111827; }

.seller-since { font-size: 13px; color: #6b7280; margin-top: 2px; }

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

.auth-prompt p { color: #92400e; font-size: 14px; font-weight: 600; }

.actions { display: flex; gap: 14px; flex-wrap: wrap; }

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
  .detail-layout { grid-template-columns: 1fr; }
  .image-section { position: static; }
  .main-image { height: 240px; }
  h1 { font-size: 24px; }
  .price { font-size: 28px; }
}
</style>
