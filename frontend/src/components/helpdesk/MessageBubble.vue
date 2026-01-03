<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant: 'user' | 'other'
  content: string
  timestamp: string
  senderLabel?: string
  senderType?: 'ai' | 'agent'
}

const props = defineProps<Props>()

const bubbleClass = computed(() =>
  props.variant === 'user'
    ? 'bg-blue-500 text-white'
    : 'bg-white border border-gray-200'
)

const timestampClass = computed(() =>
  props.variant === 'user' ? 'text-blue-100' : 'text-gray-400'
)

const senderClass = computed(() =>
  props.senderType === 'ai' ? 'text-purple-600' : 'text-green-600'
)
</script>

<template>
  <div class="max-w-[70%] rounded-lg px-4 py-2" :class="bubbleClass">
    <!-- Sender label for AI/Agent -->
    <p v-if="senderLabel" class="text-xs font-medium mb-1" :class="senderClass">
      {{ senderLabel }}
    </p>

    <!-- Message content -->
    <p class="whitespace-pre-wrap">{{ content }}</p>

    <!-- Timestamp -->
    <p class="text-xs mt-1" :class="timestampClass">
      {{ timestamp }}
    </p>
  </div>
</template>
