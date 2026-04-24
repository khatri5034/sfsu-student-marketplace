<template>
  <div class="home">
    <section class="hero">
      <div class="container">
        <p class="eyebrow">SFSU STUDENT MARKETPLACE</p>
        <h1>Move your campus buying<br />and selling forward.</h1>
        <p class="subtitle">
          Gator Freighter helps SFSU students buy, sell, and connect in one place.
          Find affordable items, post listings quickly, and trade within the campus community.
        </p>
        <div class="hero-actions">
          <router-link to="/search" class="btn-primary">Browse Listings</router-link>
          <router-link to="/register" class="btn-secondary">Get Started</router-link>
        </div>
      </div>
    </section>

    <section v-if="listings.length" class="featured">
      <div class="container">
        <h2 class="featured-title">Fresh listings</h2>
        <p class="featured-sub">Recently posted on Gator Freighter</p>
        <div class="listings-grid">
          <router-link
            v-for="listing in listings"
            :key="listing.id"
            :to="'/listing/' + listing.id"
            class="card-link"
          >
            <ListingCard :listing="listing" />
          </router-link>
        </div>
        <div class="featured-cta">
          <router-link to="/search" class="btn-primary">See all listings</router-link>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">🎓</div>
            <h3>Trusted SFSU Community</h3>
            <p>Only verified SFSU students can buy and sell, keeping the marketplace safe and local.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Fast Local Exchanges</h3>
            <p>Meet on campus, skip the shipping. Quick handoffs between students you can trust.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>Direct Messaging</h3>
            <p>Chat directly with buyers and sellers to negotiate and coordinate meetups.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ListingCard from '../components/ListingCard.vue'
import { apiJson, mapHomeRow } from '../api.js'

export default {
  name: 'HomeView',
  components: { ListingCard },
  data() {
    return { listings: [] }
  },
  async mounted() {
    try {
      const data = await apiJson('/api/items/home')
      this.listings = (data.items || []).map(mapHomeRow)
    } catch {
      this.listings = []
    }
  }
}
</script>

<style scoped>
.home { background: linear-gradient(135deg, #f8faff 0%, #eef2ff 100%); }

.hero { padding: 80px 0 60px; text-align: center; }

.eyebrow {
  color: #4f46e5;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1px;
  margin-bottom: 16px;
}

h1 { font-size: 64px; line-height: 1.05; color: #111827; margin-bottom: 20px; }

.subtitle {
  font-size: 18px;
  color: #4b5563;
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto 32px;
}

.hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

.featured { padding: 48px 0 24px; background: #f8faff; }

.featured-title { font-size: 32px; color: #111827; text-align: center; margin-bottom: 8px; }

.featured-sub { text-align: center; color: #6b7280; margin-bottom: 28px; }

.listings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.card-link { text-decoration: none; display: block; }

.featured-cta { text-align: center; margin-top: 32px; }

.features { padding: 60px 0 80px; background: white; }

.feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }

.feature-card {
  background: #f8faff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
}

.feature-icon { font-size: 36px; margin-bottom: 16px; }

.feature-card h3 { font-size: 18px; color: #111827; margin-bottom: 10px; }

.feature-card p { color: #6b7280; line-height: 1.6; font-size: 15px; }

@media (max-width: 768px) {
  h1 { font-size: 40px; }
  .feature-grid { grid-template-columns: 1fr; }
}
</style>