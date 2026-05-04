<template>
  <div class="habit-form">
    <h2 class="form-title">{{ isEdit ? 'Редактирование привычки' : 'Новая привычка' }}</h2>

    <FormField
      v-model="name"
      label="Название"
      type="text"
      required
      :minlength="1"
      :maxlength="128"
      placeholder="Введите название привычки"
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
      />
      <FormButton
        v-if="isEdit"
        label="Удалить"
        variant="danger"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FormField from './FormField.vue'
import FormButton from './FormButton.vue'

const props = defineProps({
  habitId: {
    type: Number,
    default: null,
  },
})

const isEdit = props.habitId != null

const name = ref('')
const levels = ref([0])

function addLevel() {
  levels.value.push(0)
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
