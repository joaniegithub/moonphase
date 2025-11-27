<template>
  <div>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Moon Phase Tracker</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="fetchMoonPhase">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-app-bar>
    
    <v-main>
      <v-container>
        <v-row justify="center" class="mt-8">
          <v-col cols="12" md="6">
            <MoonPhase />
          </v-col>
        </v-row>
        
        <v-row v-if="phases.length > 0" class="mt-8">
          <v-col v-for="(phase, index) in phases" :key="index" cols="12" md="4">
            <v-card class="ma-2">
              <v-card-title class="text-h6">{{ phase.name }}</v-card-title>
              <v-card-subtitle>{{ phase.date }}</v-card-subtitle>
              <v-card-text>{{ phase.details }}</v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const phases = ref([
  { name: 'New Moon', date: '2023-11-13', details: 'The moon is not visible from Earth' },
  { name: 'First Quarter', date: '2023-11-20', details: 'Right half of the moon is illuminated' },
  { name: 'Full Moon', date: '2023-11-27', details: 'The moon is fully illuminated' },
  { name: 'Last Quarter', date: '2023-12-05', details: 'Left half of the moon is illuminated' },
]);

const fetchMoonPhase = () => {
  // This will be implemented to fetch actual moon phase data
  console.log('Fetching moon phase data...');
};

onMounted(() => {
  fetchMoonPhase();
});
</script>