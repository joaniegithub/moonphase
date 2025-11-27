<template>
  <v-card class="elevation-5">
    <v-card-title class="text-h5 primary white--text pa-4">
      <v-icon left>mdi-moon-waning-crescent</v-icon>
      Current Moon Phase
      <v-spacer></v-spacer>
      <v-chip v-if="moonStore.location" color="white" text-color="primary" small>
        <v-icon left small>mdi-map-marker</v-icon>
        {{ moonStore.location.name }}
      </v-chip>
    </v-card-title>
    
    <v-card-text class="pa-6">
      <div class="d-flex flex-column align-center mb-6">
        <div class="moon-phase-display">
          <div class="moon-container">
            <img 
              src="/images/moon-phases.png" 
              :alt="'Moon Phase: ' + (moonStore.phaseName || 'Loading...')"
              class="moon-image"
              :style="moonImageStyle"
            />
          </div>
        </div>
        
        <h2 class="text-h4 mb-2 text-center">{{ moonStore.phaseName || 'Loading...' }}</h2>
        <p class="text-subtitle-1 mb-4 text-center">
          {{ moonStore.formattedDate || 'Fetching data...' }}
        </p>
      </div>
      
      <v-progress-linear
        v-if="!moonStore.illumination"
        indeterminate
        color="primary"
        class="mb-4"
      ></v-progress-linear>
      
      <div v-else>
        <!-- Illumination -->
        <div class="mb-6">
          <div class="d-flex justify-space-between mb-1">
            <span>Illumination</span>
            <span class="font-weight-bold">{{ Math.round(moonStore.illumination * 100) }}%</span>
          </div>
          <v-progress-linear
            :value="moonStore.illumination * 100"
            height="16"
            color="amber"
            class="rounded"
            striped
          ></v-progress-linear>
        </div>
        
        <!-- Moon Times -->
        <v-card v-if="moonStore.moonTimes" class="mb-4" flat>
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="6" class="text-center">
                <div class="text-subtitle-2">Moonrise</div>
                <div class="text-h6">
                  {{ formatTime(moonStore.moonTimes.rise) }}
                </div>
              </v-col>
              <v-col cols="6" class="text-center">
                <div class="text-subtitle-2">Moonset</div>
                <div class="text-h6">
                  {{ formatTime(moonStore.moonTimes.set) }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        
        <!-- Next Full Moon -->
        <v-alert v-if="moonStore.daysUntilNextFullMoon !== null" 
                color="primary" 
                text 
                dense
                class="mb-4">
          <div class="d-flex align-center">
            <v-icon left>mdi-moon-full</v-icon>
            <span>Next Full Moon in {{ moonStore.daysUntilNextFullMoon }} days</span>
          </div>
        </v-alert>
        
        <!-- Phase Details -->
        <v-expansion-panels flat>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon left>mdi-information</v-icon>
              Phase Details
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p class="text-body-2 mb-2">
                The moon is currently in the <strong>{{ moonStore.phaseName?.toLowerCase() || '...' }}</strong> phase.
                This means {{ getPhaseDescription(moonStore.phase) }}
              </p>
              <p class="text-caption text-medium-emphasis">
                Moon phase: {{ (moonStore.phase * 100).toFixed(1) }}%
              </p>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-card-text>
    
    <v-card-actions class="pa-4">
      <v-btn
        color="primary"
        variant="text"
        :loading="loading"
        @click="fetchMoonPhase"
      >
        <v-icon left>mdi-refresh</v-icon>
        Refresh
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        color="secondary"
        variant="text"
        @click="changeLocation"
      >
        <v-icon left>mdi-map-marker</v-icon>
        Change Location
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMoonStore } from '~/store/moon';

const moonStore = useMoonStore();
const loading = ref(false);

// Calculate the position in the moon phase image
const moonImageStyle = computed(() => {
  if (!moonStore.phase) return {};
  
  // The image has 8 phases in a row
  const phase = moonStore.phase % 1; // Ensure phase is between 0 and 1
  const phaseIndex = Math.floor(phase * 8) % 8;
  const xPos = phaseIndex * -100; // Each phase is 100% wide
  
  return {
    'object-position': `${xPos}% 0`,
    'width': '800%', // 8 phases * 100%
    'max-width': 'none',
    'height': '100%',
    'object-fit': 'cover'
  };
});

const moonPhaseIcon = computed(() => {
  if (!moonStore.phaseName) return 'mdi-moon-new';
  
  const phase = moonStore.phaseName.toLowerCase();
  if (phase.includes('new')) return 'mdi-moon-new';
  if (phase.includes('first')) return 'mdi-moon-first-quarter';
  if (phase.includes('full')) return 'mdi-moon-full';
  if (phase.includes('last') || phase.includes('third')) return 'mdi-moon-last-quarter';
  if (phase.includes('waxing')) return 'mdi-moon-waxing-crescent';
  if (phase.includes('waning')) return 'mdi-moon-waning-crescent';
  return 'mdi-moon-waning-gibbous';
});

const moonPhaseColor = computed(() => {
  if (!moonStore.phaseName) return 'grey';
  
  const phase = moonStore.phaseName.toLowerCase();
  if (phase.includes('new')) return 'grey darken-2';
  if (phase.includes('full')) return 'yellow darken-2';
  return 'blue-grey lighten-1';
});

function getPhaseDescription(phase) {
  if (phase === null || phase === undefined) return 'gathering moon phase information...';
  
  if (phase === 0 || phase === 1) return 'the moon is not visible from Earth as it is between the Earth and the Sun.';
  if (phase < 0.25) return 'a thin crescent of the moon is becoming visible as it waxes toward the first quarter.';
  if (phase === 0.25) return 'the right half of the moon is illuminated, marking the first quarter of the lunar cycle.';
  if (phase < 0.5) return 'more than half of the moon is illuminated as it waxes toward a full moon.';
  if (phase === 0.5) return 'the moon is fully illuminated and appears as a complete circle in the night sky.';
  if (phase < 0.75) return 'the moon is waning, with more than half still illuminated as it moves toward the last quarter.';
  if (phase === 0.75) return 'the left half of the moon is illuminated, marking the last quarter of the lunar cycle.';
  return 'only a thin crescent remains visible as the moon wanes toward a new moon.';
}

function formatTime(date) {
  if (!date) return '--:--';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function fetchMoonPhase() {
  try {
    loading.value = true;
    await moonStore.fetchMoonPhase();
  } catch (error) {
    console.error('Error fetching moon phase:', error);
  } finally {
    loading.value = false;
  }
}

function changeLocation() {
  // This would open a location picker dialog in a real app
  const newLocation = window.prompt('Enter a location (e.g., New York, NY):', moonStore.location?.name || 'New York');
  if (newLocation) {
    // In a real app, you would geocode this location
    moonStore.setLocation({
      name: newLocation,
      lat: 40.7128, // Default to New York
      lon: -74.0060
    });
  }
}

onMounted(() => {
  if (!moonStore.lastUpdated) {
    fetchMoonPhase();
  }
});
</script>

<style scoped>
.moon-phase-display {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto 20px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #1a1a2e;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.1);
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
}

.moon-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  transition: all 0.5s ease;
  filter: brightness(1.1) contrast(1.1);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
}

/* Add a subtle glow effect */
.moon-container::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
  z-index: 1;
  pointer-events: none;
}
.moon-phase-display {
  font-size: 5rem;
  line-height: 1;
  margin: 0.5rem 0;
  min-height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.v-expansion-panel-title__icon) {
  margin-inline-start: 0 !important;
  margin-inline-end: 8px !important;
}
</style>