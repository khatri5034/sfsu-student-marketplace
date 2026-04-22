<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="modal-close" @click="$emit('close')">✕</button>
      <h2>Offer a Trade</h2>
      <p class="modal-subtitle">For: <strong>{{ listing.title }}</strong></p>

      <div v-if="submitted" class="success-state">
        <div class="success-icon">✅</div>
        <h3>Trade request sent!</h3>
        <p>The seller will be notified. Check your messages for their reply.</p>
        <button class="btn-primary" @click="$emit('close')">Done</button>
      </div>

      <form v-else @submit.prevent="submit">
        <div class="form-group">
          <label>What are you offering?</label>
          <textarea
            v-model="offerDescription"
            placeholder="Describe what you'd like to trade (item name, condition, estimated value)..."
            rows="4"
            required
          ></textarea>
        </div>
        <div class="form-group">
          <label>Message to seller (optional)</label>
          <textarea
            v-model="message"
            placeholder="Any extra details about the trade..."
            rows="3"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="$emit('close')">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="!offerDescription.trim()">Send Trade Request</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TradeRequestModal',
  emits: ['close'],
  props: {
    listing: { type: Object, required: true }
  },
  data() {
    return {
      offerDescription: '',
      message: '',
      submitted: false
    }
  },
  methods: {
    submit() {
      this.submitted = true
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

.form-group textarea {
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 15px;
  font-family: Arial, sans-serif;
  resize: vertical;
  transition: border-color 0.2s;
}

.form-group textarea:focus { outline: none; border-color: #4f46e5; }

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

.success-state h3 { font-size: 20px; color: #111827; }

.success-state p { color: #6b7280; font-size: 15px; }

button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
