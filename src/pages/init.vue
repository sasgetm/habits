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
            />
            <!-- <FormButton
              label="Нет, создать трекер привычек"
              variant="secondary"
              :hidden="true"
              @click="handleCreateNew"
            /> -->
            <FormButton
              label="Нет, создать трекер привычек"
              variant="secondary"
              @click="handleCreateNew"
            />
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GobackHeader from '../components/GobackHeader.vue'
import FormField from '../components/FormField.vue'
import FormButton from '../components/FormButton.vue'

const router = useRouter()

const deploymentIdInput = ref('')
const error = ref(null)

function handleSave() {
  const trimmed = deploymentIdInput.value.trim()

  if (!trimmed) {
    error.value = 'Введите Deployment ID'
    return
  }

  localStorage.setItem('habits-settings-deploymentId', trimmed)
  router.push('/')
}

function handleCreateNew() {
  router.push('/tracker-create')
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
</style>