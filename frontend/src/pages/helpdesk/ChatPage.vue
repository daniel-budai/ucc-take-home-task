<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useChat } from '@/composables/useChat'
import { getEcho } from '@/utils/echo'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import ChatList from '@/components/helpdesk/ChatList.vue'
import ChatWindow from '@/components/helpdesk/ChatWindow.vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import type { Message } from '@/types'

const {
  chats,
  currentChat,
  messages,
  loading,
  sendingMessage,
  fetchChats,
  fetchChat,
  createChat,
  sendMessage,
  selectChat,
  addMessage,
} = useChat()

const showNewChatDialog = ref(false)
const newChatSubject = ref('')
const newChatMessage = ref('')
const creatingChat = ref(false)

// Track the current channel subscription
let currentChannelId: number | null = null

// Subscribe to chat channel for real-time updates
watch(
  currentChat,
  (newChat, oldChat) => {
    const echo = getEcho()

    // Leave old channel
    if (oldChat && currentChannelId === oldChat.id) {
      console.log('[Chat] Leaving channel:', `chat.${oldChat.id}`)
      echo.leave(`chat.${oldChat.id}`)
      currentChannelId = null
    }

    // Join new channel
    if (newChat) {
      currentChannelId = newChat.id
      console.log('[Chat] Subscribing to channel:', `chat.${newChat.id}`)
      echo
        .private(`chat.${newChat.id}`)
        .listen('.message.sent', (e: { message: Message }) => {
          console.log('[Chat] Received message:', e)
          addMessage(e.message)
        })
        .error((error: unknown) => {
          console.error('[Chat] Channel subscription error:', error)
        })
    }
  },
  { immediate: true }
)

onMounted(() => {
  fetchChats()
})

onUnmounted(() => {
  // Clean up channel subscription
  if (currentChannelId) {
    const echo = getEcho()
    echo.leave(`chat.${currentChannelId}`)
  }
})

async function handleCreateChat() {
  if (!newChatSubject.value.trim() || !newChatMessage.value.trim()) return

  creatingChat.value = true
  try {
    const chat = await createChat({
      subject: newChatSubject.value,
      message: newChatMessage.value,
    })
    if (chat) {
      await fetchChat(chat.id)
    }
    showNewChatDialog.value = false
    newChatSubject.value = ''
    newChatMessage.value = ''
  } finally {
    creatingChat.value = false
  }
}

function handleSendMessage(content: string) {
  sendMessage(content)
}
</script>

<template>
  <DefaultLayout>
    <div class="bg-white rounded-lg shadow-sm h-[calc(100vh-12rem)]">
      <div class="flex h-full">
        <!-- Chat List Sidebar -->
        <div class="w-80 flex-shrink-0 flex flex-col">
          <div class="p-4 border-b border-gray-200">
            <Button
              label="New Chat"
              icon="pi pi-plus"
              class="w-full"
              @click="showNewChatDialog = true"
            />
          </div>
          <ChatList
            :chats="chats"
            :selected-chat="currentChat"
            :loading="loading"
            @select="selectChat"
          />
        </div>

        <!-- Chat Window -->
        <div class="flex-1">
          <ChatWindow
            :chat="currentChat"
            :messages="messages"
            :sending="sendingMessage"
            @send="handleSendMessage"
          />
        </div>
      </div>
    </div>

    <!-- New Chat Dialog -->
    <Dialog
      v-model:visible="showNewChatDialog"
      header="Start New Chat"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="space-y-4">
        <div class="flex flex-col gap-2">
          <label for="subject" class="font-medium">Subject</label>
          <InputText
            id="subject"
            v-model="newChatSubject"
            placeholder="What do you need help with?"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="message" class="font-medium">Message</label>
          <Textarea
            id="message"
            v-model="newChatMessage"
            rows="4"
            placeholder="Describe your issue or question..."
            class="w-full"
          />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <Button label="Cancel" severity="secondary" outlined @click="showNewChatDialog = false" />
          <Button
            label="Start Chat"
            icon="pi pi-send"
            :loading="creatingChat"
            :disabled="!newChatSubject.trim() || !newChatMessage.trim()"
            @click="handleCreateChat"
          />
        </div>
      </div>
    </Dialog>
  </DefaultLayout>
</template>






