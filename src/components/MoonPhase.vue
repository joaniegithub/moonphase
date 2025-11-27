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
          
          <!-- Moon Image -->
          <div class="moon-phase-display">
            <div class="moon-phase" :phase="moonStore.phaseName"></div>
          </div>
          
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
                <div class="d-flex justify-space-between">
                  <span>Distance:</span>
                  <span class="font-weight-medium">{{ moonStore.distance ? Math.round(moonStore.distance).toLocaleString() + ' km' : '--' }}</span>
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
import { ref, computed, onMounted, nextTick } from 'vue';
import { useMoonStore } from '../store/moon';

const moonStore = useMoonStore();
const loading = ref(false);
const componentKey = ref(0);

console.log(moonStore);

// Moon phase image (using local file from public directory)
const moonPhaseImage = '/images/moon-phases.png';

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
    await nextTick();
    componentKey.value++;
    
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
.moon-phase-display {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  margin: 20px auto;
  border-radius: 50%;
  overflow: hidden;
  background: transparent;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.moon-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.moon-phase {
  --moon-phase-blur: 3px;
  --moon-phase-mask-bg: #000;
  --moon-phase-mask-opacity: 0.85;
  --moon-phase-filter: sepia(1) grayscale(0.25);
  
  --_w: calc(100% - 1% * v-bind('(moonStore.illumination || 0)'));
  --_lat: v-bind('moonStore.location.lat');
  --_hour: v-bind('moonStore.currentDate.getHours()');
  --_l: calc(var(--_lat) * 1.5deg);
  --_a: calc((var(--_hour) - 12) * 15 * 0.7 * 1deg);
  --_r: calc(var(--_l) + var(--_a));

  display: block;
  width: 200px;
  height: 200px;
  aspect-ratio: 1;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  rotate: var(--_r, 0deg);
  background: #f5f5f5;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
}

.moon-phase::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('https://assets.stoumann.dk/img/moon.png') center / cover no-repeat;
  filter: var(--moon-phase-filter);
}

.moon-phase::after {
  content: '';
  position: absolute;
  background-color: var(--moon-phase-mask-bg);
  border-radius: var(--_btlr, 0) var(--_btrr, 0) var(--_bbrr, 0) var(--_bblr, 0);
  filter: blur(var(--moon-phase-blur));
  height: 100%;
  inset-inline: var(--_ii, auto 0);
  opacity: var(--moon-phase-mask-opacity);
  width: var(--_w);
}

/* Phases */
.moon-phase[phase*="First Quarter"],
.moon-phase[phase*="Waxing"] {
  --_ii: 0 auto;
}

.moon-phase[phase*="Crescent"],
.moon-phase[phase*="First Quarter"],
.moon-phase[phase*="Waxing"] {
  --_bblr: 100%;
  --_btlr: 100%;
}

.moon-phase[phase*="Crescent"],
.moon-phase[phase*="Last Quarter"],
.moon-phase[phase*="Waning"] {
  --_btrr: 100%;
  --_bbrr: 100%;
}

.moon-phase[phase="Waxing Gibbous"]::after {
  border-radius: 0;
  width: 100%;
}

.moon-phase[phase="Waxing Gibbous"]::after {
  mask: radial-gradient(
    circle at 100% 50%,
    #0000 calc(100% - var(--_w)),
    #000 calc(100% - var(--_w) + 1px + (2 * var(--moon-phase-blur, 0)))
  );
}

.moon-phase[phase="Waning Gibbous"]::after {
  mask: radial-gradient(
    circle at 0% 50%,
    #0000 calc(100% - var(--_w)),
    #000 calc(100% - var(--_w) + 1px + (2 * var(--moon-phase-blur, 0)))
  );
}
/* Remove pulse animation for cleaner look */

</style>
