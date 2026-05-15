import { ref } from 'vue'
import { useApi, csvToArray } from './useApi.js'

const STORAGE_KEY_DAY_START = 'habits-settings-dayStartHour'
const STORAGE_KEY_TARGET = 'habits-settings-targetPoints'

const dayStartHour = ref(0)
const targetPoints = ref([30])
const trackerName = ref('')
const api = useApi()

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
      const val = Number(savedTarget)
      if (Number.isInteger(val) && val >= 1 && val <= 256) {
        targetPoints.value = [val]
      }
    }
  }

  const savedTrackerName = localStorage.getItem('habits-settings-trackerName')
  if (savedTrackerName) {
    trackerName.value = savedTrackerName
  }
}

// Инициализация при первом импорте модуля
loadFromLocalStorage()

export function useSettings() {
  function saveSettings(hour, pointsArray, syncToApi = true) {
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

    if (syncToApi) {
      const deploymentId = localStorage.getItem('habits-settings-deploymentId')
      api.updateSettings({
        trackerName: trackerName.value,
        deploymentId: deploymentId,
        rewardLevels: validPoints,
      })
    }

    return true
  }

  function loadFromBootstrap(settings) {
    if (!settings) return

    const localDeploymentId = localStorage.getItem('habits-settings-deploymentId')

    if (settings.trackerName && settings.trackerName !== localDeploymentId) {
      trackerName.value = settings.trackerName
      localStorage.setItem('habits-settings-trackerName', settings.trackerName)
    }

    if (settings.rewardLevels) {
      const levels = csvToArray(settings.rewardLevels)
      if (levels.length > 0) {
        targetPoints.value = levels
        localStorage.setItem(STORAGE_KEY_TARGET, JSON.stringify(levels))
      }
    }
  }

  return {
    dayStartHour,
    targetPoints,
    trackerName,
    saveSettings,
    loadFromBootstrap,
  }
}
