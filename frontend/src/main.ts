import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// Pinia for state management
app.use(createPinia())

// PrimeVue with Tailwind-friendly configuration
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark-mode',
      // Disable CSS layers to avoid conflicts with Tailwind
      cssLayer: false,
    },
  },
})

app.mount('#app')
