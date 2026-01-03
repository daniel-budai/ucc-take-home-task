import { computed, type ComputedRef } from 'vue'
import type { Message } from '@/types'

export interface AvatarProps {
  label: ComputedRef<string>
  class: ComputedRef<string>
  showAvatar: ComputedRef<boolean>
}

export function useMessageAvatar(message: Message): AvatarProps {
  const label = computed(() => {
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

  const showAvatar = computed(() => message.type !== 'user')

  return {
    label,
    class: avatarClass,
    showAvatar,
  }
}
