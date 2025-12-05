import { defineStore } from 'pinia';
import { ref, computed, onMounted } from 'vue';
import { getMoonIllumination, getMoonPosition, getMoonTimes, IPhaseObj } from '@noim/suncalc3';
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';

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
  altitudeDegrees: number;
  azimuth: number;
  azimuthDegrees: number;
  distance: number;
  parallacticAngle: number;
  parallacticAngleDegrees: number;
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

// Helper function to extract phase value from moon illumination data
export function extractPhaseValue(moonIlluminationData: MoonIllumination): number {
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
  return Math.max(0, Math.min(1, phaseValue || 0));
}

// Helper function to get phase name from phase value (0-1)
// Optionally accepts adjacent phase values to determine if current is closest to major phase center
export function getPhaseName(phaseValue: number, prevPhaseValue?: number, nextPhaseValue?: number): string {
	let phaseName = '';
  
  // First, determine the base phase name
  if (phaseValue < 0.0275 || phaseValue > 0.9725) {
    phaseName = 'New Moon';
  } else if (phaseValue < 0.23) {
    phaseName = 'Waxing Crescent';
  } else if (phaseValue < 0.27) {
    phaseName = 'First Quarter';
  } else if (phaseValue < 0.48) {
    phaseName = 'Waxing Gibbous';
  } else if (phaseValue < 0.52) {
    phaseName = 'Full Moon';
  } else if (phaseValue < 0.73) {
    phaseName = 'Waning Gibbous';
  } else if (phaseValue < 0.77) {
    phaseName = 'Last Quarter';
  } else {
    phaseName = 'Waning Crescent';
  }
  
  // If we have adjacent phase values and current phase is a major phase, validate it's the closest to center
  if ((phaseName === 'New Moon' || phaseName === 'Full Moon' || phaseName === 'First Quarter' || phaseName === 'Last Quarter') &&
      (prevPhaseValue !== undefined || nextPhaseValue !== undefined)) {
    
    let phaseCenter = phaseName === 'New Moon' ? 0 : 
                     phaseName === 'First Quarter' ? 0.25 :
                     phaseName === 'Full Moon' ? 0.5 : 0.75;
    
    // Calculate distance, accounting for circular nature of New Moon (0 and 1 are the same)
    const calculateDistance = (value: number, center: number): number => {
      if (center === 0) {
        // For New Moon, find distance to either 0 or 1 (whichever is closer)
        const distTo0 = Math.abs(value - 0);
        const distTo1 = Math.abs(value - 1);
        return Math.min(distTo0, distTo1);
      } else {
        return Math.abs(value - center);
      }
    };
    
    const currDist = calculateDistance(phaseValue, phaseCenter);
    let isClosest = true;
    
    // Check if previous day is closer
    if (prevPhaseValue !== undefined) {
      const prevPhaseName = getPhaseName(prevPhaseValue);
      if (prevPhaseName === phaseName) {
        const prevDist = calculateDistance(prevPhaseValue, phaseCenter);
        if (prevDist < currDist) {
          isClosest = false;
        }
      }
    }
    
    // Check if next day is closer
    if (nextPhaseValue !== undefined && isClosest) {
      const nextPhaseName = getPhaseName(nextPhaseValue);
      if (nextPhaseName === phaseName) {
        const nextDist = calculateDistance(nextPhaseValue, phaseCenter);
        if (nextDist < currDist) {
          isClosest = false;
        }
      }
    }
    
    // If not closest, return the crescent/gibbous phase instead
    if (!isClosest) {
      if (phaseName === 'New Moon' || phaseName === 'First Quarter') {
        // These are in the waxing half
        return phaseValue < 0.25 ? 'Waxing Crescent' : 'Waxing Gibbous';
      } else {
        // Full Moon and Last Quarter are in the waning half
        return phaseValue < 0.75 ? 'Waning Gibbous' : 'Waning Crescent';
      }
    }
  }
  
  return phaseName;
}

// Standalone helper functions for moon data calculations
function calculateIlluminationData(moonIlluminationData: MoonIllumination, phaseValue: number) {
  return {
    moonIllumination: {
      fraction: moonIlluminationData.fraction,
      phase: phaseValue,
      angle: moonIlluminationData.angle
    },
    phase: phaseValue,
    illumination: Number(moonIlluminationData.fraction) * 100
  };
}

function calculateMoonPositionData(moonPosition:MoonPosition) {
  
  const moonRadiusKm = 1737.4;
  const angularSizeRad = 2 * Math.atan2(moonRadiusKm, moonPosition.distance);
  
  return {
    moonPosition: moonPosition,
    angularSize: angularSizeRad * (180 / Math.PI) * 60,
    distance: moonPosition.distance
  };
}

// function formatMoonPosition(position: MoonPosition | null) {
//   if (!position) return null;
  
//   return {
//     altitude: position.altitudeDegrees.toFixed(2) + '°',
//     azimuth: position.azimuthDegrees.toFixed(2) + '°',
//     distance: position.distance.toFixed(0) + ' km',
//     parallacticAngle: position.parallacticAngleDegrees.toFixed(2) + '°'
//   };
// }

function calculateMoonTimesData(targetDate: Date, lat: number, lon: number) {
  const times = getMoonTimes(targetDate, lat, lon);
  return {
    moonTimes: {
      rise: times.rise instanceof Date ? times.rise : null,
      set: times.set instanceof Date ? times.set : null,
      alwaysUp: times.alwaysUp,
      alwaysDown: times.alwaysDown
    }
  };
}

function calculateNextLunarEvents(targetDate: Date, phaseNum: number, isFuture?: boolean) {
  if (isFuture) return null;
  
  const nextFullMoonDate = new Date(targetDate);
  const nextNewMoonDate = new Date(targetDate);
  
  const daysUntilFull = ((0.5 - phaseNum + 1) % 1) * 29.53;
  const daysUntilNew = ((0 - phaseNum + 1) % 1) * 29.53;
  
  nextFullMoonDate.setDate(targetDate.getDate() + daysUntilFull);
  nextNewMoonDate.setDate(targetDate.getDate() + daysUntilNew);
  
  const diffTime = nextFullMoonDate.getTime() - targetDate.getTime();
  
  return {
    nextFullMoon: nextFullMoonDate,
    nextNewMoon: nextNewMoonDate,
    daysUntilNextFullMoon: Number((diffTime / (1000 * 60 * 60 * 24)).toFixed(1))
  };
}

function calculatePhaseInfo(phaseNum: number, illumination: number) {
  const isCrescent = illumination < 50;
  
  return {
    ageOfMoon: Number((phaseNum * 29.53).toFixed(1)),
    phaseName: getPhaseName(phaseNum),
    phaseSide: (phaseNum < 0.5 ? 'Waxing' : 'Waning') + (isCrescent ? ' Crescent' : ' Gibbous')
  };
}

function calculatePhaseRotation(targetDate:Date, moonIllumination:MoonIllumination, moonPosition:MoonPosition) {
    let rotationDegrees = (moonIllumination.angle * 180 / Math.PI - moonPosition.parallacticAngleDegrees);
    rotationDegrees = (rotationDegrees + 360 + 180) % 360 - 180;
    // rotationDegrees = -(rotationDegrees + 360 + 180) % 360 + 90;
	console.log(rotationDegrees);
	// console.log(rotationRadians);
	// console.log(targetDate.getHours()+'h:', 'moonIllumination.angle: '+moonIllumination.angle, 'moonPosition.parallacticAngle: '+moonPosition.parallacticAngle);
	return moonPosition.parallacticAngleDegrees;
}
/*
0h: moonIllumination.angle: -0.21539371878749766 moonPosition.parallacticAngle: -0.02053312519012114
moon.ts:239 1h: moonIllumination.angle: -0.30849690656698925 moonPosition.parallacticAngle: -0.5306237272830638
moon.ts:239 2h: moonIllumination.angle: -0.39747935537377543 moonPosition.parallacticAngle: -0.7913635876848463
moon.ts:239 3h: moonIllumination.angle: -0.48151651597743605 moonPosition.parallacticAngle: -0.8939013980307997
moon.ts:239 4h: moonIllumination.angle: -0.5601223177656596 moonPosition.parallacticAngle: -0.9184985393349862
moon.ts:239 5h: moonIllumination.angle: -0.6331095333718746 moonPosition.parallacticAngle: -0.8993773662358462
moon.ts:239 6h: moonIllumination.angle: -0.7005267243466765 moonPosition.parallacticAngle: -0.8504343295841441
moon.ts:239 7h: moonIllumination.angle: -0.7625900419706249 moonPosition.parallacticAngle: -0.7769788721237599
moon.ts:239 8h: moonIllumination.angle: -0.8196218007805958 moonPosition.parallacticAngle: -0.6804013247830432
moon.ts:239 9h: moonIllumination.angle: -0.8720013160769066 moonPosition.parallacticAngle: -0.5604947200730531
moon.ts:239 10h: moonIllumination.angle: -0.920128950939629 moonPosition.parallacticAngle: -0.41728057991829726
moon.ts:239 11h: moonIllumination.angle: -0.9644018308052018 moonPosition.parallacticAngle: -0.2529749433432356
moon.ts:239 12h: moonIllumination.angle: -1.0051987425014042 moonPosition.parallacticAngle: -0.07371247380962634
moon.ts:239 13h: moonIllumination.angle: -1.0428717288611786 moonPosition.parallacticAngle: 0.11033967664988807
moon.ts:239 14h: moonIllumination.angle: -1.0777422708030926 moonPosition.parallacticAngle: 0.28745253989387737
moon.ts:239 15h: moonIllumination.angle: -1.1101004296675343 moonPosition.parallacticAngle: 0.4479935190968606
moon.ts:239 16h: moonIllumination.angle: -1.1402057918333726 moonPosition.parallacticAngle: 0.5864957454422206
moon.ts:239 17h: moonIllumination.angle: -1.1682894230127188 moonPosition.parallacticAngle: 0.7011700426241928
moon.ts:239 18h: moonIllumination.angle: -1.1945563047082908 moonPosition.parallacticAngle: 0.7920530069842401
moon.ts:239 19h: moonIllumination.angle: -1.2191879288904532 moonPosition.parallacticAngle: 0.85903956536355
moon.ts:239 20h: moonIllumination.angle: -1.2423448570262265 moonPosition.parallacticAngle: 0.8999920551986255
moon.ts:239 21h: moonIllumination.angle: -1.2641691286783887 moonPosition.parallacticAngle: 0.908113877313349
moon.ts:239 22h: moonIllumination.angle: -1.2847864685193962 moonPosition.parallacticAngle: 0.8664583888107011
moon.ts:239 23h: moonIllumination.angle: -1.3043082735729676 moonPosition.parallacticAngle: 0.7347052186200299
*/

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
  const phaseRotation = ref<number | null>(null);


  // Load location from cookie
  function loadLocationFromCookie() {
	const savedLocation = getCookie('moonLocation');
	
	if (savedLocation) {
		try {
		const { name, lat, lon } = JSON.parse(savedLocation);
		location.value = { name, lat, lon };
		fetchMoonPhase();
		return true; // Indicate that we loaded from cookie
		} catch (e) {
		console.error('Failed to load location from cookie', e);
		deleteCookie('moonLocation'); // Remove invalid cookie
		}
	}
	return false; // No cookie or invalid cookie
  }

  // Set default location (New York as an example)
  function setDefaultLocation() {
    location.value = {
      name: 'Montréal, Qc, Canada',
      lat: 45.5017,
      lon: -73.5673
    };
  }

  // Call this when the store is initialized
  onMounted(() => {
    loadLocationFromCookie();
  });
  
  const formattedDate = computed(() => {
    if (!lastUpdated.value) return '';
    const date = lastUpdated.value;
    const dateStr = date.toLocaleDateString('en-CA', {
    //   weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-CA', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${dateStr}`; //  - ${timeStr}
  });
  
  function setLocation(newLocation: Location | null) {
    // console.log('Setting location:', newLocation); // Debug log
    location.value = newLocation;
    if (newLocation) {
      // Save to cookie when location is set
    //   console.log('Saving to cookie:', newLocation); // Debug log
      setCookie('moonLocation', JSON.stringify(newLocation));
      fetchMoonPhase();
    } else {
      // Clear cookie when location is removed
    //   console.log('Clearing location cookie'); // Debug log
      deleteCookie('moonLocation');
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
      phaseRotation.value = null;
    }
  }

  async function fetchMoonPhase(date?: Date, isNotNow?: boolean) {
    try {
      if (!location.value) {
        console.log('Location not set, skipping moon phase fetch');
        return;
      }
      
      const targetDate = date || new Date();
      const moonIlluminationData = getMoonIllumination(targetDate) as MoonIllumination;
      const phaseValue = extractPhaseValue(moonIlluminationData);
      const phaseNum = Number(phaseValue);
      
      // Calculate all moon data
      const illuminationData = calculateIlluminationData(moonIlluminationData, phaseValue);
  	  const moonPositionData = getMoonPosition(targetDate, location.value.lat, location.value.lon);
      const positionData = calculateMoonPositionData(moonPositionData);
      const timesData = calculateMoonTimesData(targetDate, location.value.lat, location.value.lon);
      const lunarEventsData = calculateNextLunarEvents(targetDate, phaseNum, isNotNow);
      const phaseInfoData = calculatePhaseInfo(phaseNum, illuminationData.illumination);
      const phaseRotationData = calculatePhaseRotation(targetDate, moonIlluminationData, moonPositionData);
      
      // Assign calculated values to refs
      Object.assign(moonIllumination, illuminationData.moonIllumination);
      phase.value = illuminationData.phase;
      illumination.value = illuminationData.illumination;
      
	  if (positionData) {
		moonPosition.value = moonPositionData;
		angularSize.value = positionData.angularSize;
		distance.value = positionData.distance;
	  }
      
      moonTimes.value = timesData.moonTimes;
	//   console.log(timesData, targetDate, location.value.lat, location.value.lon);
      
      if (lunarEventsData) {
        nextFullMoon.value = lunarEventsData.nextFullMoon;
        nextNewMoon.value = lunarEventsData.nextNewMoon;
        daysUntilNextFullMoon.value = lunarEventsData.daysUntilNextFullMoon;
      }
      
      ageOfMoon.value = phaseInfoData.ageOfMoon;
      phaseName.value = phaseInfoData.phaseName;
      phaseSide.value = phaseInfoData.phaseSide;
      phaseRotation.value = phaseRotationData;
      
      lastUpdated.value = targetDate;
    } catch (error) {
      console.error('Error fetching moon phase:', error);
      throw error;
    }
  }
  
  // Add currentDate ref for tracking the selected date
  const currentDate = ref<Date>(new Date());
  const currentDateUseTime = ref<boolean>(false);
  
  // Add a method to change the date
  async function setCurrentDate(date: Date, useTime?: boolean) {
  if (!useTime) {
    date.setHours(12, 0, 0, 0); // Set to noon
  }
    currentDate.value = date;
    currentDateUseTime.value = !!useTime;
    await fetchMoonPhase(date, true);
  }

  // Format moon position for display
//   const formattedPosition = computed(() => formatMoonPosition(moonPosition.value));

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

  console.log(phaseRotation);
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
	phaseRotation,
    currentDate,
	currentDateUseTime,
    
    // Computed
    formattedDate,
    // formattedPosition,
    formattedMoonTimes,
    
    // Methods
    setLocation,
    fetchMoonPhase,
    setCurrentDate
  };
});
