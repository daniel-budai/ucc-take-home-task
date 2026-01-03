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
      // Laravel Resource collections wrap arrays in { data: [...] }
      chats.value = Array.isArray(data) ? data : (data as { data: Chat[] }).data || []
    } catch {
      error('Failed to load chats')
    } finally {
      loading.value = false
    }
  }

  async function fetchUnassigned() {
    try {
      const { data } = await helpdeskApi.listUnassigned()
      // Laravel Resource collections wrap arrays in { data: [...] }
      unassignedChats.value = Array.isArray(data) ? data : (data as { data: Chat[] }).data || []
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
      // Set messages from the chat data
      messages.value = chatData.messages || []
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
      const response = await helpdeskApi.replyToChat(currentChat.value.id, payload)
      // Laravel Resources wrap single items in { data: {...} }
      const messageData = ((response.data as { data?: Message }).data || response.data) as Message
      messages.value.push(messageData)
      return messageData
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

  async function selectChat(chat: Chat) {
    // Set the chat immediately for UI responsiveness
    currentChat.value = chat
    messages.value = chat.messages || []
    
    // Fetch full chat with messages if not already loaded
    if (!chat.messages || chat.messages.length === 0) {
      try {
        const response = await helpdeskApi.getAgentChat(chat.id)
        // Laravel Resources wrap single items in { data: {...} }
        const chatData = ((response.data as { data?: Chat }).data || response.data) as Chat
        currentChat.value = chatData
        messages.value = chatData.messages || []
      } catch {
        error('Failed to load chat messages')
      }
    }
  }

  function addMessage(message: Message) {
    // For real-time updates via WebSocket
    if (!messages.value.find((m) => m.id === message.id)) {
      messages.value.push(message)
    }
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
    addMessage,
  }
}






