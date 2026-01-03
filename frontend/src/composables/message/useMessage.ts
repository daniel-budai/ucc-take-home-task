import type { Message } from '@/types'
import { useMessageType } from './useMessageType'
import { useMessageAvatar } from './useMessageAvatar'
import { useMessageSender } from './useMessageSender'
import { useMessageDisplay } from './useMessageDisplay'

export type MessageProps = Pick<
  ReturnType<typeof useMessageType>,
  'isUser' | 'isSystem'
> & {
  avatarLabel: ReturnType<typeof useMessageAvatar>['label']
  avatarClass: ReturnType<typeof useMessageAvatar>['class']
  showAvatar: ReturnType<typeof useMessageAvatar>['showAvatar']
} & {
  senderLabel: ReturnType<typeof useMessageSender>['label']
  senderType: ReturnType<typeof useMessageSender>['type']
} &
  ReturnType<typeof useMessageDisplay>

export function useMessage(message: Message): MessageProps {
  const typeInfo = useMessageType(message)
  const avatarInfo = useMessageAvatar(message)
  const senderInfo = useMessageSender(message)
  const displayInfo = useMessageDisplay(message)

  return {
    isUser: typeInfo.isUser,
    isSystem: typeInfo.isSystem,
    avatarLabel: avatarInfo.label,
    avatarClass: avatarInfo.class,
    showAvatar: avatarInfo.showAvatar,
    senderLabel: senderInfo.label,
    senderType: senderInfo.type,
    variant: displayInfo.variant,
    showAsSystem: displayInfo.showAsSystem,
    justifyClass: displayInfo.justifyClass,
  }
}
