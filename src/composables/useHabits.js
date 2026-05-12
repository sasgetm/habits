import { ref, reactive } from 'vue'

const STORAGE_KEY_HABITS = 'habits-tracker-data'
const STORAGE_KEY_COMPLETED = 'habits-tracker-completed'
const STORAGE_KEY_NEXT_ORDER = 'habits-tracker-nextOrder'

// Общее реактивное состояние привычек (модульный singleton)
const habits = ref([])
const completed = reactive({})

let nextOrder = 1

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
  function addHabit(name, levels, order) {
    const id = crypto.randomUUID()
    const habitOrder = order != null ? order : nextOrder
    habits.value.push({
      id,
      name,
      levels: [...levels],
      order: habitOrder,
    })
    recalculateNextOrder()
    saveToLocalStorage()
    return id
  }

  function updateHabit(id, name, levels, order) {
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
  }

  function deleteHabit(id) {
    const index = habits.value.findIndex((h) => h.id === id)
    if (index !== -1) {
      habits.value.splice(index, 1)
    }
    delete completed[id]
    recalculateNextOrder()
    saveToLocalStorage()
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
  }
}
