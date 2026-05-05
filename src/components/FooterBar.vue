<template>
  <footer class="footer-bar">
    <div class="footer-points">{{ totalPoints }} баллов</div>
    <button class="footer-reset-btn" type="button" @click="emit('reset')">Сброс</button>
  </footer>
</template>

<script setup>
defineProps({
  totalPoints: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['reset'])
</script>

<style scoped>
.footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #fff;
}

.footer-points {
  font-size: 16px;
  font-weight: 600;
  color: #222;
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