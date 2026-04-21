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
              <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Course</label>
            <select v-model="filters.course">
              <option value="">All Courses</option>
              <option v-for="c in courses" :key="c" :value="c">{{ c }}</option>
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
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <button class="btn-secondary" @click="clearFilters">Clear Filters</button>
        </aside>

        <div class="results">
          <p class="results-count">Showing {{ filteredListings.length }} listing{{ filteredListings.length !== 1 ? 's' : '' }}</p>
          <div v-if="filteredListings.length" class="listings-grid">
            <router-link
              v-for="listing in filteredListings"
              :key="listing.id"
              :to="'/listing/' + listing.id"
              class="card-link"
            >
              <ListingCard :listing="listing" />
            </router-link>
          </div>
          <div v-else class="no-results">
            <p>🔍 No listings match your filters.</p>
            <button class="btn-secondary" @click="clearFilters">Clear Filters</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ListingCard from '../components/ListingCard.vue'
import { listings, categories, courses } from '../data/mockData.js'

export default {
  name: 'SearchView',
  components: { ListingCard },
  data() {
    return {
      query: '',
      filters: { category: '', course: '', maxPrice: '', condition: '' },
      listings,
      categories,
      courses
    }
  },
  computed: {
    filteredListings() {
      return this.listings.filter(l => {
        if (this.query && !l.title.toLowerCase().includes(this.query.toLowerCase()) &&
            !l.description.toLowerCase().includes(this.query.toLowerCase())) return false
        if (this.filters.category && l.category !== this.filters.category) return false
        if (this.filters.course && l.course !== this.filters.course) return false
        if (this.filters.maxPrice && l.price > parseFloat(this.filters.maxPrice)) return false
        if (this.filters.condition && l.condition !== this.filters.condition) return false
        return true
      })
    }
  },
  methods: {
    handleSearch() {},
    clearFilters() {
      this.query = ''
      this.filters = { category: '', course: '', maxPrice: '', condition: '' }
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

.filters { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; position: sticky; top: 90px; }

.filters h3 { font-size: 16px; color: #111827; margin-bottom: 20px; }

.filter-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }

.filter-group label { font-size: 13px; font-weight: 700; color: #374151; }

.filter-group select,
.filter-group input { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 14px; background: white; }

.results-count { font-size: 14px; color: #6b7280; margin-bottom: 18px; }

.listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }

.card-link { text-decoration: none; display: block; }

.no-results {
  background: white;
  border: 1px dashed #d1d5db;
  border-radius: 16px;
  padding: 60px;
  text-align: center;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

@media (max-width: 768px) {
  .search-layout { grid-template-columns: 1fr; }
  .filters { position: static; }
}
</style>
