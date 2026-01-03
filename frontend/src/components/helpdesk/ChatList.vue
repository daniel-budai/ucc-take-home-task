<script setup lang="ts">
import type { Chat } from '@/types'
import { formatRelative } from '@/utils/date'
import { CHAT_STATUS_LABELS, CHAT_STATUS_COLORS } from '@/utils/constants'
import Tag from 'primevue/tag'

const props = defineProps<{
  chats: Chat[]
  selectedChat?: Chat | null
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [chat: Chat]
}>()
</script>

<template>
  <div class="border-r border-gray-200 h-full overflow-y-auto">
    <div v-if="props.loading" class="p-4 text-center text-gray-500">
      <i class="pi pi-spin pi-spinner"></i>
      Loading chats...
    </div>

    <div v-else-if="props.chats.length === 0" class="p-4 text-center text-gray-500">
      <i class="pi pi-comments text-3xl mb-2"></i>
      <p>No conversations yet</p>
    </div>

    <ul v-else class="divide-y divide-gray-200">
      <li
        v-for="chat in props.chats"
        :key="chat.id"
        class="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        :class="{ 'bg-primary-50': props.selectedChat?.id === chat.id }"
        @click="emit('select', chat)"
      >
        <div class="flex justify-between items-start mb-1">
          <span class="font-medium text-gray-800 truncate">{{ chat.subject }}</span>
          <Tag
            :value="CHAT_STATUS_LABELS[chat.status] || chat.status"
            :severity="
              (CHAT_STATUS_COLORS[chat.status] as
                | 'info'
                | 'success'
                | 'warning'
                | 'danger'
                | 'secondary'
                | 'contrast'
                | undefined) || 'info'
            "
            class="text-xs"
          />
        </div>
        <p class="text-sm text-gray-500">{{ formatRelative(chat.created_at) }}</p>
      </li>
    </ul>
  </div>
</template>
