<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { ROUTES } from '@/utils/constants'
import Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    {
      label: 'Events',
      icon: 'pi pi-calendar',
      command: () => router.push(ROUTES.EVENTS),
      class: route.path === ROUTES.EVENTS ? 'bg-primary-50' : '',
    },
    {
      label: 'Help Desk',
      icon: 'pi pi-comments',
      command: () => router.push(ROUTES.CHAT),
      class: route.path === ROUTES.CHAT ? 'bg-primary-50' : '',
    },
  ]

  // Add agent dashboard for helpdesk agents
  if (authStore.isAgent) {
    items.push({
      label: 'Agent Dashboard',
      icon: 'pi pi-headphones',
      command: () => router.push(ROUTES.AGENT_DASHBOARD),
      class: route.path === ROUTES.AGENT_DASHBOARD ? 'bg-primary-50' : '',
    })
  }

  return items
})
</script>

<template>
  <aside v-if="uiStore.sidebarOpen" class="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
    <nav>
      <Menu :model="menuItems" class="w-full border-0" />
    </nav>
  </aside>
</template>






