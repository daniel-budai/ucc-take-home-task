<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEvents } from '@/composables/useEvents'
import { useConfirmDialog } from '@/composables/useConfirm'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import EventList from '@/components/events/EventList.vue'
import EventForm from '@/components/events/EventForm.vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import type { Event, CreateEventPayload } from '@/types'

const { events, loading, fetchEvents, createEvent, updateEvent, deleteEvent } = useEvents()
const { confirmDelete } = useConfirmDialog()

const showDialog = ref(false)
const selectedEvent = ref<Event | null>(null)
const formLoading = ref(false)
const formKey = ref(0)

onMounted(() => {
  fetchEvents()
})

function openCreateDialog() {
  selectedEvent.value = null
  formKey.value++
  showDialog.value = true
}

function openEditDialog(event: Event) {
  selectedEvent.value = event
  formKey.value++
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  selectedEvent.value = null
}

async function handleSubmit(payload: CreateEventPayload) {
  formLoading.value = true
  try {
    if (selectedEvent.value) {
      // Update (only description per requirements)
      await updateEvent(selectedEvent.value.id, {
        description: payload.description || '',
      })
    } else {
      // Create
      await createEvent(payload)
    }
    closeDialog()
  } finally {
    formLoading.value = false
  }
}

function handleDelete(event: Event) {
  confirmDelete(`Are you sure you want to delete "${event.title}"?`, async () => {
    await deleteEvent(event.id)
  })
}
</script>

<template>
  <DefaultLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Events</h1>
          <p class="text-gray-600">Manage your upcoming events</p>
        </div>
        <Button label="Create Event" icon="pi pi-plus" @click="openCreateDialog" />
      </div>

      <!-- Events Table -->
      <EventList
        :events="events"
        :loading="loading"
        @edit="openEditDialog"
        @delete="handleDelete"
      />

      <!-- Create/Edit Dialog -->
      <Dialog
        v-model:visible="showDialog"
        :header="selectedEvent ? 'Edit Event' : 'Create Event'"
        :modal="true"
        :closable="true"
        :style="{ width: '500px' }"
      >
        <EventForm
          v-if="showDialog"
          :key="formKey"
          :event="selectedEvent"
          :loading="formLoading"
          @submit="handleSubmit"
          @cancel="closeDialog"
        />
      </Dialog>
    </div>
  </DefaultLayout>
</template>


