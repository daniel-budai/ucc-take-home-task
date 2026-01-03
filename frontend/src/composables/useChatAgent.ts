import { ref, computed } from 'vue'
import { helpdeskApi } from '@/api/helpdesk'
import { useNotification } from '@/composables/useNotification'
import type { Chat, Message, SendMessagePayload } from '@/types'

export function useChatAgent() {
  // State
  const chats = ref<Chat[]>([])
  const unassignedChats = ref<Chat[]>([])
  const currentChat = ref<Chat | null>(null)
  const messages = ref<Message[]>([])
  const loading = ref(false)

  // Computed
  const myChats = computed(() =>
    chats.value.filter((c) => c.status === 'agent_handling' || c.status === 'transferred')
  )

  const resolvedChats = computed(() => chats.value.filter((c) => c.status === 'resolved'))

  // Dependencies
  const { success, error } = useNotification()

  // Actions
  async function fetchAgentChats() {
    loading.value = true
    try {
      const { data } = await helpdeskApi.listAgentChats()
      chats.value = data
    } catch {
      error('Failed to load chats')
    } finally {
      loading.value = false
    }
  }

  async function fetchUnassigned() {
    try {
      const { data } = await helpdeskApi.listUnassigned()
      unassignedChats.value = data
    } catch {
      error('Failed to load unassigned chats')
    }
  }

  async function assignChat(chatId: number) {
    try {
      const response = await helpdeskApi.assignChat(chatId)
      // Laravel wraps single resources with additional() in { data: {...}, message: "..." }
      const chatData = ((response.data as { data?: Chat }).data || response.data) as Chat
      // Move from unassigned to my chats
      unassignedChats.value = unassignedChats.value.filter((c) => c.id !== chatId)
      chats.value.push(chatData)
      currentChat.value = chatData
      success('Chat assigned to you!')
      return chatData
    } catch {
      error('Failed to assign chat')
    }
  }

  async function replyToChat(content: string) {
    if (!currentChat.value) return

    try {
      const payload: SendMessagePayload = { content }
      const { data } = await helpdeskApi.replyToChat(currentChat.value.id, payload)
      messages.value.push(data)
      return data
    } catch {
      error('Failed to send reply')
    }
  }

  async function resolveChat(chatId: number) {
    try {
      const response = await helpdeskApi.resolveChat(chatId)
      // Laravel wraps single resources with additional() in { data: {...}, message: "..." }
      const chatData = ((response.data as { data?: Chat }).data || response.data) as Chat
      const index = chats.value.findIndex((c) => c.id === chatId)
      if (index !== -1) {
        chats.value[index] = chatData
      }
      if (currentChat.value?.id === chatId) {
        currentChat.value = chatData
      }
      success('Chat resolved!')
      return chatData
    } catch {
      error('Failed to resolve chat')
    }
  }

  function selectChat(chat: Chat) {
    currentChat.value = chat
    messages.value = chat.messages || []
  }

  return {
    // State
    chats,
    unassignedChats,
    myChats,
    resolvedChats,
    currentChat,
    messages,
    loading,
    // Actions
    fetchAgentChats,
    fetchUnassigned,
    assignChat,
    replyToChat,
    resolveChat,
    selectChat,
  }
}






