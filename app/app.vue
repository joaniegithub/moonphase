<template>
  <v-app>
    <v-main>
      <v-container class="fill-height" fluid>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
// This will be our main app container
useHead({
  title: 'Moon Phase Tracker',
  meta: [
    { name: 'description', content: 'Track the current moon phase and moon-related information' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})
</script>

<style>
/* Add any global styles here */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
}

.v-application {
  font-family: 'Roboto', sans-serif;
}
</style>
