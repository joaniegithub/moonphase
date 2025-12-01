<template>
  <div class="moon-phase-display">
    <div 
      class="moon-phase" 
      :class="{ 'is-loading': !moonStore.illumination }"
      :data-phase="moonStore.phaseSide"
    >
      <div class="moon-half-shadow">
        <div class="moon-curved-shadow"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMoonStore } from '../store/moon';

const moonStore = useMoonStore();

const moonVars = computed(() => {
  const illumination = moonStore.illumination || 0;
  const phaseSide = moonStore.phaseSide || '';
  
  return {
    _i: illumination < 1 ? '10' : '0',
    _ci: illumination > 50 ? (illumination - 50) : (50 - illumination),
    _crescent: illumination < 50,
    _r: moonStore.moonPosition?.parallacticAngle || 0,
    _phase: `"${phaseSide}"` // For attribute selectors if needed
  };
});
</script>

<style scoped>
.moon-phase-display {
  position: relative;
  width: 70vw;
  height: 70vw;
  max-width: 500px;
  max-height: 500px;
  margin: 20px auto;
  border-radius: 50%;
  overflow: hidden;
  background: transparent;
  /* background: radial-gradient(circle,rgba(0, 0, 0, 0) 99%, rgba(0, 0, 0, 1) 100%); */
}

@media (min-width: 640px) {
  .moon-phase-display {
    width: 500px;
    height: 500px;
  }
}

.moon-phase.is-loading {
  opacity: 0.1;
}
.moon-phase.is-loading .moon-half-shadow {
  opacity: 0;
}
.moon-phase {
  transition: opacity 0.5s ease-in-out;
  opacity: 1;
}
.moon-phase .moon-half-shadow {
  transition: opacity 0.75s ease-in-out;
  opacity: 0.925;
}


.moon-phase {
  --_i: v-bind('moonVars._i');
  --_ci: v-bind('moonVars._ci');
  --_curvedColor: v-bind('(moonVars._crescent ? '#000' : '#fff')');
  --_crescent: v-bind('(moonVars._crescent ? '20px' : '0px')');
  --_r: v-bind('moonVars._r');
  /* --_phase: v-bind('moonVars._phase'); */

  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  transform: translateZ(0);
  background: url('/images/moon.png') center / cover no-repeat;
  filter: sepia(0.5);
  opacity: 1;
}
  
.moon-half-shadow {
  display: block;
  position: absolute;
  left: -2px;
  right: -2px;
  top: 0px;
  bottom: 0px;
  mix-blend-mode: multiply;
  opacity: 0.9;
  rotate: calc(var(--_r) * 1deg);
  filter: blur(5px);
}

.moon-half-shadow::before {
  content: " ";
  display: block;
  width: calc(50% + 20px);
  top: -20px;
  bottom: -20px;
  background-color: #000;
  position: absolute;
  
}

.moon-phase[data-phase*="Waning"] .moon-half-shadow::before {
  right: -20px;
}

.moon-phase[data-phase*="Waxing"] .moon-half-shadow::before {
  left: -20px;
}

.moon-curved-shadow {
  width: calc(2% * var(--_ci) + var(--_i)*1px - var(--_crescent));
  /* transition: width 0.25s ease-in-out; */
  top: calc(-7px - var(--_i)*1px);
  bottom: calc(-7px - var(--_i)*1px);
  border-radius: 50%;
  left: 50%;
  transform: translateX(-50%);
  position: absolute;
  background-color: var(--_curvedColor);
}

.moon-curved-shadow::before {
  content: " ";
  position: absolute;
  display: block;
  width: calc(100% + 10px + var(--_crescent));
  /* transition: width 0.25s ease-in-out; */
  height: 100%;
  border-radius: 50%;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--_curvedColor);
  filter: blur(20px);
}

/* .moon-curved-shadow::after {
  content: " ";
  position: absolute;
  display: block;
  width: 100px;
  /* transition: width 0.25s ease-in-out; * /
  height: 200%;
  border-radius: 50%;
  top: -50%;
  /* left: 50%;
  transform: translateX(-50%); * /
  background-color: #000;
  filter: blur(50px);
}

.moon-phase[data-phase*="Waning"] .moon-curved-shadow::after {
  left: -50px;
}

.moon-phase[data-phase*="Waxing"] .moon-curved-shadow::after {
  right: -50px;
}
.moon-phase[data-phase*="Waning Gibbous"] .moon-curved-shadow::after {
  right: -40px;
  left: unset;
}

.moon-phase[data-phase*="Waxing Gibbous"] .moon-curved-shadow::after {
  left: -40px;
  right: unset;
} */
</style>
