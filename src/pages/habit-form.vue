<template>
  <div class="app-layout">
    <HeaderBar />
    <main class="app-main">
      <HabitForm
        :habit-id="habitId"
        @saved="handleSaved"
        @deleted="handleDeleted"
      />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderBar from '../components/HeaderBar.vue'
import HabitForm from '../components/HabitForm.vue'
import { useHabits } from '../composables/useHabits.js'

const route = useRoute()
const router = useRouter()

const { addHabit, updateHabit, deleteHabit } = useHabits()

const habitId = computed(() => {
  return route.params.id ? Number(route.params.id) : null
})

function handleSaved({ id, name, levels }) {
  if (id != null) {
    updateHabit(id, name, levels)
  } else {
    addHabit(name, levels)
  }
  router.push('/')
}

function handleDeleted(id) {
  deleteHabit(id)
  router.push('/')
}
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
