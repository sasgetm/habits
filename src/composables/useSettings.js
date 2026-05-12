import { ref } from 'vue'

const STORAGE_KEY_DAY_START = 'habits-settings-dayStartHour'
const STORAGE_KEY_TARGET = 'habits-settings-targetPoints'

// Общее реактивное состояние настроек (модульный singleton)
const dayStartHour = ref(0)
const targetPoints = ref([30])

function loadFromLocalStorage() {
  const savedDayStart = localStorage.getItem(STORAGE_KEY_DAY_START)
  const savedTarget = localStorage.getItem(STORAGE_KEY_TARGET)

  if (savedDayStart != null) {
    const val = Number(savedDayStart)
    if (Number.isInteger(val) && val >= 0 && val <= 23) {
      dayStartHour.value = val
    }
  }
  if (savedTarget != null) {
    try {
      const parsed = JSON.parse(savedTarget)
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(
          (v) => Number.isInteger(v) && v >= 1 && v <= 256,
        )
        if (valid.length > 0) {
          targetPoints.value = valid
        }
      }
    } catch {
      // Старый формат — одиночное число
      const val = Number(savedTarget)
      if (Number.isInteger(val) && val >= 1 && val <= 256) {
        targetPoints.value = [val]
      }
    }
  }
}

// Инициализация при первом импорте модуля
loadFromLocalStorage()

export function useSettings() {
  function saveSettings(hour, pointsArray) {
    const hourVal = Number(hour)

    if (!Number.isInteger(hourVal) || hourVal < 0 || hourVal > 23) {
      return false
    }

    if (!Array.isArray(pointsArray) || pointsArray.length === 0) {
      return false
    }

    const validPoints = pointsArray.filter(
      (v) => Number.isInteger(v) && v >= 1 && v <= 256,
    )
    if (validPoints.length === 0) {
      return false
    }

    dayStartHour.value = hourVal
    targetPoints.value = validPoints

    localStorage.setItem(STORAGE_KEY_DAY_START, String(hourVal))
    localStorage.setItem(STORAGE_KEY_TARGET, JSON.stringify(validPoints))

    return true
  }

  return {
    dayStartHour,
    targetPoints,
    saveSettings,
  }
}
