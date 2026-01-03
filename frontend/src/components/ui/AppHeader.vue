<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useAuth } from '@/composables/useAuth'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'

const authStore = useAuthStore()
const uiStore = useUiStore()
const { logout } = useAuth()
</script>

<template>
  <header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <Button
        icon="pi pi-bars"
        text
        rounded
        aria-label="Toggle Sidebar"
        @click="uiStore.toggleSidebar"
      />
      <h1 class="text-xl font-semibold text-gray-800">UCC Event Manager</h1>
    </div>

    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <Avatar
          :label="authStore.user?.name?.charAt(0).toUpperCase()"
          shape="circle"
          class="bg-primary text-white"
        />
        <span class="text-sm text-gray-600">{{ authStore.user?.name }}</span>
      </div>
      <Button label="Logout" icon="pi pi-sign-out" text size="small" @click="logout" />
    </div>
  </header>
</template>






