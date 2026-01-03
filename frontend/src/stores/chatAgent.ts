import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { helpdeskApi } from '@/api/helpdesk'
import { useNotification } from '@/composables/useNotification'
import { handleApiError } from '@/utils/errorHandler'
import type { Chat, Message, SendMessagePayload } from '@/types'
import type { AppError } from '@/utils/errorHandler'

export const useChatAgentStore = defineStore('chatAgent', () => {
  const chats = ref<Chat[]>([])
  const unassignedChats = ref<Chat[]>([])
  const currentChat = ref<Chat | null>(null)
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const error = ref<AppError | null>(null)

  const actionLoading = ref({
    fetchAgentChats: false,
    fetchUnassigned: false,
    assignChat: false,
    replyToChat: false,
    resolveChat: false,
  })

  const myChats = computed(() =>
    chats.value.filter((c) => c.status === 'agent_handling' || c.status === 'transferred')
  )

  const resolvedChats = computed(() => chats.value.filter((c) => c.status === 'resolved'))

  async function fetchAgentChats() {
    const { showErrorWithRecovery } = useNotification()
    actionLoading.value.fetchAgentChats = true
    error.value = null
    try {
      const { data } = await helpdeskApi.listAgentChats()
      chats.value = data
    } catch (err) {
      const appError = handleApiError(err, {
        operation: 'fetchAgentChats',
        retry: fetchAgentChats,
      })
      error.value = appError
      showErrorWithRecovery(appError)
    } finally {
      actionLoading.value.fetchAgentChats = false
    }
  }

  async function fetchUnassigned() {
    const { showErrorWithRecovery } = useNotification()
    actionLoading.value.fetchUnassigned = true
    error.value = null
    try {
      const { data } = await helpdeskApi.listUnassigned()
      unassignedChats.value = data
    } catch (err) {
      const appError = handleApiError(err, {
        operation: 'fetchUnassigned',
        retry: fetchUnassigned,
      })
      error.value = appError
      showErrorWithRecovery(appError)
    } finally {
      actionLoading.value.fetchUnassigned = false
    }
  }

  async function assignChat(chatId: number) {
    const { success, showErrorWithRecovery } = useNotification()
    actionLoading.value.assignChat = true
    error.value = null

    const originalUnassigned = [...unassignedChats.value]

    try {
      const { data } = await helpdeskApi.assignChat(chatId)
      unassignedChats.value = unassignedChats.value.filter((c) => c.id !== chatId)
      chats.value.push(data)
      currentChat.value = data
      messages.value = data.messages || []
      success('Chat assigned to you!')
      return data
    } catch (err) {
      const appError = handleApiError(err, {
        operation: 'assignChat',
        retry: () => assignChat(chatId),
      })
      error.value = appError
      showErrorWithRecovery(appError)
      unassignedChats.value = originalUnassigned
      throw appError
    } finally {
      actionLoading.value.assignChat = false
    }
  }

  async function replyToChat(content: string) {
    if (!currentChat.value) return
    const { showErrorWithRecovery } = useNotification()
    actionLoading.value.replyToChat = true
    error.value = null

    try {
      const payload: SendMessagePayload = { content }
      const { data } = await helpdeskApi.replyToChat(currentChat.value.id, payload)
      messages.value.push(data)
      return data
    } catch (err) {
      const appError = handleApiError(err, {
        operation: 'replyToChat',
        retry: () => replyToChat(content),
      })
      error.value = appError
      showErrorWithRecovery(appError)
      throw appError
    } finally {
      actionLoading.value.replyToChat = false
    }
  }

  async function resolveChat(chatId: number) {
    const { success, showErrorWithRecovery } = useNotification()
    actionLoading.value.resolveChat = true
    error.value = null

    const originalChats = [...chats.value]
    const originalCurrentChat = currentChat.value

    try {
      const { data } = await helpdeskApi.resolveChat(chatId)
      const index = chats.value.findIndex((c) => c.id === chatId)
      if (index !== -1) {
        chats.value[index] = data
      }
      if (currentChat.value?.id === chatId) {
        currentChat.value = data
      }
      success('Chat resolved!')
      return data
    } catch (err) {
      const appError = handleApiError(err, {
        operation: 'resolveChat',
        retry: () => resolveChat(chatId),
      })
      error.value = appError
      showErrorWithRecovery(appError)
      chats.value = originalChats
      currentChat.value = originalCurrentChat
      throw appError
    } finally {
      actionLoading.value.resolveChat = false
    }
  }

  async function selectChat(chat: Chat) {
    const { showErrorWithRecovery } = useNotification()
    error.value = null

    currentChat.value = chat
    messages.value = chat.messages || []

    if (!chat.messages || chat.messages.length === 0) {
      try {
        const { data } = await helpdeskApi.getAgentChat(chat.id)
        currentChat.value = data
        messages.value = data.messages || []
      } catch (err) {
        const appError = handleApiError(err, {
          operation: 'selectChat',
          retry: () => selectChat(chat),
        })
        error.value = appError
        showErrorWithRecovery(appError)
      }
    }
  }

  function addMessage(message: Message) {
    if (!messages.value.find((m) => m.id === message.id)) {
      messages.value.push(message)
    }
  }

  function $reset() {
    chats.value = []
    unassignedChats.value = []
    currentChat.value = null
    messages.value = []
    loading.value = false
  }

  return {
    chats,
    unassignedChats,
    myChats,
    resolvedChats,
    currentChat,
    messages,
    loading,
    error,
    actionLoading,
    fetchAgentChats,
    fetchUnassigned,
    assignChat,
    replyToChat,
    resolveChat,
    selectChat,
    addMessage,
    $reset,
  }
})

