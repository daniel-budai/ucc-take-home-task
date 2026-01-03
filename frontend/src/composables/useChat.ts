import { ref, computed } from 'vue'
import { helpdeskApi } from '@/api/helpdesk'
import { useNotification } from '@/composables/useNotification'
import type { Chat, Message, CreateChatPayload, SendMessagePayload } from '@/types'

export function useChat() {
  // State
  const chats = ref<Chat[]>([])
  const currentChat = ref<Chat | null>(null)
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const sendingMessage = ref(false)

  // Computed
  const sortedChats = computed(() =>
    [...chats.value].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  )

  const activeChats = computed(() =>
    sortedChats.value.filter((c) => c.status !== 'resolved' && c.status !== 'closed')
  )

  // Dependencies
  const { success, error } = useNotification()

  // Actions
  async function fetchChats() {
    loading.value = true
    try {
      const response = await helpdeskApi.listChats()
      // Laravel Resource collections wrap data in { data: [...] }
      const responseData = response.data as { data?: Chat[] } | Chat[]
      chats.value = Array.isArray(responseData) ? responseData : (responseData.data || [])
    } catch {
      error('Failed to load chats')
    } finally {
      loading.value = false
    }
  }

  async function fetchChat(id: number) {
    loading.value = true
    try {
      const response = await helpdeskApi.getChat(id)
      // Laravel Resources wrap single items in { data: {...} }
      const responseData = response.data as { data?: Chat } | Chat
      const chatData = ('data' in responseData && responseData.data) ? responseData.data : responseData as Chat
      currentChat.value = chatData
      messages.value = chatData.messages || []
    } catch {
      error('Failed to load chat')
    } finally {
      loading.value = false
    }
  }

  async function createChat(payload: CreateChatPayload) {
    const response = await helpdeskApi.createChat(payload)
    // Laravel wraps single resources with additional() in { data: {...}, message: "..." }
    const chatData = ((response.data as { data?: Chat }).data || response.data) as Chat
    chats.value.unshift(chatData)
    currentChat.value = chatData
    success('Chat started!')
    return chatData
  }

  async function sendMessage(content: string) {
    if (!currentChat.value) return

    sendingMessage.value = true
    try {
      const payload: SendMessagePayload = { content }
      const response = await helpdeskApi.sendMessage(currentChat.value.id, payload)
      // Laravel Resources wrap single items in { data: {...} }
      const responseData = response.data as { data?: Message } | Message
      const messageData = ('data' in responseData && responseData.data) ? responseData.data : responseData as Message
      messages.value.push(messageData)
      return messageData
    } catch {
      error('Failed to send message')
    } finally {
      sendingMessage.value = false
    }
  }

  function addMessage(message: Message) {
    // For real-time updates via WebSocket
    if (!messages.value.find((m) => m.id === message.id)) {
      messages.value.push(message)
    }
  }

  function selectChat(chat: Chat) {
    currentChat.value = chat
    fetchChat(chat.id)
  }

  return {
    // State
    chats: sortedChats,
    activeChats,
    currentChat,
    messages,
    loading,
    sendingMessage,
    // Actions
    fetchChats,
    fetchChat,
    createChat,
    sendMessage,
    addMessage,
    selectChat,
  }
}






