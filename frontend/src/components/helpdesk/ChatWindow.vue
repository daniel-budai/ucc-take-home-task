<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import type { Chat, Message } from '@/types'
import ChatMessage from '@/components/helpdesk/ChatMessage.vue'
import ChatInput from '@/components/helpdesk/ChatInput.vue'
import { CHAT_STATUS_LABELS } from '@/utils/constants'

const props = defineProps<{
  chat: Chat | null
  messages: Message[]
  sending?: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const messagesContainer = ref<HTMLElement | null>(null)

// Scroll to bottom when new messages arrive
watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }
)
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- No chat selected -->
    <div v-if="!chat" class="flex-1 flex items-center justify-center text-gray-500">
      <div class="text-center">
        <i class="pi pi-comments text-5xl mb-4"></i>
        <p>Select a conversation or start a new one</p>
      </div>
    </div>

    <!-- Chat view -->
    <template v-else>
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 bg-white">
        <h2 class="font-semibold text-lg">{{ chat.subject }}</h2>
        <p class="text-sm text-gray-500">{{ CHAT_STATUS_LABELS[chat.status] || chat.status }}</p>
      </div>

      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <ChatMessage v-for="message in messages" :key="message.id" :message="message" />

        <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>

      <!-- Input -->
      <div class="p-4 border-t border-gray-200 bg-white">
        <ChatInput
          :disabled="chat.status === 'resolved' || chat.status === 'closed'"
          :loading="sending"
          @send="emit('send', $event)"
        />
        <p v-if="chat.status === 'resolved'" class="text-sm text-gray-500 mt-2">
          This conversation has been resolved.
        </p>
      </div>
    </template>
  </div>
</template>






