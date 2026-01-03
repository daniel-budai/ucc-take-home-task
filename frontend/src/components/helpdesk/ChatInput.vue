<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

defineProps<{
  disabled?: boolean
  loading?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const message = ref('')

function handleSend() {
  const content = message.value.trim()
  if (content) {
    emit('send', content)
    message.value = ''
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="flex gap-2">
    <InputText
      v-model="message"
      :placeholder="placeholder || 'Type your message...'"
      :disabled="disabled"
      class="flex-1"
      @keydown="handleKeydown"
    />
    <Button
      icon="pi pi-send"
      :disabled="disabled || !message.trim()"
      :loading="loading"
      aria-label="Send"
      @click="handleSend"
    />
  </div>
</template>






