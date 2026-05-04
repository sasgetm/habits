<template>
  <ul class="habit-list">
    <HabitItem
      v-for="habit in habits"
      :key="habit.id"
      :habit="habit"
      :selected-level-id="completed[habit.id] ?? null"
      @select-level="(habitId, levelId) => $emit('selectLevel', habitId, levelId)"
    />
  </ul>
</template>

<script setup>
import HabitItem from './HabitItem.vue'

defineProps({
  habits: {
    type: Array,
    required: true,
  },
  completed: {
    type: Object,
    required: true,
  },
})

defineEmits(['selectLevel'])
</script>

<style scoped>
.habit-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
}
</style>