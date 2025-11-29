import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import App from './App.vue'

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
          primary: '#3B82F6',
          'primary-darken-1': '#2563EB',
          secondary: '#60A5FA',
          'secondary-darken-1': '#3B82F6',
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
})

// Use plugins
app.use(pinia)
app.use(vuetify)

// Mount the app
app.mount('#app')
