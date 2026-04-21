<template>
  <div class="meetup-picker">
    <div v-if="readonly" class="meetup-display">
      <div class="location-name">📍 {{ selectedLocation.name }}</div>
      <div class="location-desc">{{ selectedLocation.description }}</div>
    </div>
    <select v-else :value="modelValue" @change="$emit('update:modelValue', +$event.target.value)" required>
      <option value="" disabled>Select a campus location...</option>
      <option v-for="loc in pickupLocations" :key="loc.id" :value="loc.id">
        {{ loc.name }} — {{ loc.description }}
      </option>
    </select>
  </div>
</template>

<script>
import { pickupLocations } from '../data/mockData.js'

export default {
  name: 'MeetupLocationPicker',
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: Number, default: null },
    readonly: { type: Boolean, default: false }
  },
  data() {
    return { pickupLocations }
  },
  computed: {
    selectedLocation() {
      return this.pickupLocations.find(l => l.id === this.modelValue) || { name: 'Not specified', description: '' }
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
