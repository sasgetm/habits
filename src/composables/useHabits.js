import { ref, reactive } from 'vue'

// Общее реактивное состояние привычек (модульный singleton)
const habits = ref([])
const completed = reactive({})

let nextId = 1

export function useHabits() {
  function addHabit(name, levels) {
    const id = nextId++
    habits.value.push({
      id,
      name,
      levels: [...levels],
    })
    return id
  }

  function updateHabit(id, name, levels) {
    const habit = habits.value.find((h) => h.id === id)
    if (habit) {
      habit.name = name
      habit.levels = [...levels]
    }
  }

  function deleteHabit(id) {
    const index = habits.value.findIndex((h) => h.id === id)
    if (index !== -1) {
      habits.value.splice(index, 1)
    }
    delete completed[id]
  }

  function getHabitById(id) {
    return habits.value.find((h) => h.id === id) || null
  }

  function resetCompleted() {
    for (const key of Object.keys(completed)) {
      delete completed[key]
    }
  }

  function seedInitialHabits(initialHabits) {
    if (habits.value.length === 0) {
      for (const h of initialHabits) {
        habits.value.push({ ...h })
        if (h.id >= nextId) {
          nextId = h.id + 1
        }
      }
    }
  }

  return {
    habits,
    completed,
    addHabit,
    updateHabit,
    deleteHabit,
    getHabitById,
    resetCompleted,
    seedInitialHabits,
  }
}
