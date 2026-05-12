<template>
  <div class="app-layout">
    <GobackHeader />
    <main class="app-main">
      <div class="habit-form">
        <h2 class="form-title">Общие настройки</h2>

        <form @submit.prevent="handleSave">
          <FormField
            v-model="dayStartHourInput"
            label="Час начала нового дня"
            type="number"
            required
            :min="0"
            :max="23"
            placeholder="0"
            :error="errors.dayStartHour"
          />

          <div class="target-points-section">
            <label class="target-points-label">Целевое кол-во баллов</label>
            <div
              v-for="(point, index) in targetPointsInputs"
              :key="index"
              class="target-point-row"
            >
              <FormField
                v-model="targetPointsInputs[index]"
                :label="'Уровень ' + (index + 1)"
                type="number"
                required
                :min="1"
                :max="256"
                :error="errors.targetPoints ? errors.targetPoints[index] : null"
              />
            </div>
            <FormButton
              label="Добавить целевое кол-во баллов"
              variant="secondary"
              @click="addTargetPoint"
            />
          </div>

          <div class="form-actions">
            <FormButton
              label="Сохранить"
              variant="primary"
              type="submit"
            />
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import GobackHeader from '../components/GobackHeader.vue'
import FormField from '../components/FormField.vue'
import FormButton from '../components/FormButton.vue'
import { useSettings } from '../composables/useSettings.js'

const router = useRouter()

const { dayStartHour, targetPoints, saveSettings } = useSettings()

const dayStartHourInput = ref(dayStartHour.value)
const targetPointsInputs = ref([...targetPoints.value])

const errors = reactive({
  dayStartHour: null,
  targetPoints: {},
})

function addTargetPoint() {
  targetPointsInputs.value.push(0)
}

function validate() {
  let valid = true
  errors.dayStartHour = null
  errors.targetPoints = {}

  const hourVal = Number(dayStartHourInput.value)
  if (!Number.isInteger(hourVal) || hourVal < 0 || hourVal > 23) {
    errors.dayStartHour = 'Введите целое число от 0 до 23'
    valid = false
  }

  if (targetPointsInputs.value.length === 0) {
    errors.targetPoints[0] = 'Добавьте хотя бы один уровень'
    valid = false
  } else {
    for (let i = 0; i < targetPointsInputs.value.length; i++) {
      const val = Number(targetPointsInputs.value[i])
      if (!Number.isInteger(val) || val < 1 || val > 256) {
        errors.targetPoints[i] = 'Введите целое число от 1 до 256'
        valid = false
      }
    }
  }

  return valid
}

function handleSave() {
  if (!validate()) return

  const numericPoints = targetPointsInputs.value.map((v) => Number(v))
  saveSettings(dayStartHourInput.value, numericPoints)
  router.push('/')
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

.target-points-section {
  margin-bottom: 24px;
}

.target-points-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.target-point-row {
  margin-bottom: 12px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}
</style>
