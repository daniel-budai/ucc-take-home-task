<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/types'
import { formatTime } from '@/utils/date'
import Avatar from 'primevue/avatar'

const { message } = defineProps<{
  message: Message
}>()

const isUser = computed(() => message.type === 'user')
const isAi = computed(() => message.type === 'ai')
const isAgent = computed(() => message.type === 'agent')
const isSystem = computed(() => message.type === 'system')

const avatarLabel = computed(() => {
  switch (message.type) {
    case 'user':
      return 'U'
    case 'ai':
      return 'AI'
    case 'agent':
      return 'A'
    default:
      return 'S'
  }
})

const avatarClass = computed(() => {
  switch (message.type) {
    case 'user':
      return 'bg-blue-500'
    case 'ai':
      return 'bg-purple-500'
    case 'agent':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
})
</script>

<template>
  <!-- System message -->
  <div v-if="isSystem" class="text-center">
    <span class="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
      {{ message.content }}
    </span>
  </div>

  <!-- Regular message -->
  <div
    v-else
    class="flex gap-3"
    :class="{
      'justify-end': isUser,
      'justify-start': !isUser,
    }"
  >
    <!-- Avatar (non-user) -->
    <Avatar
      v-if="!isUser"
      :label="avatarLabel"
      shape="circle"
      class="text-white flex-shrink-0"
      :class="avatarClass"
    />

    <!-- Message bubble -->
    <div
      class="max-w-[70%] rounded-lg px-4 py-2"
      :class="{
        'bg-blue-500 text-white': isUser,
        'bg-white border border-gray-200': !isUser,
      }"
    >
      <!-- Sender label for AI/Agent -->
      <p
        v-if="isAi || isAgent"
        class="text-xs font-medium mb-1"
        :class="isAi ? 'text-purple-600' : 'text-green-600'"
      >
        {{ isAi ? 'AI Assistant' : 'Support Agent' }}
      </p>

      <!-- Message content -->
      <p class="whitespace-pre-wrap">{{ message.content }}</p>

      <!-- Timestamp -->
      <p
        class="text-xs mt-1"
        :class="{
          'text-blue-100': isUser,
          'text-gray-400': !isUser,
        }"
      >
        {{ formatTime(message.created_at) }}
      </p>
    </div>

    <!-- Avatar (user) -->
    <Avatar
      v-if="isUser"
      :label="avatarLabel"
      shape="circle"
      class="text-white flex-shrink-0"
      :class="avatarClass"
    />
  </div>
</template>
