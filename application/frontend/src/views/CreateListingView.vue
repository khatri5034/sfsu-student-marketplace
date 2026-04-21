<template>
  <div class="create-page">
    <div class="create-layout">
      <div class="create-aside">
        <div class="aside-inner">
          <router-link to="/" class="logo-link">Gator Freighter</router-link>
          <h2>Post a Listing</h2>
          <p>Share what you're selling or trading with the SFSU community.</p>
          <ul class="aside-features">
            <li>📚 Reach SFSU students instantly</li>
            <li>📍 Set a safe campus meetup spot</li>
            <li>🔄 Offer items for sale, trade, or both</li>
          </ul>
        </div>
      </div>

      <div class="create-form-wrap">
        <div class="create-card">
          <div v-if="success" class="success-banner">
            ✅ Listing posted! Redirecting to your dashboard...
          </div>

          <h2>New Listing</h2>

          <form @submit.prevent="submitListing">
            <div class="form-group">
              <label>Title *</label>
              <input v-model="form.title" type="text" placeholder="e.g. CSC 648 Textbook, MacBook Charger..." required />
            </div>

            <div class="form-group">
              <label>Description *</label>
              <textarea v-model="form.description" rows="4" placeholder="Describe your item — condition, what's included, why you're selling..." required></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Listing Type *</label>
                <div class="radio-group">
                  <label class="radio-label" v-for="opt in typeOptions" :key="opt.value">
                    <input type="radio" v-model="form.listingType" :value="opt.value" />
                    {{ opt.label }}
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>Price ($) <span v-if="form.listingType === 'trade'" class="optional-note">— not required for trade</span></label>
                <input
                  v-model="form.price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  :disabled="form.listingType === 'trade'"
                  :required="form.listingType !== 'trade'"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Category *</label>
                <select v-model="form.category" required>
                  <option value="" disabled>Select a category...</option>
                  <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Condition *</label>
                <select v-model="form.condition" required>
                  <option value="" disabled>Select condition...</option>
                  <option v-for="c in conditions" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Related Course <span class="optional-note">— optional</span></label>
              <select v-model="form.course">
                <option value="">Not course-related</option>
                <option v-for="c in courses" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Campus Pickup Location *</label>
              <MeetupLocationPicker v-model="form.pickupLocationId" />
            </div>

            <div class="form-group">
              <label>Image <span class="optional-note">— optional (demo mode)</span></label>
              <div class="file-upload" @click="$refs.fileInput.click()">
                <div v-if="imagePreview" class="image-preview">
                  <img :src="imagePreview" alt="Preview" />
                </div>
                <div v-else class="file-upload-prompt">
                  <span class="upload-icon">📷</span>
                  <span>Click to upload an image</span>
                  <span class="file-hint">JPG, PNG up to 5MB</span>
                </div>
              </div>
              <input ref="fileInput" type="file" accept="image/*" class="hidden-input" @change="handleImage" />
            </div>

            <div v-if="error" class="error-msg">{{ error }}</div>

            <div class="form-actions">
              <router-link to="/dashboard" class="btn-secondary">Cancel</router-link>
              <button type="submit" class="btn-primary">Post Listing</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { listings, categories, courses } from '../data/mockData.js'
import MeetupLocationPicker from '../components/MeetupLocationPicker.vue'

export default {
  name: 'CreateListingView',
  components: { MeetupLocationPicker },
  data() {
    return {
      categories,
      courses,
      conditions: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
      typeOptions: [
        { value: 'sale', label: 'For Sale' },
        { value: 'trade', label: 'Trade Only' },
        { value: 'both', label: 'Sale or Trade' }
      ],
      form: {
        title: '',
        description: '',
        listingType: 'sale',
        price: '',
        category: '',
        condition: '',
        course: '',
        pickupLocationId: null
      },
      imagePreview: null,
      error: '',
      success: false
    }
  },
  methods: {
    handleImage(e) {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => { this.imagePreview = ev.target.result }
      reader.readAsDataURL(file)
    },
    submitListing() {
      if (!this.form.pickupLocationId) {
        this.error = 'Please select a campus pickup location.'
        return
      }
      this.error = ''

      const user = JSON.parse(localStorage.getItem('gf_user') || '{}')
      const newListing = {
        id: Date.now(),
        title: this.form.title,
        description: this.form.description,
        price: this.form.listingType === 'trade' ? 0 : parseFloat(this.form.price) || 0,
        category: this.form.category,
        course: this.form.course || null,
        condition: this.form.condition,
        listingType: this.form.listingType,
        pickupLocationId: this.form.pickupLocationId,
        image: this.imagePreview || null,
        sellerName: user.name || 'You',
        sellerEmail: user.email || '',
        createdAt: new Date().toISOString().split('T')[0]
      }

      listings.push(newListing)
      this.success = true
      setTimeout(() => this.$router.push('/dashboard'), 1500)
    }
  }
}
</script>

<style scoped>
.create-page { min-height: 100vh; background: #f8faff; }

.create-layout { display: grid; grid-template-columns: 380px 1fr; min-height: 100vh; }

.create-aside {
  background: linear-gradient(160deg, #4f46e5 0%, #312e81 100%);
  padding: 60px 48px;
  display: flex;
  align-items: flex-start;
}

.aside-inner { color: white; }

.logo-link {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: white;
  text-decoration: none;
  margin-bottom: 48px;
  opacity: 0.9;
}

.aside-inner h2 { font-size: 34px; font-weight: 800; margin-bottom: 14px; line-height: 1.2; }

.aside-inner p { font-size: 16px; opacity: 0.85; line-height: 1.6; margin-bottom: 36px; }

.aside-features { list-style: none; display: flex; flex-direction: column; gap: 14px; }

.aside-features li { font-size: 15px; opacity: 0.9; }

.create-form-wrap {
  padding: 60px 64px;
  display: flex;
  justify-content: center;
  overflow-y: auto;
}

.create-card { width: 100%; max-width: 600px; }

.create-card h2 { font-size: 28px; font-weight: 800; color: #111827; margin-bottom: 32px; }

.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 22px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.form-group label { font-size: 14px; font-weight: 700; color: #374151; }

.optional-note { font-weight: 400; color: #9ca3af; font-size: 13px; }

.form-group input,
.form-group select,
.form-group textarea {
  padding: 13px 14px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 15px;
  font-family: Arial, sans-serif;
  background: white;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { outline: none; border-color: #4f46e5; }

.form-group input:disabled { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }

.radio-group { display: flex; gap: 16px; flex-wrap: wrap; padding-top: 6px; }

.radio-label { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #374151; cursor: pointer; }

.file-upload {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.file-upload:hover { border-color: #4f46e5; background: #f5f3ff; }

.file-upload-prompt { display: flex; flex-direction: column; align-items: center; gap: 6px; color: #6b7280; }

.upload-icon { font-size: 32px; }

.file-hint { font-size: 12px; }

.image-preview { height: 160px; }

.image-preview img { height: 100%; max-width: 100%; object-fit: contain; border-radius: 8px; }

.hidden-input { display: none; }

.success-banner {
  background: #d1fae5;
  color: #065f46;
  border-radius: 12px;
  padding: 14px 18px;
  font-weight: 600;
  margin-bottom: 24px;
  font-size: 15px;
}

.error-msg {
  background: #fee2e2;
  color: #991b1b;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  margin-bottom: 16px;
}

.form-actions { display: flex; gap: 14px; justify-content: flex-end; margin-top: 8px; }

@media (max-width: 980px) {
  .create-layout { grid-template-columns: 1fr; }
  .create-aside { display: none; }
  .create-form-wrap { padding: 40px 24px; }
}

@media (max-width: 600px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
