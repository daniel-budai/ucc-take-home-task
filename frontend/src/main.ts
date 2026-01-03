import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import './style.css'

import App from './App.vue'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

// Pinia for state management
const pinia = createPinia()
app.use(pinia)

// Initialize auth store from localStorage
const authStore = useAuthStore(pinia)
authStore.initialize()

// Vue Router
app.use(router)

// PrimeVue with Tailwind-friendly configuration
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark-mode',
      cssLayer: false,
    },
  },
})

// PrimeVue services
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')
