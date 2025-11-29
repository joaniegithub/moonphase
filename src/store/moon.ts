import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getMoonIllumination, getMoonPosition, getMoonTimes, IPhaseObj } from '@noim/suncalc3';

interface Location {
  name: string;
  lat: number;
  lon: number;
}

interface MoonTimes {
  rise: Date | null;
  set: Date | null;
  alwaysUp?: boolean;
  alwaysDown?: boolean;
}

interface MoonPosition {
  altitude: number;
  azimuth: number;
  distance: number;
  parallacticAngle: number;
}

interface MoonPhaseInfo {
  code: string;
  css: string;
  emoji: string;
  from: number;
  id: string;
  name: string;
  to: number;
  weight: number;
  phaseValue?: number;
}

interface MoonIllumination {
  fraction: number;
  phase: MoonPhaseInfo | number;
  phaseValue?: number;
  angle: number;
  next?: any; // You might want to type this more specifically
}

export const useMoonStore = defineStore('moon', () => {
  const location = ref<Location | null>(null);
  
  const phase = ref<number | null>(null);
  const phaseName = ref<string | null>(null);
  const phaseSide = ref<string | null>(null);
  const illumination = ref<number | null>(null);
  const moonTimes = ref<MoonTimes>({ rise: null, set: null });
  const moonPosition = ref<MoonPosition | null>(null);
  const moonIllumination = ref<MoonIllumination | null>(null);
  const lastUpdated = ref<Date | null>(null);
  const daysUntilNextFullMoon = ref<number | null>(null);
  const ageOfMoon = ref<number | null>(null);
  const distance = ref<number | null>(null);
  const angularSize = ref<number | null>(null);
  const nextNewMoon = ref<Date | null>(null);
  const nextFullMoon = ref<Date | null>(null);
  
  const formattedDate = computed(() => {
    return lastUpdated.value ? lastUpdated.value.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '';
  });
  
  function setLocation(newLocation: Location | null) {
    location.value = newLocation;
    if (newLocation) {
      fetchMoonPhase(undefined);
    } else {
      // Reset moon data when location is cleared
      phase.value = null;
      phaseName.value = null;
      illumination.value = null;
      moonTimes.value = { rise: null, set: null };
      moonPosition.value = null;
      moonIllumination.value = null;
      lastUpdated.value = null;
      daysUntilNextFullMoon.value = null;
      ageOfMoon.value = null;
      distance.value = null;
      angularSize.value = null;
      nextNewMoon.value = null;
      nextFullMoon.value = null;
    }
  }
  
  async function fetchMoonPhase(date?: Date) {
    try {
      if (!location.value) {
        console.log('Location not set, skipping moon phase fetch');
        return;
      }

      // if (!transition) {
      //   await new Promise(resolve => setTimeout(resolve, 10000));
      // }
      
      const targetDate = date || new Date();
      
      // Get moon illumination data with proper typing
      const moonIlluminationData = getMoonIllumination(targetDate) as MoonIllumination;
      
      // Extract phase value from the illumination data
      let phaseValue = 0;
      
      // Check if we have a phaseValue in the data
      if ('phaseValue' in moonIlluminationData && moonIlluminationData.phaseValue !== undefined) {
        phaseValue = moonIlluminationData.phaseValue;
      } 
      // Check if phase is an object with phaseValue
      else if (moonIlluminationData.phase && 
              typeof moonIlluminationData.phase === 'object' && 
              'phaseValue' in moonIlluminationData.phase) {
        phaseValue = moonIlluminationData.phase.phaseValue || 0;
      }
      // Fallback to phase if it's a number
      else if (typeof moonIlluminationData.phase === 'number') {
        phaseValue = moonIlluminationData.phase;
      }
      
      // Ensure phase is between 0 and 1
      phaseValue = Math.max(0, Math.min(1, phaseValue || 0));
      
      // Store phase name if available
      if (moonIlluminationData.phase && 
          typeof moonIlluminationData.phase === 'object' && 
          'name' in moonIlluminationData.phase) {
        phaseName.value = moonIlluminationData.phase.name;
      }
      // Store illumination data
      moonIllumination.value = {
        fraction: moonIlluminationData.fraction,
        phase: phaseValue,
        angle: moonIlluminationData.angle
      };
      
      // Update phase and illumination
      phase.value = phaseValue;
      illumination.value = Number(moonIlluminationData.fraction) * 100; // Convert to percentage
      
      // Get moon position
      const position = getMoonPosition(targetDate, location.value.lat, location.value.lon);
      
      // Store position data
      moonPosition.value = {
        altitude: position.altitude * (180 / Math.PI), // Convert to degrees
        azimuth: (position.azimuth * (180 / Math.PI) + 180) % 360, // Convert to degrees and adjust to 0-360
        distance: position.distance, // Distance in kilometers
        parallacticAngle: position.parallacticAngle * (180 / Math.PI) // Convert to degrees
      };
      
      // Calculate moon's angular size (in degrees)
      const moonRadiusKm = 1737.4; // Moon's radius in km
      const distanceKm = position.distance;
      const angularSizeRad = 2 * Math.atan2(moonRadiusKm, distanceKm);
      angularSize.value = angularSizeRad * (180 / Math.PI) * 60; // Convert to arcminutes
      
      // Store distance
      distance.value = distanceKm;
      
      // Get moon times
      const times = getMoonTimes(targetDate, location.value.lat, location.value.lon);
      
      // Update moon times - ensure they are Date objects
      moonTimes.value = {
        rise: times.rise instanceof Date ? times.rise : null,
        set: times.set instanceof Date ? times.set : null,
        alwaysUp: times.alwaysUp,
        alwaysDown: times.alwaysDown
      };
      
      // Calculate moon age (days since last new moon)
      ageOfMoon.value = Number((phaseValue * 29.53).toFixed(1));
      
      // Calculate next full moon and new moon
      const nextFullMoonDate = new Date(targetDate);
      const nextNewMoonDate = new Date(targetDate);
      
      const phaseNum = Number(phaseValue);
      const daysUntilFull = ((0.5 - phaseNum + 1) % 1) * 29.53;
      const daysUntilNew = ((0 - phaseNum + 1) % 1) * 29.53;
      
      nextFullMoonDate.setDate(targetDate.getDate() + daysUntilFull);
      nextNewMoonDate.setDate(targetDate.getDate() + daysUntilNew);
      
      nextFullMoon.value = nextFullMoonDate;
      nextNewMoon.value = nextNewMoonDate;
      
      // Update days until next full moon
      const diffTime = nextFullMoonDate.getTime() - targetDate.getTime();
      daysUntilNextFullMoon.value = Number((diffTime / (1000 * 60 * 60 * 24)).toFixed(1));
      // console.log(phaseNum);
      // Set phase name based on phase value (0-1)
      if (phaseNum < 0.03 || phaseNum > 0.97) {
        phaseName.value = 'New Moon';
      } else if (phaseNum < 0.22) {
        phaseName.value = 'Waxing Crescent';
      } else if (phaseNum < 0.28) {
        phaseName.value = 'First Quarter';
      } else if (phaseNum < 0.47) {
        phaseName.value = 'Waxing Gibbous';
      } else if (phaseNum < 0.53) {
        phaseName.value = 'Full Moon';
      } else if (phaseNum < 0.72) {
        phaseName.value = 'Waning Gibbous';
      } else if (phaseNum < 0.78) {
        phaseName.value = 'Last Quarter';
      } else {
        phaseName.value = 'Waning Crescent';
      }
      const isCrescent = illumination.value < 50;
      phaseSide.value = (phaseNum < 0.5 ? 'Waxing' : 'Waning') + (isCrescent ? ' Crescent' : ' Gibbous');
      
      lastUpdated.value = targetDate;
    } catch (error) {
      console.error('Error fetching moon phase:', error);
      throw error;
    }
  }
  
  // Add currentDate ref for tracking the selected date
  const currentDate = ref<Date>(new Date());
  
  // Add a method to change the date
  async function setCurrentDate(date: Date) {
    currentDate.value = date;
    await fetchMoonPhase(date);
  }

  // Format moon position for display
  const formattedPosition = computed(() => {
    if (!moonPosition.value) return null;
    
    return {
      altitude: moonPosition.value.altitude.toFixed(2) + '°',
      azimuth: moonPosition.value.azimuth.toFixed(2) + '°',
      distance: (moonPosition.value.distance).toFixed(0) + ' km',
      parallacticAngle: moonPosition.value.parallacticAngle.toFixed(2) + '°'
    };
  });

  // Format moon times for display
  const formattedMoonTimes = computed(() => {
    if (!moonTimes.value) return null;
    
    const formatTime = (date: Date | null) => {
      if (!date) return 'N/A';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    return {
      rise: moonTimes.value.alwaysUp ? 'Always up' : 
            moonTimes.value.alwaysDown ? 'Always down' : 
            formatTime(moonTimes.value.rise),
      set: moonTimes.value.alwaysUp ? 'Always up' : 
           moonTimes.value.alwaysDown ? 'Always down' : 
           formatTime(moonTimes.value.set)
    };
  });
console.log(phaseName.value, illumination.value);
  return {
    // State
    location,
    phase,
    phaseName,
    phaseSide,
    illumination,
    moonTimes,
    moonPosition,
    moonIllumination,
    lastUpdated,
    daysUntilNextFullMoon,
    ageOfMoon,
    distance,
    angularSize,
    nextNewMoon,
    nextFullMoon,
    
    // Computed
    formattedDate,
    formattedPosition,
    formattedMoonTimes,
    
    // Methods
    currentDate,
    setLocation,
    fetchMoonPhase,
    setCurrentDate
  };
});
