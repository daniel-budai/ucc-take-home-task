<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { useChatChannel } from '@/composables/useChatChannel'
import { createChatSchema } from '@/types/chat'
import { VALIDATION_LIMITS } from '@/utils/constants'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import ChatList from '@/components/helpdesk/ChatList.vue'
import ChatWindow from '@/components/helpdesk/ChatWindow.vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

const chatStore = useChatStore()
const { chats, currentChat, messages, loading, sendingMessage } = storeToRefs(chatStore)

useChatChannel(currentChat, chatStore.addMessage)

const showNewChatDialog = ref(false)
const newChatSubject = ref('')
const newChatMessage = ref('')
const creatingChat = ref(false)
const formErrors = ref<{ subject?: string; message?: string }>({})

const subjectCount = computed(() => newChatSubject.value.length)
const messageCount = computed(() => newChatMessage.value.length)
const subjectRemaining = computed(() => VALIDATION_LIMITS.SUBJECT.MAX_LENGTH - subjectCount.value)
const messageRemaining = computed(() => VALIDATION_LIMITS.MESSAGE.MAX_LENGTH - messageCount.value)

const isFormValid = computed(() => {
  const result = createChatSchema.safeParse({
    subject: newChatSubject.value.trim(),
    message: newChatMessage.value.trim(),
  })
  return result.success
})

function validateForm(): boolean {
  const result = createChatSchema.safeParse({
    subject: newChatSubject.value.trim(),
    message: newChatMessage.value.trim(),
  })

  if (!result.success) {
    formErrors.value = {}
    result.error.errors.forEach((error) => {
      const field = error.path[0] as string
      if (field && !formErrors.value[field as keyof typeof formErrors.value]) {
        formErrors.value[field as keyof typeof formErrors.value] = error.message
      }
    })
    return false
  }

  formErrors.value = {}
  return true
}

onMounted(() => {
  chatStore.fetchChats()
})

async function handleCreateChat(): Promise<void> {
  if (!validateForm()) {
    return
  }

  creatingChat.value = true
  try {
    const result = createChatSchema.parse({
      subject: newChatSubject.value.trim(),
      message: newChatMessage.value.trim(),
    })

    const chat = await chatStore.createChat(result)
    if (chat) {
      await chatStore.fetchChat(chat.id)
    }
    showNewChatDialog.value = false
    newChatSubject.value = ''
    newChatMessage.value = ''
    formErrors.value = {}
  } finally {
    creatingChat.value = false
  }
}

function handleSendMessage(content: string) {
  chatStore.sendMessage(content)
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
            @select="chatStore.selectChat"
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
            :maxlength="VALIDATION_LIMITS.SUBJECT.MAX_LENGTH"
            placeholder="What do you need help with?"
            class="w-full"
            :class="{ 'p-invalid': formErrors.subject }"
            @blur="validateForm"
          />
          <div class="flex justify-between items-center">
            <small v-if="formErrors.subject" class="text-red-500">
              {{ formErrors.subject }}
            </small>
            <small
              v-else-if="newChatSubject"
              class="text-gray-500"
              :class="{
                'text-orange-500': subjectRemaining < 50 && subjectCount <= VALIDATION_LIMITS.SUBJECT.MAX_LENGTH,
                'text-red-500': subjectCount > VALIDATION_LIMITS.SUBJECT.MAX_LENGTH,
              }"
            >
              {{ subjectCount }} / {{ VALIDATION_LIMITS.SUBJECT.MAX_LENGTH }} characters
            </small>
            <span v-else></span>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="message" class="font-medium">Message</label>
          <Textarea
            id="message"
            v-model="newChatMessage"
            :maxlength="VALIDATION_LIMITS.MESSAGE.MAX_LENGTH"
            rows="4"
            placeholder="Describe your issue or question..."
            class="w-full"
            :class="{ 'p-invalid': formErrors.message }"
            @blur="validateForm"
          />
          <div class="flex justify-between items-center">
            <small v-if="formErrors.message" class="text-red-500">
              {{ formErrors.message }}
            </small>
            <small
              v-else-if="newChatMessage"
              class="text-gray-500"
              :class="{
                'text-orange-500': messageRemaining < 100 && messageCount <= VALIDATION_LIMITS.MESSAGE.MAX_LENGTH,
                'text-red-500': messageCount > VALIDATION_LIMITS.MESSAGE.MAX_LENGTH,
              }"
            >
              {{ messageCount }} / {{ VALIDATION_LIMITS.MESSAGE.MAX_LENGTH }} characters
            </small>
            <span v-else></span>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <Button label="Cancel" severity="secondary" outlined @click="showNewChatDialog = false" />
          <Button
            label="Start Chat"
            icon="pi pi-send"
            :loading="creatingChat"
            :disabled="!isFormValid"
            @click="handleCreateChat"
          />
        </div>
      </div>
    </Dialog>
  </DefaultLayout>
</template>
