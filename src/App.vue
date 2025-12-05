<template>
  <v-app>
    <v-main>
  	  <div class="moon-phase-app">
        <MoonPhase />
      </div>
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

/* Ensure Vuetify components take full width and height */
.v-application {
  width: 100%;
}

.v-application__wrap {
  min-height: 100vh !important;
  height: 100vh;
  overflow-y: auto;
}

/* Container styles */
.moon-phase-app {
  max-width: 640px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
  overflow-x: hidden;
}

@media (min-width: 640px) {
  /* .moon-phase-app {
  	padding: 0 20px;
  } */
}
</style>
