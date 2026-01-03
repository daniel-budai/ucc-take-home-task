<script setup lang="ts">
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { notificationService } from '@/composables/useNotification'

// Root App component - renders router views
const toast = useToast()

// Initialize global notification service for use in stores/services
notificationService.setToastInstance(toast)
</script>

<template>
  <router-view />
  <Toast position="top-right" />
</template>
