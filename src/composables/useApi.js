import { ref } from 'vue'

const isLoading = ref(false)
const error = ref(null)

function getEndpoint() {
  const deploymentId = localStorage.getItem('habits-settings-deploymentId')
  if (!deploymentId) {
    return null
  }
  return `https://script.google.com/macros/s/${deploymentId}/exec`
}

function getErrorMessage(err) {
  if (err.message) return err.message
  if (err.error) return err.error
  return 'Unknown error'
}

function arrayToCsv(arr) {
  if (!Array.isArray(arr)) return ''
  return arr.join(',')
}

function csvToArray(str) {
  if (!str) return []
  if (Array.isArray(str)) return str
  if (typeof str !== 'string') return []
  return str.split(',').map((v) => Number(v.trim())).filter((v) => !isNaN(v))
}

export function useApi() {
  async function bootstrap() {
    const endpoint = getEndpoint()
    if (!endpoint) {
      error.value = 'No deployment ID configured'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${endpoint}?action=bootstrap`)
      const data = await response.json()

      if (!data.success) {
        error.value = getErrorMessage(data)
        return null
      }

      return {
        settings: data.settings,
        habits: data.habits,
      }
    } catch (err) {
      error.value = getErrorMessage(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function upsertHabit(habit) {
    const endpoint = getEndpoint()
    if (!endpoint) {
      error.value = 'No deployment ID configured'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const body = {
        id: habit.id,
        name: habit.name,
        levels: arrayToCsv(habit.levels),
        order: habit.order,
      }

      const response = await fetch(`${endpoint}?action=upsertHabit`, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const data = await response.json()

      if (!data.success) {
        error.value = getErrorMessage(data)
        return null
      }

      return { success: true, mode: data.mode }
    } catch (err) {
      error.value = getErrorMessage(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteHabitApi(habitId) {
    const endpoint = getEndpoint()
    if (!endpoint) {
      error.value = 'No deployment ID configured'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${endpoint}?action=deleteHabit`, {
        method: 'POST',
        body: JSON.stringify({ id: habitId }),
      })
      const data = await response.json()

      if (!data.success) {
        error.value = getErrorMessage(data)
        return null
      }

      return { success: true }
    } catch (err) {
      error.value = getErrorMessage(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateSettings(settings) {
    const endpoint = getEndpoint()
    if (!endpoint) {
      error.value = 'No deployment ID configured'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const body = {
        trackerName: settings.trackerName,
        deploymentId: settings.deploymentId,
        rewardLevels: arrayToCsv(settings.rewardLevels),
      }

      const response = await fetch(`${endpoint}?action=updateSettings`, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const data = await response.json()

      if (!data.success) {
        error.value = getErrorMessage(data)
        return null
      }

      return { success: true }
    } catch (err) {
      error.value = getErrorMessage(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    bootstrap,
    upsertHabit,
    deleteHabitApi,
    updateSettings,
    arrayToCsv,
    csvToArray,
  }
}

export { arrayToCsv, csvToArray }