<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import type { Event } from '@/types'
import { formatDateTime, isPast } from '@/utils/date'

const props = defineProps<{
  events: Event[]
  loading: boolean
}>()

const emit = defineEmits<{
  edit: [event: Event]
  delete: [event: Event]
}>()

function handleEdit(event: Event) {
  emit('edit', event)
}

function handleDelete(event: Event) {
  emit('delete', event)
}
</script>

<template>
  <DataTable
    :value="props.events"
    :loading="props.loading"
    striped-rows
    paginator
    :rows="10"
    :rows-per-page-options="[5, 10, 20]"
    table-style="min-width: 50rem"
    class="shadow-sm"
  >
    <template #empty>
      <div class="text-center py-8 text-gray-500">
        <i class="pi pi-calendar text-4xl mb-2"></i>
        <p>No events found. Create your first event!</p>
      </div>
    </template>

    <Column field="title" header="Title" sortable>
      <template #body="{ data }">
        <span class="font-medium">{{ data.title }}</span>
      </template>
    </Column>

    <Column field="occurrence" header="Date & Time" sortable>
      <template #body="{ data }">
        <div class="flex items-center gap-2">
          <span>{{ formatDateTime(data.occurrence) }}</span>
          <Tag v-if="isPast(data.occurrence)" value="Past" severity="secondary" />
        </div>
      </template>
    </Column>

    <Column field="description" header="Description">
      <template #body="{ data }">
        <span class="text-gray-600 truncate max-w-xs block">
          {{ data.description || '—' }}
        </span>
      </template>
    </Column>

    <Column header="Actions" style="width: 150px">
      <template #body="{ data }">
        <div class="flex gap-2">
          <Button
            icon="pi pi-pencil"
            text
            rounded
            severity="info"
            aria-label="Edit"
            @click="handleEdit(data)"
          />
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            aria-label="Delete"
            @click="handleDelete(data)"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>
