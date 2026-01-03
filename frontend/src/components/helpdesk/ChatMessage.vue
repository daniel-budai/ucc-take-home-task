<script setup lang="ts">
import type { Message } from '@/types'
import { formatTime } from '@/utils/date'
import Avatar from 'primevue/avatar'
import MessageBubble from '@/components/helpdesk/MessageBubble.vue'
import { useMessage } from '@/composables/message'

const props = defineProps<{
  message: Message
}>()

// Use the composable to get all message-related computed properties
const {
  isUser,
  avatarLabel,
  avatarClass,
  showAvatar,
  senderLabel,
  senderType,
  variant,
  showAsSystem,
  justifyClass,
} = useMessage(props.message)
</script>

<template>
  <!-- System message -->
  <div v-if="showAsSystem" class="text-center">
    <span class="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
      {{ props.message.content }}
    </span>
  </div>

  <!-- Regular message -->
  <div
    v-else
    class="flex gap-3"
    :class="justifyClass"
  >
    <!-- Avatar (non-user messages) -->
    <Avatar
      v-if="showAvatar"
      :label="avatarLabel"
      shape="circle"
      class="text-white shrink-0"
      :class="avatarClass"
    />

    <!-- Message bubble -->
    <MessageBubble
      :variant="variant"
      :content="props.message.content"
      :timestamp="formatTime(props.message.created_at)"
      :sender-label="senderLabel"
      :sender-type="senderType"
    />

    <!-- Avatar (user messages) -->
    <Avatar
      v-if="isUser"
      :label="avatarLabel"
      shape="circle"
      class="text-white shrink-0"
      :class="avatarClass"
    />
  </div>
</template>