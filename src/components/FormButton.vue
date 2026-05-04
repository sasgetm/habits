<template>
  <button
    v-if="!hidden"
    :type="type"
    :class="['form-button', 'form-button--' + variant]"
    @click="$emit('click')"
  >
    {{ label }}
  </button>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'primary',
  },
  type: {
    type: String,
    default: 'button',
  },
  hidden: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])
</script>

<style scoped>
.form-button {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.form-button--primary {
  color: #fff;
  background-color: #4caf50;
}

.form-button--primary:hover {
  background-color: #43a047;
}

.form-button--secondary {
  color: #333;
  background-color: #f0f0f0;
}

.form-button--secondary:hover {
  background-color: #e0e0e0;
}

.form-button--danger {
  color: #fff;
  background-color: #ef5350;
}

.form-button--danger:hover {
  background-color: #e53935;
}
</style>
