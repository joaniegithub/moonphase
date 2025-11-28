<template>
  <v-card :key="componentKey" class="elevation-5">
    <!-- Moon Phase Display -->
    <v-card-text class="pa-6">
      <div class="d-flex flex-column align-center">
        <!-- Navigation Buttons and Moon Image -->
        <div class="d-flex align-center">
          <!-- Previous Button -->
          <v-btn 
            color="primary"
            class="mr-4" 
            @click="changeDate(-1)"
            :disabled="loading"
            size="large"
          >
            &lt; Prev
          </v-btn>
          
          <!-- Moon Image Component -->
          <MoonImage />
          
          <!-- Next Button -->
          <v-btn 
            color="primary"
            class="ml-4" 
            @click="changeDate(1)"
            :disabled="loading"
            size="large"
          >
            Next &gt;
          </v-btn>
        </div>
        
        <!-- Date Display -->
            <p class="text-subtitle-1 mt-4 text-center">
              {{ moonStore.phaseName }}
            </p>
        <p class="text-subtitle-1 mt-4 text-center">
          {{ moonStore.formattedDate }}
        </p>
      </div>

      <!-- Moon Information Grid -->
      <v-container class="mt-4">
        <v-row>
          <!-- Left Column -->
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="mb-4">
              <v-card-text>
                <div class="text-h6 mb-2">Moon Phase</div>
                <v-divider class="mb-3"></v-divider>
                <div class="d-flex justify-space-between mb-2">
                  <span>Phase:</span>
                  <span class="font-weight-medium">{{ moonStore.phaseName || 'Loading...' }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span>Illumination:</span>
                  <span class="font-weight-medium">{{ moonStore.illumination ? Math.round(moonStore.illumination) + '%' : '--' }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span>Moon Age:</span>
                  <span class="font-weight-medium">{{ moonStore.ageOfMoon ? moonStore.ageOfMoon + ' days' : '--' }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span>Distance:</span>
                  <span class="font-weight-medium">{{ moonStore.distance ? Math.round(moonStore.distance).toLocaleString() + ' km' : '--' }}</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span>parallacticAngle:</span>
                  <span class="font-weight-medium">{{ moonStore.moonPosition ? moonStore.moonPosition?.parallacticAngle : '--' }}</span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Right Column -->
          <v-col cols="12" md="6">
            <v-card variant="outlined">
              <v-card-text>
                <div class="text-h6 mb-2">Moon Events</div>
                <v-divider class="mb-3"></v-divider>
                <div class="d-flex justify-space-between mb-2">
                  <span>Next Full Moon:</span>
                  <span class="font-weight-medium">{{ moonStore.nextFullMoon ? formatDate(moonStore.nextFullMoon) : '--' }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span>Next New Moon:</span>
                  <span class="font-weight-medium">{{ moonStore.nextNewMoon ? formatDate(moonStore.nextNewMoon) : '--' }}</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span>Moonrise:</span>
                  <span class="font-weight-medium">{{ moonStore.moonTimes?.rise ? formatTime(moonStore.moonTimes.rise) : '--' }}</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span>Moonset:</span>
                  <span class="font-weight-medium">{{ moonStore.moonTimes?.set ? formatTime(moonStore.moonTimes.set) : '--' }}</span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
      
      <!-- Loading Indicator -->
      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
        class="mt-4"
      ></v-progress-linear>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import MoonImage from './MoonImage.vue';
import { useMoonStore } from '../store/moon';

const moonStore = useMoonStore();
const loading = ref(false);
const componentKey = ref(0);

console.log(moonStore);

const changeDate = async (days: number) => {
  try {
    loading.value = true;
    
    // Get the current date from the store
    const currentDate = moonStore.currentDate || new Date();
    
    // Calculate the new date
    const targetDate = new Date(currentDate);
    targetDate.setDate(currentDate.getDate() + days);
    
    // Use setCurrentDate to update the date and fetch moon phase
    await moonStore.setCurrentDate(targetDate);
    
    // Force a re-render by updating the key
    /*await watch(() => {
      componentKey.value++;
    });*/
    
  } catch (error) {
    console.error('Error changing date:', error);
  } finally {
    loading.value = false;
  }
};

// Format date for display
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Format time for display
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Initialize on mount
onMounted(async () => {
  try {
    await moonStore.fetchMoonPhase();
    componentKey.value++; // Force re-render
  } catch (error) {
    console.error('Error initializing moon phase data:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Moon phase styles have been moved to MoonImage.vue */
</style>
