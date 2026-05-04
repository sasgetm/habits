<template>
  <li class="habit-item">
    <div class="habit-header">
      <span class="habit-name">{{ habit.name }}</span>
      <router-link :to="'/habit/' + habit.id + '/edit'" class="habit-edit-btn">Редактировать</router-link>
    </div>
    <div class="habit-levels">
      <label
        v-for="(level, index) in habit.levels"
        :key="index"
        class="level-label"
      >
        <input
          type="radio"
          :name="'habit-' + habit.id"
          :value="index"
          :checked="selectedLevelId === index"
          class="level-input"
          @click="handleClick(index)"
        />
        <span class="level-text">{{ level }}</span>
      </label>
    </div>
  </li>
</template>

<script setup>
const props = defineProps({
  habit: {
    type: Object,
    required: true,
  },
  selectedLevelId: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['selectLevel'])

function handleClick(levelId) {
  if (props.selectedLevelId === levelId) {
    emit('selectLevel', props.habit.id, null)
  } else {
    emit('selectLevel', props.habit.id, levelId)
  }
}
</script>

<style scoped>
.habit-item {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.habit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.habit-name {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.habit-edit-btn {
  padding: 6px 12px;
  font-size: 13px;
  color: #666;
  background-color: #f0f0f0;
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.habit-edit-btn:hover {
  background-color: #e0e0e0;
}

.habit-levels {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.level-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #444;
}

.level-input {
  width: 18px;
  height: 18px;
  accent-color: #4caf50;
}

.level-text {
  user-select: none;
}
</style>