<template>
  <div class="app-layout">
    <GobackHeader />
    <main class="app-main">
      <div class="habit-form">
        <h2 class="form-title">У вас уже есть трекер привычек?</h2>

        <form @submit.prevent="handleSave">
          <FormField
            v-model="deploymentIdInput"
            label="Введите Google Apps Script Deployment ID"
            type="text"
            required
            placeholder="AIza..."
            :error="error"
          />

          <div class="form-actions">
            <FormButton
              label="Сохранить"
              variant="primary"
              type="submit"
              :hidden="isLoading"
            />
            <FormButton
              label="Нет, создать трекер привычек"
              variant="secondary"
              :hidden="isLoading"
              @click="handleCreateNew"
            />
            <FormButton
              label="Демо"
              variant="secondary"
              :hidden="isLoading"
              @click="handleDemo"
            />
          </div>

          <div v-if="isLoading" class="loading-text">Загрузка данных...</div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '../composables/useApi.js'
import { useHabits } from '../composables/useHabits.js'
import { useSettings } from '../composables/useSettings.js'
import GobackHeader from '../components/GobackHeader.vue'
import FormField from '../components/FormField.vue'
import FormButton from '../components/FormButton.vue'

const router = useRouter()
const api = useApi()
const { loadFromBootstrap: loadHabits } = useHabits()
const { loadFromBootstrap: loadSettings } = useSettings()

const DEMO_DEPLOYMENT_ID = 'AKfycbzIjeLKZ8SbjMSRcm4rw2dXshZ7ngV7gWAW80WCs39TihJEqcIibdGVyPrPNVSxW5ug'

const deploymentIdInput = ref('')
const error = ref(null)
const isLoading = ref(false)

async function saveAndLoad(deploymentId) {
  isLoading.value = true
  error.value = null

  localStorage.setItem('habits-settings-deploymentId', deploymentId)

  const data = await api.bootstrap()
  if (data) {
    loadSettings(data.settings)
    loadHabits(data.habits)
    router.push('/')
  } else {
    error.value = 'Ошибка загрузки данных. Проверьте Deployment ID.'
    isLoading.value = false
  }
}

async function handleSave() {
  const trimmed = deploymentIdInput.value.trim()

  if (!trimmed) {
    error.value = 'Введите Deployment ID'
    return
  }

  localStorage.setItem('habits-settings-demo-mode', 'false')
  await saveAndLoad(trimmed)
}

function handleCreateNew() {
  router.push('/tracker-create')
}

async function handleDemo() {
  await saveAndLoad(DEMO_DEPLOYMENT_ID)
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
  padding: 16px;
}

.habit-form {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  color: #222;
  margin-bottom: 24px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}
</style>
