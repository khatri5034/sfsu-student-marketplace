<template>
  <div class="search-page">
    <div class="container">
      <div class="search-header">
        <h1>Browse Listings</h1>
        <div class="search-bar">
          <input v-model="query" type="text" placeholder="Search for textbooks, electronics, furniture..." @keyup.enter="runSearch" />
          <button class="btn-primary" @click="runSearch" :disabled="loading">{{ loading ? '…' : 'Search' }}</button>
        </div>
        <p v-if="loadError" class="load-error">{{ loadError }}</p>
      </div>

      <div class="search-layout">
        <aside class="filters">
          <h3>Filter By</h3>
          <div class="filter-group">
            <label>Category</label>
            <select v-model="filters.categoryId" @change="runSearch">
              <option value="">All Categories</option>
              <option v-for="cat in categories" :key="cat.id" :value="String(cat.id)">{{ cat.name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Course</label>
            <select v-model="filters.courseId" @change="runSearch">
              <option value="">All Courses</option>
              <option v-for="c in courses" :key="c.id" :value="String(c.id)">{{ c.course_code }} — {{ c.course_name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Sort By</label>
            <select v-model="filters.sortOrder" @change="runSearch">
              <option value="">Default</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="price_asc">Price: Low → High</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Max Price</label>
            <input v-model="filters.maxPrice" type="number" placeholder="No limit" min="0" step="0.01" @change="applyLocalFilters" />
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
import { apiJson, mapSearchHit } from '../api.js'

export default {
  name: 'SearchView',
  components: { ListingCard },
  data() {
    return {
      query: '',
      filters: { categoryId: '', courseId: '', maxPrice: '', sortOrder: '',},
      categories: [],
      courses: [],
      listings: [],
      categoryNameById: {},
      loading: false,
      loadError: ''
    }
  },
  computed: {
    filteredListings() {
      const max = this.filters.maxPrice === '' ? null : Number(this.filters.maxPrice)

      let result = this.listings

      if (max != null && !Number.isNaN(max)) {
        return this.listings.filter(l => l.price <= max)
      }
      if (this.filters.sortOrder === 'price_desc'){
        result = [...result].sort((a,b)=> b.price - a.price)
      } else if (this.filters.sortOrder === 'price_asc'){
        result = [...result].sort((a,b)=> a.price - b.price)
      }
      return result
    }
  },
  async mounted() {
    await this.loadMeta()
    await this.runSearch()
  },
  methods: {
    async loadMeta() {
      try {
        const [catRes, courseRes] = await Promise.all([
          apiJson('/api/meta/categories'),
          apiJson('/api/meta/courses')
        ])
        this.categories = catRes.categories || []
        this.courses = courseRes.courses || []
        const map = {}
        for (const c of this.categories) map[c.id] = c.name
        this.categoryNameById = map
      } catch (e) {
        this.loadError = e.message || 'Could not load filters.'
      }
    },
    buildQuery() {
      const p = new URLSearchParams()
      if (this.query.trim()) p.set('q', this.query.trim())
      if (this.filters.categoryId) p.set('category_id', this.filters.categoryId)
      if (this.filters.courseId) p.set('course_id', this.filters.courseId)
      const qs = p.toString()
      return qs ? `/api/items/search?${qs}` : '/api/items/search'
    },
    async runSearch() {
      this.loading = true
      this.loadError = ''
      try {
        const data = await apiJson(this.buildQuery())
        const hits = data.items || []
        this.listings = hits.map(h => mapSearchHit(h, this.categoryNameById))
      } catch (e) {
        this.loadError = e.message || 'Search failed.'
        this.listings = []
      } finally {
        this.loading = false
      }
    },
    applyLocalFilters() {
      /* max price is computed-only */
    },
    clearFilters() {
      this.query = ''
      this.filters = { categoryId: '', courseId: '', maxPrice: '' }
      this.runSearch()
    }
  }
}
</script>

<style scoped>
.search-page { padding: 40px 0 80px; background: #f8faff; }

.search-header { margin-bottom: 36px; }

.load-error { color: #dc2626; font-size: 14px; margin-top: 10px; }

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
