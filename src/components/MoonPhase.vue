<template>
  <v-card class="elevation-5">
    <!-- Moon Phase Display -->
    <v-card-text class="pa-6">
      <div class="d-flex flex-column align-center">
        <!-- Moon Phase Name -->
        <h1 class="moon-phase-name mb-4 text-center">
          {{ moonStore.phaseName || "&nbsp;" }}
        </h1>
        
        <!-- Navigation Buttons and Moon Image -->
        <div class="d-flex align-center justify-center">
          <!-- Previous Button -->
          <v-btn 
            color="grey-lighten-1"
            variant="text"
            @click="changeDate(-1)"
            :disabled="loading"
            class="mx-2"
            width="56"
            height="56"
            rounded="circle"
          >
            <v-icon icon="mdi-chevron-left" size="48"></v-icon>
          </v-btn>
          
          <!-- Moon Image Component - Only show when we have a location -->
          <!-- <template v-if="moonStore.location?.lat !== undefined && moonStore.location?.lon !== undefined"> -->
            <MoonImage  />
          <!-- </template> -->
          <!-- <div v-else class="moon-loading-animation">
            <div class="moon-loading-circle"></div>
            <div class="moon-loading-text">{{ locationStatusText }}</div>
          </div> -->
          
          <!-- Next Button -->
          <v-btn 
            color="grey-lighten-1"
            variant="text"
            @click="changeDate(1)"
            :disabled="loading"
            class="mx-2"
            width="56"
            height="56"
            rounded="circle"
          >
            <v-icon icon="mdi-chevron-right" size="48"></v-icon>
          </v-btn>
        </div>
        
        <!-- Moon Time Slider -->
        <!--div v-if="hasMoonTimes" class="moon-time-slider mt-4 px-4" style="width: 100%; max-width: 500px;">
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center">
              <v-icon small class="mr-1">mdi-weather-night</v-icon>
              <span class="text-caption">Moon Time:</span>
              <span class="text-subtitle-2 ml-1">{{ formatTime(currentMoonTime) }}</span>
            </div>
          </div>
          <v-slider
            v-model="moonTimeValue"
            :min="moonRiseHour || 0"
            :max="moonSetHour || 24"
            :step="1"
            hide-details
            @update:model-value="updateMoonTime"
            color="primary"
            thumb-label="always"
            :thumb-label-text="formatMoonTimeLabel"
            class="mt-2"
            :disabled="!hasMoonTimes"
          >
            <template v-slot:prepend>
              <v-btn
                size="small"
                variant="text"
                icon="mdi-chevron-left"
                @click="updateMoonTime(moonTimeValue - 1)"
                :disabled="loading "
              ></v-btn>
            </template>
            <template v-slot:append>
              <v-btn
                size="small"
                variant="text"
                icon="mdi-chevron-right"
                @click="updateMoonTime(moonTimeValue + 1)"
                :disabled="loading"
              ></v-btn>
            </template>
          </v-slider>
          <div v-if="hasMoonTimes" class="d-flex justify-space-between mt-n2">
            <div class="d-flex flex-column align-center">
              <span class="text-caption">Moonrise</span>
              <span class="text-caption font-weight-medium">{{ moonStore.formattedMoonTimes?.rise }}</span>
            </div>
            <div class="d-flex flex-column align-center">
              <span class="text-caption">Moonset</span>
              <span class="text-caption font-weight-medium">{{ moonStore.formattedMoonTimes?.set }}</span>
            </div>
          </div>
          <v-alert
            v-else
            type="info"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            {{ moonStatusMessage }}
          </v-alert>
        </div-->

        <div v-if="moonStore.location?.name" class="d-flex align-center justify-center mt-4">
          <v-icon small icon="mdi-map-marker"></v-icon>
          <span class="text-subtitle-2">{{ moonStore.location.name }}</span>
        </div>
        <p class="text-subtitle-2 text-center mt-1">
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
                <div class="d-flex justify-space-between mb-2">
                  <span>Moonrise:</span>
                  <span class="font-weight-medium">{{ moonStore.moonTimes?.rise ? formatTime(moonStore.moonTimes.rise) : '--' }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
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
import { ref, computed, onMounted, watch } from 'vue';
import { useMoonStore } from '@/store/moon';
import MoonImage from './MoonImage.vue';
import { addDays, format, subDays, isSameDay } from 'date-fns';

const moonStore = useMoonStore();
const loading = ref(false);
const componentKey = ref(0);
const locationStatusText = ref('Detecting your location...');

// Moon time slider state
// const moonTimeValue = ref(0);
// const currentMoonTime = ref<Date>(new Date());

// Computed properties for moon time slider
// const hasMoonTimes = computed(() => {
//   return moonStore.moonTimes?.rise && moonStore.moonTimes?.set && 
//          !moonStore.moonTimes.alwaysUp && !moonStore.moonTimes.alwaysDown;
// });

// const moonStatusMessage = computed(() => {
//   if (moonStore.moonTimes?.alwaysUp) return 'The moon is always above the horizon today';
//   if (moonStore.moonTimes?.alwaysDown) return 'The moon is always below the horizon today';
//   return 'Moon times not available for this location';
// });

// Calculate mid-point between moonrise and moonset
// const midMoonTime = computed(() => {
//   if (!hasMoonTimes.value) return null;
//   const rise = moonStore.moonTimes.rise!.getTime();
//   const set = moonStore.moonTimes.set!.getTime();
//   return new Date(rise + (set - rise) / 2);
// });
// const moonRiseHour = computed(() => {
//   if (!hasMoonTimes.value) return null;
//   const rise = moonStore.moonTimes.rise!.getTime();
//   return new Date(rise).getHours();
// });
// const moonSetHour = computed(() => {
//   if (!hasMoonTimes.value) return null;
//   const set = moonStore.moonTimes.set!.getTime();
//   return (new Date(set).getHours());
// });

// Calculate moon visibility percentage (0-100% between rise and set)

// Format time for display
const formatTime = (date: Date | null) => {
  if (!date) return '--:--';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Format moon time label for slider thumb
// const formatMoonTimeLabel = (value: number) => {
//   if (!hasMoonTimes.value) return '--:--';
  
//   const time = getMoonTimeFromValue(value);
//   return formatTime(time);
// };

// Get moon time from slider value (0 to moonTimeSteps-1)
// const getMoonTimeFromValue = (value: number): Date | null => {
//   if (!hasMoonTimes.value) return null;
//   const rise = moonStore.moonTimes.rise!;
//   const newTime = new Date(rise);
//   newTime.setMinutes(newTime.getMinutes() + 60);
//   return newTime;
// };

// Update moon time when slider changes
// const updateMoonTime = (value: number) => {
//   if (!hasMoonTimes.value) return;
//   moonTimeValue.value = value;
  
//   // Get the corresponding time
//   const newTime = getMoonTimeFromValue(value);
//   if (!newTime) return;
  
//   currentMoonTime.value = newTime;
  
//   // Update the store with the new time
//   const newDate = new Date(moonStore.currentDate);
//   console.log(value, newTime);
//   newDate.setHours(value, newTime.getMinutes(), 0, 0);
//   // console.log(newTime);
  
//   moonStore.setCurrentDate(newDate);
//   moonStore.fetchMoonPhase(newDate);
// };

// Watch for external date changes to update the slider
// watch(() => moonStore.currentDate, (newDate) => {
//   if (!newDate || !hasMoonTimes.value) return;
  
//   currentMoonTime.value = newDate;
// }, { immediate: true });

// console.log(moonStore);

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

// Helper function to get location name from coordinates
async function getLocationName(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
    );
    const data = await response.json();
    // Return city name if available, otherwise return timezone
    return data.address?.city || 
           data.address?.town || 
           data.address?.village || 
           data.address?.county || 
           data.address?.state || 
           data.timezone?.split('/').pop() || 
           'Your Location';
  } catch (error) {
    console.error('Error getting location name:', error);
    return 'Your Location';
  }
}

// Initialize moon phase data
onMounted(async () => {
  try {
    // First try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Successfully got location
          const { latitude, longitude } = position.coords;
          const locationName = await getLocationName(latitude, longitude);
          
          await moonStore.setLocation({
            name: locationName,
            lat: latitude,
            lon: longitude
          });
          
          await moonStore.fetchMoonPhase();
          componentKey.value++;
        },
        async (error) => {
          // If geolocation fails, fall back to default location
          console.warn('Geolocation error:', error);
          await moonStore.fetchMoonPhase();
          componentKey.value++;
        }
      );
    } else {
      // If geolocation is not supported
      console.warn('Geolocation is not supported by this browser');
      await moonStore.fetchMoonPhase();
      componentKey.value++;
    }
  } catch (error) {
    console.error('Error initializing moon phase data:', error);
    locationStatusText.value = 'Location access denied. Using default location.';
    // Set a default location if geolocation fails
    const defaultLocation = {
      name: 'New York',
      lat: 40.7128,
      lon: -74.0060
    };
    const locationName = await getLocationName(defaultLocation.lat, defaultLocation.lon);
    moonStore.setLocation({
      ...defaultLocation,
      name: locationName
    });
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Moon Loading Animation */
.moon-loading-animation {
  width: 100%;
  height: 100%;
  max-width: 500px;
  max-height: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 70vw; /* Match the mobile size */
}

@media (min-width: 640px) {
  .moon-loading-animation {
    width: 500px;
    height: 500px;
    min-height: auto;
  }
}

.moon-loading-circle {
  width: 100px;
  height: 100px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #e6d595ff;
  animation: spin 1s ease-in-out infinite;
  position: relative;
}

.moon-loading-circle::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 4px solid transparent;
  border-radius: 50%;
  border-top-color: #e6d595ff;
  animation: spin 1.5s ease-in-out infinite;
  animation-delay: 0.2s;
}

.moon-loading-text {
  margin-top: 20px;
  color: #B0BEC5;
  font-size: 1.1rem;
  opacity: 0.8;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.5; }
}

/* Moon Phase Name */
.moon-phase-name {
  font-size: 2rem;
  font-weight: 500;
  letter-spacing: 1px;
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  padding-bottom: 0.5rem;
}

/* Moon phase styles have been moved to MoonImage.vue */
</style>
