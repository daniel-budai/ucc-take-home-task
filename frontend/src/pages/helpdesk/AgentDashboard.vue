<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useChatAgent } from '@/composables/useChatAgent'
import { getEcho } from '@/utils/echo'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import ChatList from '@/components/helpdesk/ChatList.vue'
import ChatWindow from '@/components/helpdesk/ChatWindow.vue'
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import type { Chat, Message } from '@/types'

const {
  unassignedChats,
  myChats,
  resolvedChats,
  currentChat,
  messages,
  loading,
  fetchAgentChats,
  fetchUnassigned,
  assignChat,
  replyToChat,
  resolveChat,
  selectChat,
  addMessage,
} = useChatAgent()

const sendingMessage = ref(false)

// Track the current channel subscription
let currentChannelId: number | null = null

// Subscribe to chat channel for real-time updates
watch(
  currentChat,
  (newChat, oldChat) => {
    const echo = getEcho()

    // Leave old channel
    if (oldChat && currentChannelId === oldChat.id) {
      console.log('[AgentChat] Leaving channel:', `chat.${oldChat.id}`)
      echo.leave(`chat.${oldChat.id}`)
      currentChannelId = null
    }

    // Join new channel
    if (newChat) {
      currentChannelId = newChat.id
      console.log('[AgentChat] Subscribing to channel:', `chat.${newChat.id}`)
      echo
        .private(`chat.${newChat.id}`)
        .listen('.message.sent', (e: { message: Message }) => {
          console.log('[AgentChat] Received message:', e)
          addMessage(e.message)
        })
        .error((error: unknown) => {
          console.error('[AgentChat] Channel subscription error:', error)
        })
    }
  },
  { immediate: true }
)

onMounted(() => {
  fetchAgentChats()
  fetchUnassigned()
})

onUnmounted(() => {
  // Clean up channel subscription
  if (currentChannelId) {
    const echo = getEcho()
    echo.leave(`chat.${currentChannelId}`)
  }
})

async function handleAssign() {
  if (!currentChat.value) return
  await assignChat(currentChat.value.id)
}

async function handleResolve() {
  if (!currentChat.value) return
  await resolveChat(currentChat.value.id)
}

async function handleSendReply(content: string) {
  sendingMessage.value = true
  try {
    await replyToChat(content)
  } finally {
    sendingMessage.value = false
  }
}

function handleSelectChat(chat: Chat) {
  selectChat(chat)
}
</script>

<template>
  <DefaultLayout>
    <div class="bg-white rounded-lg shadow-sm h-[calc(100vh-12rem)]">
      <div class="flex h-full">
        <!-- Chat List Sidebar with Tabs -->
        <div class="w-96 flex-shrink-0 border-r border-gray-200">
          <TabView class="h-full">
            <TabPanel value="0" header="Unassigned">
              <ChatList
                :chats="unassignedChats"
                :selected-chat="currentChat"
                :loading="loading"
                @select="handleSelectChat"
              />
            </TabPanel>
            <TabPanel value="1" header="My Chats">
              <ChatList :chats="myChats" :selected-chat="currentChat" @select="handleSelectChat" />
            </TabPanel>
            <TabPanel value="2" header="Resolved">
              <ChatList
                :chats="resolvedChats"
                :selected-chat="currentChat"
                @select="handleSelectChat"
              />
            </TabPanel>
          </TabView>
        </div>

        <!-- Chat Window -->
        <div class="flex-1 flex flex-col">
          <!-- Agent Actions -->
          <div
            v-if="currentChat"
            class="p-3 border-b border-gray-200 bg-gray-50 flex gap-2 justify-end"
          >
            <Button
              v-if="currentChat.status === 'transferred' && !currentChat.assigned_agent_id"
              label="Assign to Me"
              icon="pi pi-user-plus"
              severity="info"
              size="small"
              @click="handleAssign"
            />
            <Button
              v-if="currentChat.status === 'agent_handling'"
              label="Resolve"
              icon="pi pi-check"
              severity="success"
              size="small"
              @click="handleResolve"
            />
          </div>

          <!-- Chat -->
          <div class="flex-1">
            <ChatWindow
              :chat="currentChat"
              :messages="messages"
              :sending="sendingMessage"
              @send="handleSendReply"
            />
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>


