<template>
  <v-app>
    <v-main>
      <v-container fluid class="pa-0">
        <MoonPhase />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MoonPhase from './components/MoonPhase.vue'

export default defineComponent({
  name: 'App',
  components: {
    MoonPhase
  }
})
</script>

<style>
/* Add your global styles here */
body {
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;
}

/* Ensure Vuetify components take full width */
.v-application {
  width: 100%;
}
</style>
