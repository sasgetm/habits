import { ref, reactive } from 'vue'

const STORAGE_KEY_HABITS = 'habits-tracker-data'
const STORAGE_KEY_COMPLETED = 'habits-tracker-completed'
const STORAGE_KEY_NEXT_ID = 'habits-tracker-nextId'

// Общее реактивное состояние привычек (модульный singleton)
const habits = ref([])
const completed = reactive({})

let nextId = 1

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits.value))
  localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(completed))
  localStorage.setItem(STORAGE_KEY_NEXT_ID, String(nextId))
}

function loadFromLocalStorage() {
  const savedHabits = localStorage.getItem(STORAGE_KEY_HABITS)
  const savedCompleted = localStorage.getItem(STORAGE_KEY_COMPLETED)
  const savedNextId = localStorage.getItem(STORAGE_KEY_NEXT_ID)

  if (savedHabits) {
    try {
      habits.value = JSON.parse(savedHabits)
    } catch {
      habits.value = []
    }
  }
  if (savedCompleted) {
    try {
      const parsed = JSON.parse(savedCompleted)
      for (const key of Object.keys(parsed)) {
        completed[key] = parsed[key]
      }
    } catch {
      // ignore
    }
  }
  if (savedNextId) {
    nextId = Number(savedNextId)
  }
}


// Инициализация при первом импорте модуля
if (localStorage.getItem(STORAGE_KEY_HABITS)) {
  loadFromLocalStorage()
}

export function useHabits() {
  function addHabit(name, levels) {
    const id = nextId++
    habits.value.push({
      id,
      name,
      levels: [...levels],
    })
    saveToLocalStorage()
    return id
  }

  function updateHabit(id, name, levels) {
    const habit = habits.value.find((h) => h.id === id)
    if (habit) {
      habit.name = name
      habit.levels = [...levels]
    }
    saveToLocalStorage()
  }

  function deleteHabit(id) {
    const index = habits.value.findIndex((h) => h.id === id)
    if (index !== -1) {
      habits.value.splice(index, 1)
    }
    delete completed[id]
    saveToLocalStorage()
  }

  function getHabitById(id) {
    return habits.value.find((h) => h.id === id) || null
  }

  function resetCompleted() {
    for (const key of Object.keys(completed)) {
      delete completed[key]
    }
    saveToLocalStorage()
  }

  function setLevel(habitId, levelId) {
    completed[habitId] = levelId
    saveToLocalStorage()
  }

  return {
    habits,
    completed,
    addHabit,
    updateHabit,
    deleteHabit,
    getHabitById,
    resetCompleted,
    setLevel,
  }
}
