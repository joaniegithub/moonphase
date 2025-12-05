import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import App from './App.vue'

// Import and register the service worker in development mode only
if ('serviceWorker' in navigator && import.meta.env.MODE === 'production') {
  import('./registerSW')
}

// Create Vue app
const app = createApp(App)

// Add Pinia
const pinia = createPinia()

// Add Vuetify
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases,
      // Add any custom icon aliases here if needed
    },
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#000',
          surface: '#05060aff',
          primary: '#dfd6b5ff',
          'primary-darken-1': '#cbbf96ff',
          secondary: '#dfd6b5ff',
          'secondary-darken-1': '#cbbf96ff',
          error: '#EF4444',
          info: '#60A5FA',
          success: '#10B981',
          warning: '#F59E0B',
          // Text colors
          'on-background': '#edeadf',
          'on-surface': '#ededdf',
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
          'on-error': '#FFFFFF',
          'on-info': '#FFFFFF',
          'on-success': '#FFFFFF',
          'on-warning': '#000000',
        },
      },
    },
  },
  
  defaults: {
    VCard: {
      VCardTitle: {
        class: 'text-primary',
      }
    },
    VList: {
      VListItem: {
        class: 'text-primary',
      }
    }
  },
});

// Apply global styles for headings
const style = document.createElement('style')
style.textContent = `
  h1, h2, h3, h4, h5, h6,
  .text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6 {
    color: rgb(var(--v-theme-primary)) !important;
  }
`
document.head.appendChild(style)

// Use plugins
app.use(pinia)
app.use(vuetify)

// Mount the app
app.mount('#app')
