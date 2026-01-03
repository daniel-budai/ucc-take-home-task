<script setup lang="ts">
const { size, message } = defineProps<{
  size?: 'small' | 'medium' | 'large'
  message?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center p-4">
    <i
      class="pi pi-spin pi-spinner text-primary"
      :class="{
        'text-xl': size === 'small',
        'text-3xl': size === 'medium' || !size,
        'text-5xl': size === 'large',
      }"
    ></i>
    <p v-if="message" class="mt-2 text-sm text-gray-500">{{ message }}</p>
  </div>
</template>
