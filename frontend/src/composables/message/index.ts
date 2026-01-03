// Re-export all message-related composables
// Usage: import { useMessage, useMessageType } from '@/composables/message'

export { useMessage } from './useMessage'
export { useMessageType } from './useMessageType'
export { useMessageAvatar } from './useMessageAvatar'
export { useMessageSender } from './useMessageSender'
export { useMessageDisplay } from './useMessageDisplay'

// Re-export types
export type { MessageProps } from './useMessage'
export type { MessageTypeInfo } from './useMessageType'
export type { AvatarProps } from './useMessageAvatar'
export type { SenderProps } from './useMessageSender'
export type { MessageDisplayProps } from './useMessageDisplay'

