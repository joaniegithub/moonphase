// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // TypeScript configuration
  typescript: {
    typeCheck: false
  },
  
  // Enable devtools for better development experience
  devtools: { enabled: true },
  
  // Vue configuration
  vue: {
    compilerOptions: {
      // Basic Vue compiler options
    },
  },
  
  // Modules
  modules: [],
  
  // Source directory
  srcDir: 'app/',
  
  // Auto-import components
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  
  // CSS
  css: [
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css',
  ],
  
  // Build configuration
  build: {
    transpile: ['vuetify'],
  },
  
  // Vite configuration
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },
  
  // App configuration
  app: {
    head: {
      title: 'Moon Phase Tracker',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Track the current moon phase and related information' },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css'
        }
      ]
    }
  }
})
