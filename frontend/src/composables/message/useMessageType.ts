import { computed, type ComputedRef } from 'vue'
import type { Message, MessageType } from '@/types'

export interface MessageTypeInfo {
  isUser: ComputedRef<boolean>
  isAi: ComputedRef<boolean>
  isAgent: ComputedRef<boolean>
  isSystem: ComputedRef<boolean>
  type: ComputedRef<MessageType>
}

export function useMessageType(message: Message): MessageTypeInfo {
  const type = computed(() => message.type)

  const isUser = computed(() => type.value === 'user')
  const isAi = computed(() => type.value === 'ai')
  const isAgent = computed(() => type.value === 'agent')
  const isSystem = computed(() => type.value === 'system')

  return {
    isUser,
    isAi,
    isAgent,
    isSystem,
    type,
  }
}
