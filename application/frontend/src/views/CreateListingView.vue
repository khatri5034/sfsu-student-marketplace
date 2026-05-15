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
            ✅ Listing saved. It stays private until approved — redirecting to your dashboard…
          </div>

          <h2>New Listing</h2>

          <form @submit.prevent="submitListing">
            <div class="form-group">
              <label>Title <span class="asterisk">*</span></label>
              <input v-model="form.title" type="text" placeholder="e.g. CSC 648 Textbook, MacBook Charger..." required />
            </div>

            <div class="form-group">
              <label>Description <span class="asterisk">*</span></label>
              <textarea v-model="form.description" rows="4" placeholder="Describe your item — condition, what's included, why you're selling..." required></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Listing Type <span class="asterisk">*</span></label>
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
                <label>Category <span class="asterisk">*</span></label>
                <select v-model="form.categoryId" required>
                  <option value="" disabled>Select a category...</option>
                  <option v-for="cat in categories" :key="cat.id" :value="String(cat.id)">{{ cat.name }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Related Course <span class="optional-note">— optional</span></label>
              <select v-model="form.courseId">
                <option value="">Not course-related</option>
                <option v-for="c in courses" :key="c.id" :value="String(c.id)">{{ c.course_code }} — {{ c.course_name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Campus Pickup Location <span class="optional-note">— optional</span></label>
              <MeetupLocationPicker v-model="form.pickupLocationId" :locations="pickupLocations" />
            </div>

            <div class="form-group form-group-images">
              <label>Images <span class="optional-note">— optional, up to 5</span></label>
              <div class="image-picker-head">
                <button
                  type="button"
                  class="btn-browse"
                  @click.prevent="$refs.fileInput.click()"
                >
                  Browse…
                </button>
                <span class="image-upload-status" aria-live="polite">{{
                  imageUploadNote || 'No images selected (optional, max 5).'
                }}</span>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden-input"
                tabindex="-1"
                multiple
                @change="handleImage"
              />
              <div class="file-upload" @click="$refs.fileInput.click()">
                <div v-if="imagePreviews.length" class="image-preview-grid">
                  <div
                    v-for="(preview, index) in imagePreviews"
                    :key="`${preview}-${index}`"
                    class="image-preview"
                  >
                    <button
                      type="button"
                      class="remove-image-btn"
                      aria-label="Remove image"
                      @click.stop.prevent="removeImage(index)"
                    />
                    <img :src="preview" :alt="`Preview ${index + 1}`" />
                  </div>
                </div>
                <div v-else class="file-upload-prompt">
                  <span class="upload-icon">📷</span>
                  <span>Click to upload images</span>
                  <span class="file-hint">JPG, PNG up to 5MB each (max 5)</span>
                </div>
              </div>
            </div>

            <div v-if="error" class="error-msg">{{ error }}</div>

            <div class="form-actions">
              <router-link to="/dashboard" class="btn-secondary">Cancel</router-link>
              <button type="submit" class="btn-primary" :disabled="submitting">{{ submitting ? '…' : 'Post Listing' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MeetupLocationPicker from '../components/MeetupLocationPicker.vue'
import { apiJson, getStoredUser } from '../api.js'

export default {
  name: 'CreateListingView',
  components: { MeetupLocationPicker },
  data() {
    return {
      categories: [],
      courses: [],
      pickupLocations: [],
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
        categoryId: '',
        courseId: '',
        pickupLocationId: null
      },
      imageFiles: [],
      imagePreviews: [],
      imageUploadNote: '',
      error: '',
      success: false,
      submitting: false
    }
  },
  async mounted() {
    const user = getStoredUser()
    if (!user?.id) {
      this.$router.push('/login')
      return
    }
    try {
      const [catRes, courseRes, locRes] = await Promise.all([
        apiJson('/api/meta/categories'),
        apiJson('/api/meta/courses'),
        apiJson('/api/meta/pickup-locations')
      ])
      this.categories = catRes.categories || []
      this.courses = courseRes.courses || []
      this.pickupLocations = locRes.pickup_locations || []
    } catch (e) {
      this.error = e.message || 'Could not load form data.'
    }
  },
  methods: {
    async handleImage(e) {
      const selectedFiles = Array.from(e.target.files || [])
      if (!selectedFiles.length) return

      const limitedFiles = selectedFiles.slice(0, 5)
      const attached = limitedFiles.length

      this.imageFiles = limitedFiles
      this.imagePreviews = await Promise.all(
        limitedFiles.map(
          file =>
            new Promise(resolve => {
              const reader = new FileReader()
              reader.onload = ev => resolve(ev.target?.result || '')
              reader.readAsDataURL(file)
            })
        )
      )

      this.imageUploadNote = `${attached} image${attached === 1 ? '' : 's'} attached.`

      e.target.value = ''
    },
    removeImage(index) {
      if (!Number.isInteger(index) || index < 0 || index >= this.imageFiles.length) return
      this.imageFiles.splice(index, 1)
      this.imagePreviews.splice(index, 1)
      const n = this.imageFiles.length
      this.imageUploadNote = n ? `${n} image${n === 1 ? '' : 's'} attached.` : ''
    },
    async submitListing() {
      const user = getStoredUser()
      if (!user?.id) {
        this.$router.push('/login')
        return
      }

      this.error = ''
      this.submitting = true
      try {
        const body = {
          seller_id: user.id,
          title: this.form.title.trim(),
          description: this.form.description.trim(),
          listing_type: this.form.listingType,
          category_id: this.form.categoryId ? Number.parseInt(this.form.categoryId, 10) : null,
          course_id: this.form.courseId ? Number.parseInt(this.form.courseId, 10) : null,
          pickup_location_id: this.form.pickupLocationId
        }
        if (this.form.listingType !== 'trade') {
          body.price = this.form.price === '' ? 0 : Number(this.form.price)
        }

        let created
        try {
          created = await apiJson('/api/items', {
            method: 'POST',
            body: JSON.stringify(body)
          })
        } catch (e) {
          this.error = e.message || 'Could not create listing.'
          return
        }

        if (this.imageFiles.length) {
          const fd = new FormData()
          for (const file of this.imageFiles) {
            fd.append('images', file)
          }
          const r = await fetch(`/api/items/${created.id}/images`, {
            method: 'POST',
            body: fd
          })
          if (!r.ok) {
            const text = await r.text()
            let detail = ''
            try {
              const j = JSON.parse(text)
              const m = j && (j.error ?? j.message)
              if (typeof m === 'string' && m.trim()) detail = m.trim()
            } catch {
              if (typeof text === 'string' && text.trim()) {
                detail = text.trim().slice(0, 240)
              }
            }
            this.error =
              detail ||
              'Invalid image type or upload failed. Use JPEG, PNG, or GIF (max 5MB each).'
            return
          }
        }

        this.success = true
        setTimeout(() => this.$router.push('/dashboard'), 1200)
      } catch (e) {
        this.error = e.message || 'Something went wrong. Please try again.'
      } finally {
        this.submitting = false
      }
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

.asterisk {
  color: #dc2626;
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

.form-group label { font-size: 14px; font-weight: 700; color: #374151; text-align: left; align-self: flex-start; }

.form-group-images {
  position: relative;
}

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
  color: #111827;
  color-scheme: light;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { outline: none; border-color: #4f46e5; }

.form-group input::placeholder,
.form-group textarea::placeholder { color: #6b7280; opacity: 1; }

.form-group input:disabled { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }

.radio-group { display: flex; gap: 16px; flex-wrap: wrap; padding-top: 6px; }

.radio-label { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #374151; cursor: pointer; }

/* Hide native file control — browser label (“No file chosen”, wrong counts) is not our source of truth */
.form-group input.hidden-input[type='file'] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
  border-radius: 0;
  background: transparent;
  font-size: 0;
  line-height: 0;
}

.image-picker-head {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.btn-browse {
  flex-shrink: 0;
  padding: 8px 14px;
  font-size: 14px;
  font-family: Arial, sans-serif;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.btn-browse:hover {
  border-color: #4f46e5;
  color: #4f46e5;
}

.image-upload-status {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.45;
}

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

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
}

.image-preview {
  position: relative;
  height: 110px;
  border-radius: 10px;
  overflow: visible;

  background: #f9fafb;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;

  width: 24px;
  height: 24px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 50%;
  background: #dc2626;

  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  padding: 0;
}

.remove-image-btn::before,
.remove-image-btn::after {
  content: "";
  position: absolute;
  width: 12px;
  height: 2px;
  background: white;
}

.remove-image-btn::before {
  transform: rotate(45deg);
}

.remove-image-btn::after {
  transform: rotate(-45deg);
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
