<template>
  <header class="header-bar">
    <div class="header-date">{{ currentDate }}</div>
    <router-link to="/habit/new" class="header-add-btn">Добавить привычку</router-link>
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
  border-bottom: 1px solid #e0e0e0;
}

.header-date {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.header-add-btn {
  padding: 8px 16px;
  font-size: 14px;
  color: #fff;
  background-color: #4caf50;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.header-add-btn:hover {
  background-color: #43a047;
}
</style>