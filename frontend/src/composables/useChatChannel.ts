import { watch, onUnmounted, type Ref } from 'vue'
import { getEcho } from '@/utils/echo'
import type { Chat, Message } from '@/types'

/**
 * Composable for managing WebSocket channel subscriptions for chat
 *
 * Automatically subscribes to the chat channel when the chat changes
 * and cleans up subscriptions when the component unmounts or chat changes.
 *
 * @param chatRef - Reactive reference to the current chat
 * @param onMessage - Callback function when a new message is received
 *
 * @example
 * const { currentChat, addMessage } = useChat()
 * useChatChannel(currentChat, addMessage)
 */
export function useChatChannel(
  chatRef: Ref<Chat | null>,
  onMessage: (message: Message) => void
): void {
  let currentChannelId: number | null = null

  watch(
    chatRef,
    (newChat, oldChat) => {
      const echo = getEcho()

      if (oldChat && currentChannelId === oldChat.id) {
        echo.leave(`chat.${oldChat.id}`)
        currentChannelId = null
      }

      if (newChat) {
        currentChannelId = newChat.id
        echo
          .private(`chat.${newChat.id}`)
          .listen('.message.sent', (e: { message: Message }) => {
            onMessage(e.message)
          })
      }
    },
    { immediate: true }
  )

  onUnmounted(() => {
    if (currentChannelId) {
      const echo = getEcho()
      echo.leave(`chat.${currentChannelId}`)
      currentChannelId = null
    }
  })
}

