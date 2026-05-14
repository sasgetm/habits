import { createApp } from 'vue'
import App from './App.vue'
import router from './routes/routes.js'
import './assets/main.css'
import { useApi } from './composables/useApi.js'
import { useHabits } from './composables/useHabits.js'
import { useSettings } from './composables/useSettings.js'

async function initializeApp() {
  const deploymentId = localStorage.getItem('habits-settings-deploymentId')
  if (!deploymentId) return

  const api = useApi()
  const { loadFromBootstrap: loadHabits } = useHabits()
  const { loadFromBootstrap: loadSettings } = useSettings()

  const data = await api.bootstrap()
  if (data) {
    loadSettings(data.settings)
    loadHabits(data.habits)
  }
}

createApp(App).use(router).mount('#app')

initializeApp()
