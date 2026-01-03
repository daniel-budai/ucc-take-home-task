import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // State
  const sidebarOpen = ref(true)
  const darkMode = ref(false)
  const loading = ref(false)

  // Actions
  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
    // Apply to document for Tailwind/PrimeVue dark mode
    if (darkMode.value) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  return {
    // State
    sidebarOpen,
    darkMode,
    loading,
    // Actions
    toggleSidebar,
    toggleDarkMode,
    setLoading,
  }
})






