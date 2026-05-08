<template>
  <header class="header-bar">
    <div class="header-left">
      <div class="header-date">{{ currentDate }}</div>
      <router-link to="/settings" class="header-settings-btn">✎</router-link>
    </div>
    <router-link to="/habit/new" class="header-add-btn">+</router-link>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useSettings } from '../composables/useSettings.js'

const { dayStartHour } = useSettings()

const currentDate = computed(() => {
  const now = new Date()
  if (now.getHours() < dayStartHour.value) {
    now.setDate(now.getDate() - 1)
  }
  return now.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})
</script>

<style scoped>
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-date {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.header-settings-btn {
  text-decoration: none;
  font-size: 20px;
  color: var(--text-gray);
}

.header-settings-btn:hover {
  color: var(--text-black);
}

.header-add-btn {
  text-decoration: none;
  transition: background-color 0.2s ease;

  width: 48px;
  height: 48px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-gray);
  font-size: 32px;
  color: var(--text-gray);
  padding-bottom: 4px;
}

.header-add-btn:hover {
  background-color: var(--bg-gray-hover);
}
</style>