<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { createEventSchema, type Event, type CreateEventPayload } from '@/types'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'

const props = defineProps<{
  event?: Event | null
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: CreateEventPayload]
  cancel: []
}>()

const isEdit = ref(!!props.event)

const { handleSubmit, defineField, errors, resetForm, setValues, setFieldValue } = useForm({
  validationSchema: toTypedSchema(createEventSchema),
})

const [title, titleAttrs] = defineField('title')
const [description, descriptionAttrs] = defineField('description')

// Separate Date ref for DatePicker (PrimeVue requires Date type)
const occurrenceDate = ref<Date | null>(null)

// Sync DatePicker to vee-validate
watch(occurrenceDate, (date) => {
  if (date) {
    setFieldValue('occurrence', date)
  }
})

// Watch for event changes (edit mode)
watch(
  () => props.event,
  (event) => {
    if (event) {
      isEdit.value = true
      const date = new Date(event.occurrence)
      occurrenceDate.value = date
      setValues({
        title: event.title,
        occurrence: date,
        description: event.description || '',
      })
    } else {
      isEdit.value = false
      occurrenceDate.value = null
      resetForm()
    }
  },
  { immediate: true }
)

const onSubmit = handleSubmit((values) => {
  const payload: CreateEventPayload = {
    title: values.title,
    occurrence:
      values.occurrence instanceof Date
        ? values.occurrence.toISOString()
        : String(values.occurrence),
    description: values.description,
  }
  emit('submit', payload)
})
</script>

<template>
  <form class="space-y-4" @submit="onSubmit">
    <div class="flex flex-col gap-2">
      <label for="title" class="font-medium">Title <span v-if="!isEdit">*</span></label>
      <InputText
        id="title"
        v-model="title"
        v-bind="titleAttrs"
        :invalid="!!errors.title"
        :disabled="isEdit"
        placeholder="Event title"
        class="w-full"
      />
      <small v-if="errors.title" class="text-red-500">{{ errors.title }}</small>
    </div>

    <div class="flex flex-col gap-2">
      <label for="occurrence" class="font-medium">Date & Time <span v-if="!isEdit">*</span></label>
      <DatePicker
        id="occurrence"
        v-model="occurrenceDate"
        :invalid="!!errors.occurrence"
        :disabled="isEdit"
        show-time
        hour-format="12"
        placeholder="Select date and time"
        class="w-full"
      />
      <small v-if="errors.occurrence" class="text-red-500">{{ errors.occurrence }}</small>
    </div>

    <div class="flex flex-col gap-2">
      <label for="description" class="font-medium">Description</label>
      <Textarea
        id="description"
        v-model="description"
        v-bind="descriptionAttrs"
        rows="3"
        placeholder="Optional description"
        class="w-full"
      />
    </div>

    <div class="flex justify-end gap-2 pt-4">
      <Button type="button" label="Cancel" severity="secondary" outlined @click="emit('cancel')" />
      <Button
        type="submit"
        :label="isEdit ? 'Update' : 'Create'"
        :loading="loading"
        icon="pi pi-check"
      />
    </div>
  </form>
</template>
