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
    <FooterBar :total-points="totalPoints" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import HeaderBar from './components/HeaderBar.vue'
import FooterBar from './components/FooterBar.vue'
import HabitList from './components/HabitList.vue'

const habits = [
  {
    id: 1,
    name: 'Утренняя зарядка',
    levels: [
      { label: 'Не сделал', points: 0 },
      { label: '5 минут', points: 5 },
      { label: '10 минут', points: 10 },
      { label: '15 минут', points: 15 },
    ],
  },
  {
    id: 2,
    name: 'Чтение книги',
    levels: [
      { label: 'Не читал', points: 0 },
      { label: '10 страниц', points: 5 },
      { label: '20 страниц', points: 10 },
      { label: '30+ страниц', points: 15 },
    ],
  },
  {
    id: 3,
    name: 'Питьё воды',
    levels: [
      { label: 'Мало', points: 0 },
      { label: '1 литр', points: 5 },
      { label: '1.5 литра', points: 10 },
      { label: '2+ литра', points: 15 },
    ],
  },
]

const completed = ref({})

const totalPoints = computed(() => {
  let sum = 0
  for (const habit of habits) {
    const levelId = completed.value[habit.id]
    if (levelId != null && habit.levels[levelId]) {
      sum += habit.levels[levelId].points
    }
  }
  return sum
})

function handleSelectLevel(habitId, levelId) {
  completed.value[habitId] = levelId
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