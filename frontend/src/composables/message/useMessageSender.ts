import { computed, type ComputedRef } from 'vue'
import type { Message } from '@/types'

export interface SenderProps {
  label: ComputedRef<string | undefined>
  type: ComputedRef<'ai' | 'agent' | undefined>
}

export function useMessageSender(message: Message): SenderProps {
  const label = computed(() => {
    switch (message.type) {
      case 'ai':
        return 'AI Assistant'
      case 'agent':
        return 'Support Agent'
      default:
        return undefined
    }
  })

  const type = computed(() => {
    switch (message.type) {
      case 'ai':
        return 'ai' as const
      case 'agent':
        return 'agent' as const
      default:
        return undefined
    }
  })

  return {
    label,
    type,
  }
}
