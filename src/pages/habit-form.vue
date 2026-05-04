<template>
  <div class="app-layout">
    <HeaderBar />
    <main class="app-main">
      <HabitForm :habit-id="habitId" />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HeaderBar from '../components/HeaderBar.vue'
import HabitForm from '../components/HabitForm.vue'

const route = useRoute()

const habitId = computed(() => {
  return route.params.id ? Number(route.params.id) : null
})
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
</style>
