<template>
  <div class="habit-form">
    <h2 class="form-title">{{ isEdit ? 'Редактирование привычки' : 'Новая привычка' }}</h2>

    <form @submit.prevent="handleSave">
      <FormField
        v-model="name"
        label="Название"
        type="text"
        required
        :minlength="1"
        :maxlength="128"
        placeholder="Введите название привычки"
        :error="errors.name"
      />

      <FormField
        v-model="order"
        label="Порядковый номер"
        type="number"
        required
        :min="1"
        :error="errors.order"
      />

      <div class="levels-section">
        <label class="levels-label">Баллы за выполнение</label>
        <div
          v-for="(level, index) in levels"
          :key="index"
          class="level-row"
        >
          <FormField
            v-model="levels[index]"
            :label="'Балл ' + (index + 1)"
            type="number"
            required
            :min="1"
            :max="128"
            :error="errors.levels ? errors.levels[index] : null"
          />
        </div>
        <FormButton
          label="Добавить вариант выполнения"
          variant="secondary"
          @click="addLevel"
        />
      </div>

      <div class="form-actions">
        <FormButton
          label="Сохранить"
          variant="primary"
          type="submit"
        />
        <FormButton
          v-if="isEdit"
          label="Удалить"
          variant="danger"
          @click="handleDelete"
        />
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import FormField from './FormField.vue'
import FormButton from './FormButton.vue'
import { useHabits } from '../composables/useHabits.js'

const props = defineProps({
  habitId: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['saved', 'deleted'])

const isEdit = props.habitId != null

const { getHabitById, getNextOrder } = useHabits()

const name = ref('')
const order = ref(isEdit ? 0 : getNextOrder())
const levels = ref([0])
const errors = reactive({
  name: null,
  order: null,
  levels: {},
})

// Загрузка данных привычки при редактировании
if (isEdit) {
  const habit = getHabitById(props.habitId)
  if (habit) {
    name.value = habit.name
    order.value = habit.order
    levels.value = [...habit.levels]
  }
}

// Следим за изменением habitId при навигации (например, при прямом переходе)
// Но т.к. habitId — prop и страница пересоздаётся при переходе, watch не критичен.
// Оставляем для надёжности при HMR.
watch(
  () => props.habitId,
  (newId) => {
    if (newId != null) {
      const habit = getHabitById(newId)
      if (habit) {
        name.value = habit.name
        order.value = habit.order
        levels.value = [...habit.levels]
      }
    }
  },
  { immediate: false },
)

function addLevel() {
  levels.value.push(0)
}

function validate() {
  let valid = true
  errors.name = null
  errors.order = null
  errors.levels = {}

  const trimmedName = name.value.trim()
  if (!trimmedName) {
    errors.name = 'Название обязательно'
    valid = false
  } else if (trimmedName.length > 128) {
    errors.name = 'Название не должно превышать 128 символов'
    valid = false
  }

  const orderVal = Number(order.value)
  if (!Number.isInteger(orderVal) || orderVal < 1) {
    errors.order = 'Порядковый номер должен быть целым числом не менее 1'
    valid = false
  }

  if (levels.value.length === 0) {
    errors.levels[0] = 'Добавьте хотя бы один вариант выполнения'
    valid = false
  } else {
    for (let i = 0; i < levels.value.length; i++) {
      const val = Number(levels.value[i])
      if (isNaN(val) || val < 1) {
        errors.levels[i] = 'Балл должен быть не менее 1'
        valid = false
      } else if (val > 128) {
        errors.levels[i] = 'Балл не должен превышать 128'
        valid = false
      }
    }
  }

  return valid
}

function handleSave() {
  if (!validate()) return

  const numericLevels = levels.value.map((v) => Number(v))

  emit('saved', {
    id: props.habitId,
    name: name.value.trim(),
    levels: numericLevels,
    order: Number(order.value),
  })
}

function handleDelete() {
  emit('deleted', props.habitId)
}
</script>

<style scoped>
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

.levels-section {
  margin-bottom: 24px;
}

.levels-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.level-row {
  margin-bottom: 12px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}
</style>
