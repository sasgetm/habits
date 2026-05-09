<template>
  <header class="header-bar">
    <div class="header-left">
      <router-link to="/" class="header-back-btn">←</router-link>
    </div>
  </header>
</template>

<style scoped>
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-back-btn {
  text-decoration: none;
  font-size: 24px;
  color: var(--text-gray);
}

.header-back-btn:hover {
  color: var(--text-black);
}

.header-settings-btn {
  text-decoration: none;
  font-size: 20px;
  color: var(--text-gray);
}

.header-settings-btn:hover {
  color: var(--text-black);
}
</style>