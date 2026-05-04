<template>
  <footer class="footer-bar">
    <div class="footer-points">{{ totalPoints }} баллов</div>
    <button class="footer-reset-btn" type="button">Сброс</button>
  </footer>
</template>

<script setup>
defineProps({
  totalPoints: {
    type: Number,
    default: 0,
  },
})
</script>

<style scoped>
.footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
}

.footer-points {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.footer-reset-btn {
  padding: 8px 16px;
  font-size: 14px;
  color: #fff;
  background-color: #ef5350;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.footer-reset-btn:hover {
  background-color: #e53935;
}
</style>