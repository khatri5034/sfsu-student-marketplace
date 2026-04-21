<template>
  <div class="search-page">
    <div class="container">
      <div class="search-header">
        <h1>Browse Listings</h1>
        <div class="search-bar">
          <input v-model="query" type="text" placeholder="Search for textbooks, electronics, furniture..." @keyup.enter="handleSearch" />
          <button class="btn-primary" @click="handleSearch">Search</button>
        </div>
      </div>

      <div class="search-layout">
        <aside class="filters">
          <h3>Filter By</h3>
          <div class="filter-group">
            <label>Category</label>
            <select v-model="filters.category">
              <option value="">All Categories</option>
              <option value="textbooks">Textbooks</option>
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="clothing">Clothing</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Max Price</label>
            <input v-model="filters.maxPrice" type="number" placeholder="$0.00" />
          </div>
          <div class="filter-group">
            <label>Condition</label>
            <select v-model="filters.condition">
              <option value="">Any Condition</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>
          <button class="btn-secondary" @click="clearFilters">Clear Filters</button>
        </aside>

        <div class="results">
          <p class="results-count">Showing {{ mockListings.length }} listings</p>
          <div class="listings-grid">
            <ListingCard v-for="listing in mockListings" :key="listing.id" :listing="listing" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ListingCard from '../components/ListingCard.vue'

export default {
  name: 'SearchView',
  components: { ListingCard },
  data() {
    return {
      query: '',
      filters: { category: '', maxPrice: '', condition: '' },
      mockListings: [
        { id: 1, title: 'CSC 648 Textbook', price: 45, condition: 'Good', category: 'Textbooks', image: null },
        { id: 2, title: 'Desk Lamp', price: 15, condition: 'Like New', category: 'Furniture', image: null },
        { id: 3, title: 'MacBook Charger', price: 20, condition: 'Good', category: 'Electronics', image: null },
        { id: 4, title: 'SFSU Hoodie (M)', price: 30, condition: 'New', category: 'Clothing', image: null },
      ]
    }
  },
  methods: {
    handleSearch() {
      console.log('Searching:', this.query, this.filters)
    },
    clearFilters() {
      this.filters = { category: '', maxPrice: '', condition: '' }
    }
  }
}
</script>

<style scoped>
.search-page { padding: 40px 0 80px; background: #f8faff; }

.search-header { margin-bottom: 36px; }

h1 { font-size: 40px; color: #111827; margin-bottom: 18px; }

.search-bar { display: flex; gap: 12px; }

.search-bar input { flex: 1; padding: 14px 18px; border: 1px solid #d1d5db; border-radius: 12px; font-size: 15px; }

.search-bar input:focus { outline: none; border-color: #4f46e5; }

.search-layout { display: grid; grid-template-columns: 240px 1fr; gap: 32px; align-items: start; }

.filters { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; }

.filters h3 { font-size: 16px; color: #111827; margin-bottom: 20px; }

.filter-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }

.filter-group label { font-size: 13px; font-weight: 700; color: #374151; }

.filter-group select,
.filter-group input { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 14px; }

.results-count { font-size: 14px; color: #6b7280; margin-bottom: 18px; }

.listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }

@media (max-width: 768px) {
  .search-layout { grid-template-columns: 1fr; }
}
</style>