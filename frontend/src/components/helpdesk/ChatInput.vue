<script setup lang="ts">
import { ref, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { sendMessageSchema } from '@/types/chat'
import { VALIDATION_LIMITS } from '@/utils/constants'

defineProps<{
  disabled?: boolean
  loading?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const message = ref('')
const validationError = ref<string>('')

const characterCount = computed(() => message.value.length)
const remainingChars = computed(() => VALIDATION_LIMITS.MESSAGE.MAX_LENGTH - characterCount.value)
const isOverLimit = computed(() => characterCount.value > VALIDATION_LIMITS.MESSAGE.MAX_LENGTH)
const isValid = computed(() => {
  if (!message.value.trim()) return false
  if (isOverLimit.value) return false
  const result = sendMessageSchema.safeParse({ content: message.value.trim() })
  return result.success
})

function validateMessage(): boolean {
  const result = sendMessageSchema.safeParse({ content: message.value.trim() })
  if (!result.success) {
    validationError.value = result.error.errors[0]?.message || 'Invalid message'
    return false
  }
  validationError.value = ''
  return true
}

function handleSend(): void {
  if (!validateMessage()) {
    return
  }

  const result = sendMessageSchema.safeParse({ content: message.value.trim() })
  if (result.success) {
    emit('send', result.data.content)
    message.value = ''
    validationError.value = ''
  }
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="flex gap-2">
      <div class="flex-1">
        <InputText
          v-model="message"
          :placeholder="placeholder || 'Type your message...'"
          :disabled="disabled"
          :maxlength="VALIDATION_LIMITS.MESSAGE.MAX_LENGTH"
          class="w-full"
          :class="{ 'p-invalid': validationError }"
          @keydown="handleKeydown"
          @blur="validateMessage"
        />
      </div>
      <Button
        icon="pi pi-send"
        :disabled="disabled || !isValid || loading"
        :loading="loading"
        aria-label="Send"
        @click="handleSend"
      />
    </div>
    <div class="flex justify-between items-center px-1">
      <small v-if="validationError" class="text-red-500">
        {{ validationError }}
      </small>
      <small
        v-else-if="message"
        class="text-gray-500"
        :class="{
          'text-orange-500': remainingChars < 100 && !isOverLimit,
          'text-red-500': isOverLimit,
        }"
      >
        {{ characterCount }} / {{ VALIDATION_LIMITS.MESSAGE.MAX_LENGTH }} characters
      </small>
      <span v-else></span>
    </div>
  </div>
</template>






