import { computed, type ComputedRef } from 'vue'
import type { Message } from '@/types'
import { useMessageType } from './useMessageType'

export interface MessageDisplayProps {
  variant: ComputedRef<'user' | 'other'>
  showAsSystem: ComputedRef<boolean>
  justifyClass: ComputedRef<string>
}

export function useMessageDisplay(message: Message): MessageDisplayProps {
  const { isUser, isSystem } = useMessageType(message)

  const variant = computed(() => isUser.value ? 'user' : 'other')

  const showAsSystem = computed(() => isSystem.value)

  const justifyClass = computed(() =>
    isUser.value ? 'justify-end' : 'justify-start'
  )

  return {
    variant,
    showAsSystem,
    justifyClass,
  }
}
