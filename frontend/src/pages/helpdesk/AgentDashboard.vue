<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatAgentStore } from '@/stores/chatAgent'
import { useChatChannel } from '@/composables/useChatChannel'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import ChatList from '@/components/helpdesk/ChatList.vue'
import ChatWindow from '@/components/helpdesk/ChatWindow.vue'
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import type { Chat } from '@/types'

const chatAgentStore = useChatAgentStore()
const { unassignedChats, myChats, resolvedChats, currentChat, messages, loading } =
  storeToRefs(chatAgentStore)

// Subscribe to real-time chat updates
useChatChannel(currentChat, chatAgentStore.addMessage)

const sendingMessage = ref(false)

onMounted(() => {
  chatAgentStore.fetchAgentChats()
  chatAgentStore.fetchUnassigned()
})

async function handleAssign() {
  if (!currentChat.value) return
  await chatAgentStore.assignChat(currentChat.value.id)
}

async function handleResolve() {
  if (!currentChat.value) return
  await chatAgentStore.resolveChat(currentChat.value.id)
}

async function handleSendReply(content: string) {
  sendingMessage.value = true
  try {
    await chatAgentStore.replyToChat(content)
  } finally {
    sendingMessage.value = false
  }
}

function handleSelectChat(chat: Chat) {
  chatAgentStore.selectChat(chat)
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
