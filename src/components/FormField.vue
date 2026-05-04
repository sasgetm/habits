<template>
  <div class="form-field">
    <label class="field-label">
      {{ label }}
      <span v-if="required" class="field-required">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :minlength="minlength"
      :maxlength="maxlength"
      :min="min"
      :max="max"
      class="field-input"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span v-if="error" class="field-error">{{ error }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  minlength: {
    type: Number,
    default: null,
  },
  maxlength: {
    type: Number,
    default: null,
  },
  min: {
    type: Number,
    default: null,
  },
  max: {
    type: Number,
    default: null,
  },
  error: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.field-required {
  color: #ef5350;
}

.field-input {
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s ease;
}

.field-input:focus {
  border-color: #4caf50;
}

.field-error {
  font-size: 12px;
  color: #ef5350;
}
</style>
