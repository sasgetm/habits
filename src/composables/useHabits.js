import { ref, reactive } from 'vue'
import { useApi, csvToArray } from './useApi.js'

const STORAGE_KEY_HABITS = 'habits-tracker-data'
const STORAGE_KEY_COMPLETED = 'habits-tracker-completed'
const STORAGE_KEY_NEXT_ORDER = 'habits-tracker-nextOrder'

const habits = ref([])
const completed = reactive({})

let nextOrder = 1
let api = null

function getApi() {
  if (!api) {
    api = useApi()
  }
  return api
}

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits.value))
  localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(completed))
  localStorage.setItem(STORAGE_KEY_NEXT_ORDER, String(nextOrder))
}

// function migrateHabits(list) {
//   for (const h of list) {
//     // Если id — число (старый формат), преобразуем в строку
//     if (typeof h.id === 'number') {
//       h.id = String(h.id)
//     }
//     // Если нет поля order, присваиваем order = старый числовой id (или индекс)
//     if (h.order == null) {
//       h.order = typeof h.id === 'number' ? h.id : 1
//     }
//   }
// }

// Вычисляет nextOrder как max(order) + 1 из всех привычек
function recalculateNextOrder() {
  if (habits.value.length === 0) {
    nextOrder = 1
    return
  }
  const maxOrder = Math.max(...habits.value.map((h) => h.order))
  nextOrder = maxOrder + 1
}

function loadFromLocalStorage() {
  const savedHabits = localStorage.getItem(STORAGE_KEY_HABITS)
  const savedCompleted = localStorage.getItem(STORAGE_KEY_COMPLETED)
  const savedNextOrder = localStorage.getItem(STORAGE_KEY_NEXT_ORDER)

  if (savedHabits) {
    try {
      const parsed = JSON.parse(savedHabits)
      // migrateHabits(parsed)
      habits.value = parsed
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
  // Вычисляем nextOrder на основе существующих привычек
  recalculateNextOrder()
}


// Инициализация при первом импорте модуля
if (localStorage.getItem(STORAGE_KEY_HABITS)) {
  loadFromLocalStorage()
}

export function useHabits() {
  function addHabit(name, levels, order, syncToApi = true) {
    const id = crypto.randomUUID()
    const habitOrder = order != null ? order : nextOrder
    const habit = {
      id,
      name,
      levels: [...levels],
      order: habitOrder,
    }
    habits.value.push(habit)
    recalculateNextOrder()
    saveToLocalStorage()

    if (syncToApi) {
      getApi().upsertHabit(habit)
    }

    return id
  }

  function updateHabit(id, name, levels, order, syncToApi = true) {
    const habit = habits.value.find((h) => h.id === id)
    if (habit) {
      habit.name = name
      habit.levels = [...levels]
      if (order != null) {
        habit.order = order
      }
    }
    recalculateNextOrder()
    saveToLocalStorage()

    if (syncToApi) {
      getApi().upsertHabit(habit)
    }
  }

  function deleteHabit(id, syncToApi = true) {
    const index = habits.value.findIndex((h) => h.id === id)
    if (index !== -1) {
      habits.value.splice(index, 1)
    }
    delete completed[id]
    recalculateNextOrder()
    saveToLocalStorage()

    if (syncToApi) {
      getApi().deleteHabitApi(id)
    }
  }

  function getHabitById(id) {
    return habits.value.find((h) => h.id === id) || null
  }

  function getNextOrder() {
    return nextOrder
  }

  function updateOrder(id, newOrder) {
    const habit = habits.value.find((h) => h.id === id)
    if (habit) {
      habit.order = newOrder
    }
    saveToLocalStorage()
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

  function loadFromBootstrap(habitsData) {
    if (!Array.isArray(habitsData)) return

    habits.value = habitsData.map((h) => ({
      id: h.id,
      name: h.name,
      levels: csvToArray(h.levels),
      order: h.order != null ? h.order : 0,
    }))

    for (const key of Object.keys(completed)) {
      delete completed[key]
    }

    recalculateNextOrder()
    saveToLocalStorage()
  }

  return {
    habits,
    completed,
    addHabit,
    updateHabit,
    deleteHabit,
    getHabitById,
    getNextOrder,
    updateOrder,
    resetCompleted,
    setLevel,
    loadFromBootstrap,
  }
}
