import { ref } from 'vue'
import { useApi, csvToArray } from './useApi.js'

const STORAGE_KEY_DAY_START = 'habits-settings-dayStartHour'
const STORAGE_KEY_TARGET = 'habits-settings-targetPoints'
const STORAGE_KEY_TRACKER_NAME = 'habits-settings-trackerName'
const STORAGE_KEY_DEPLOYMENT = 'habits-settings-deploymentId'

const dayStartHour = ref(0)
const targetPoints = ref([30])
const trackerName = ref('')
const deploymentId = ref('')
const api = useApi()

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY_DAY_START, String(dayStartHour.value))
  localStorage.setItem(STORAGE_KEY_TARGET, JSON.stringify(targetPoints.value))
  localStorage.setItem(STORAGE_KEY_TRACKER_NAME, trackerName.value)
  localStorage.setItem(STORAGE_KEY_DEPLOYMENT, deploymentId.value)
}

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

  const savedTrackerName = localStorage.getItem(STORAGE_KEY_TRACKER_NAME)
  if (savedTrackerName) {
    trackerName.value = savedTrackerName
  }

  const savedDeploymentId = localStorage.getItem(STORAGE_KEY_DEPLOYMENT)
  if (savedDeploymentId) {
    deploymentId.value = savedDeploymentId
  }
}

loadFromLocalStorage()

export function useSettings() {
  function saveSettings(hour, pointsArray, tracker, deployId, syncToApi = true) {
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
    trackerName.value = tracker || ''
    deploymentId.value = deployId || ''
    saveToLocalStorage()

    if (syncToApi) {
      api.updateSettings({
        trackerName: trackerName.value,
        deploymentId: deploymentId.value,
        rewardLevels: validPoints,
        dayStartHour: hourVal,
      })
    }

    return true
  }

  function loadFromBootstrap(settings) {
    if (!settings) return

    if (settings.trackerName) {
      trackerName.value = settings.trackerName
    }

    if (settings.deploymentId) {
      deploymentId.value = settings.deploymentId
    }

    if (typeof settings.dayStartHour === 'number') {
      dayStartHour.value = settings.dayStartHour
    }

    if (settings.rewardLevels) {
      const levels = csvToArray(settings.rewardLevels)
      if (levels.length > 0) {
        targetPoints.value = levels
      }
    }

    saveToLocalStorage()
  }

  return {
    dayStartHour,
    targetPoints,
    trackerName,
    deploymentId,
    saveSettings,
    loadFromBootstrap,
  }
}