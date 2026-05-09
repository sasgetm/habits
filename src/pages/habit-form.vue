<template>
  <div class="app-layout">
    <GobackHeader />
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
import GobackHeader from '../components/GobackHeader.vue'
import HabitForm from '../components/HabitForm.vue'
import { useHabits } from '../composables/useHabits.js'

const route = useRoute()
const router = useRouter()

const { addHabit, updateHabit, deleteHabit } = useHabits()

const habitId = computed(() => {
  const id = route.params.id
  return id != null ? String(id) : null
})

function handleSaved({ id, name, levels, order }) {
  if (id != null) {
    updateHabit(id, name, levels, order)
  } else {
    addHabit(name, levels, order)
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
