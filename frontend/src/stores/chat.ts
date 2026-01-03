import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { helpdeskApi } from '@/api/helpdesk'
import { useNotification } from '@/composables/useNotification'
import { handleApiError } from '@/utils/errorHandler'
import type { Chat, Message, CreateChatPayload, SendMessagePayload } from '@/types'

export const useChatStore = defineStore('chat', () => {
  const chats = ref<Chat[]>([])
  const currentChat = ref<Chat | null>(null)
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const sendingMessage = ref(false)

  const sortedChats = computed(() => {
    return [...chats.value]
      .map((chat) => ({
        ...chat,
        _sortTimestamp: new Date(chat.created_at).getTime(),
      }))
      .sort((a, b) => b._sortTimestamp - a._sortTimestamp)
      .map(({ _sortTimestamp, ...chat }) => chat)
  })

  async function fetchChats() {
    const { showErrorWithRecovery } = useNotification()
    loading.value = true
    try {
      const { data } = await helpdeskApi.listChats()
      chats.value = data
    } catch (err) {
      const appError = handleApiError(err, {
        operation: 'fetchChats',
        retry: fetchChats,
      })
      showErrorWithRecovery(appError)
    } finally {
      loading.value = false
    }
  }

  async function fetchChat(id: number) {
    const { showErrorWithRecovery } = useNotification()
    loading.value = true
    try {
      const { data } = await helpdeskApi.getChat(id)
      currentChat.value = data
      messages.value = data.messages || []
    } catch (err) {
      const appError = handleApiError(err, {
        operation: 'fetchChat',
        retry: () => fetchChat(id),
      })
      showErrorWithRecovery(appError)
    } finally {
      loading.value = false
    }
  }

  async function createChat(payload: CreateChatPayload) {
    const { success, showErrorWithRecovery } = useNotification()
    try {
      const { data } = await helpdeskApi.createChat(payload)
      chats.value.unshift(data)
      currentChat.value = data
      success('Chat started!')
      return data
    } catch (err) {
      const appError = handleApiError(err, {
        operation: 'createChat',
        retry: () => createChat(payload),
      })
      showErrorWithRecovery(appError)
      throw appError
    }
  }

  async function sendMessage(content: string) {
    if (!currentChat.value) return
    const { showErrorWithRecovery } = useNotification()

    sendingMessage.value = true
    try {
      const payload: SendMessagePayload = { content }
      const { data } = await helpdeskApi.sendMessage(currentChat.value.id, payload)
      messages.value.push(data)
      return data
    } catch (err) {
      const appError = handleApiError(err, {
        operation: 'sendMessage',
        retry: () => sendMessage(content),
      })
      showErrorWithRecovery(appError)
      throw appError
    } finally {
      sendingMessage.value = false
    }
  }

  function addMessage(message: Message) {
    if (!messages.value.find((m) => m.id === message.id)) {
      messages.value.push(message)
    }
  }

  function selectChat(chat: Chat) {
    currentChat.value = chat
    fetchChat(chat.id)
  }

  function $reset() {
    chats.value = []
    currentChat.value = null
    messages.value = []
    loading.value = false
    sendingMessage.value = false
  }

  return {
    chats: sortedChats,
    currentChat,
    messages,
    loading,
    sendingMessage,
    fetchChats,
    fetchChat,
    createChat,
    sendMessage,
    addMessage,
    selectChat,
    $reset,
  }
})

