<script setup lang="ts">
import AppHeader from '@/components/ui/AppHeader.vue'
import AppSidebar from '@/components/ui/AppSidebar.vue'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Toast position="top-right" />
    <ConfirmDialog />

    <AppHeader />

    <div class="flex">
      <AppSidebar />

      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>






