<template>
  <div class="listing-card">
    <div class="listing-image">
      <img v-if="listing.image" :src="listing.image" :alt="listing.title" />
      <div v-else class="image-placeholder">📦</div>
    </div>
    <div class="listing-body">
      <span class="listing-category">{{ listing.category }}</span>
      <h3 class="listing-title">{{ listing.title }}</h3>
      <div class="listing-meta">
        <span class="listing-price">${{ listing.price }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListingCard',
  props: {
    listing: { type: Object, required: true }
  }
}
</script>

<style scoped>
.listing-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
}

.listing-card:hover {
  box-shadow: 0 12px 32px rgba(79, 70, 229, 0.1);
  transform: translateY(-2px);
}

.listing-image {
  height: 160px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.listing-image img { width: 100%; height: 100%; object-fit: cover; }

.image-placeholder { font-size: 48px; }

.listing-body { padding: 16px; }

.listing-category {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #4f46e5;
}

.listing-title {
  font-size: 16px;
  color: #111827;
  margin: 6px 0 10px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.listing-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.listing-price { font-size: 18px; font-weight: 800; color: #111827; }

.listing-condition {
  font-size: 12px;
  background: #eef2ff;
  color: #4f46e5;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
}
</style>