<template>
  <footer class="footer-bar">
    <div class="footer-left">
      <div class="footer-points">{{ formattedPoints }}</div>
      <router-link to="/settings" class="footer-settings-btn">✎</router-link>
    </div>
    <button class="footer-reset-btn" type="button" @click="emit('reset')">Сброс</button>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalPoints: {
    type: Number,
    default: 0,
  },
  targetPoints: {
    type: Array,
    default: () => [30],
  },
})

const emit = defineEmits(['reset'])

const formattedPoints = computed(() => {
  const arr = props.targetPoints
  if (!arr || arr.length === 0) return `${props.totalPoints}/? баллов`
  if (arr.length === 1) return `${props.totalPoints}/${arr[0]} баллов`
  const extra = arr.slice(1).join('/')
  return `${props.totalPoints}/${arr[0]}(${extra}) баллов`
})
</script>

<style scoped>
.footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #fff;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-points {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.footer-settings-btn {
  text-decoration: none;
  font-size: 20px;
  color: var(--text-gray);
}

.footer-settings-btn:hover {
  color: var(--text-black);
}

.footer-reset-btn {
  padding: 8px 16px;
  font-size: 14px;
  color: var(--text-gray);
  background-color: var(--bg-gray);
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.footer-reset-btn:hover {
  background-color: var(--bg-gray-hover);
}
</style>