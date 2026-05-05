<template>
  <header class="header-bar">
    <div class="header-date">{{ currentDate }}</div>
    <router-link to="/habit/new" class="header-add-btn">+</router-link>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const currentDate = computed(() => {
  return new Date().toLocaleDateString('ru-RU', {
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

.header-date {
  font-size: 16px;
  font-weight: 600;
  color: #222;
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