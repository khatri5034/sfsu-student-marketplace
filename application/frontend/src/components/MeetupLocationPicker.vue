<template>
  <div class="meetup-picker">
    <div v-if="readonly" class="meetup-display">
      <div class="location-name">📍 {{ selectedLocation.name }}</div>
      <div class="location-desc">{{ selectedLocation.description }}</div>
    </div>
    <select
      v-else
      :value="modelValue === null || modelValue === undefined ? '' : modelValue"
      @change="onChange"
    >
      <option value="">No specific location (optional)</option>
      <option v-for="loc in locations" :key="loc.id" :value="loc.id">
        {{ loc.name }} — {{ locSubtitle(loc) }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'MeetupLocationPicker',
  emits: ['update:modelValue'],
  props: {
    modelValue: { default: null },
    readonly: { type: Boolean, default: false },
    locations: { type: Array, default: () => [] }
  },
  computed: {
    selectedLocation() {
      const loc = this.locations.find(l => l.id === this.modelValue)
      if (!loc) return { name: 'Not specified', description: '' }
      return {
        name: loc.name,
        description: this.locSubtitle(loc)
      }
    }
  },
  methods: {
    locSubtitle(loc) {
      return (loc.description || loc.location || '').toString() || 'Campus meetup'
    },
    onChange(e) {
      const v = e.target.value
      if (v === '') this.$emit('update:modelValue', null)
      else this.$emit('update:modelValue', Number.parseInt(v, 10))
    }
  }
}
</script>

<style scoped>
select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 15px;
  font-family: Arial, sans-serif;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

select:focus { outline: none; border-color: #4f46e5; }

.meetup-display {
  background: #f3f4f6;
  border-radius: 12px;
  padding: 14px 16px;
}

.location-name { font-size: 15px; font-weight: 700; color: #111827; }

.location-desc { font-size: 13px; color: #6b7280; margin-top: 4px; }
</style>
