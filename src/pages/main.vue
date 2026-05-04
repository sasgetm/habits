<template>
  <div class="app-layout">
    <HeaderBar />
    <main class="app-main">
      <HabitList
        :habits="habits"
        :completed="completed"
        @select-level="handleSelectLevel"
      />
    </main>
    <FooterBar :total-points="totalPoints" @reset="handleReset" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import HeaderBar from '../components/HeaderBar.vue'
import FooterBar from '../components/FooterBar.vue'
import HabitList from '../components/HabitList.vue'
import { useHabits } from '../composables/useHabits.js'

const { habits, completed, resetCompleted, seedInitialHabits } = useHabits()

// Начальные привычки (заполняются один раз при первом запуске)
onMounted(() => {
  seedInitialHabits([
    { id: 1, name: 'Утренняя зарядка', levels: [0, 5, 10, 15] },
    { id: 2, name: 'Чтение книги', levels: [0, 5, 10, 15] },
    { id: 3, name: 'Питьё воды', levels: [0, 5, 10, 15] },
  ])
})

const totalPoints = computed(() => {
  let sum = 0
  for (const habit of habits.value) {
    const levelId = completed[habit.id]
    if (levelId != null && habit.levels[levelId] != null) {
      sum += habit.levels[levelId]
    }
  }
  return sum
})

function handleSelectLevel(habitId, levelId) {
  completed[habitId] = levelId
}

function handleReset() {
  resetCompleted()
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
  padding: 8px 0;
}
</style>
