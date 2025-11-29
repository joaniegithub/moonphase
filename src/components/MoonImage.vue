<template>
    <div class="moon-phase-display">
        <div class="moon-phase" :phase="moonStore.phaseSide">
            <div class="moon-half-shadow">
            <div class="moon-curved-shadow"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useMoonStore } from '../store/moon';

const moonStore = useMoonStore();
console.log(moonStore);

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

.moon-phase {
  --_i: v-bind('((moonStore.illumination || 0) < 1 ? 10 : 0)');
  --_ci: v-bind('((moonStore.illumination ? moonStore.illumination > 50 ? (moonStore.illumination-50) : 50-moonStore.illumination : 0))');
  --_curvedColor: v-bind('((moonStore.illumination || 0) > 50) ? "#fff" : "#000"');
  --_r: v-bind('moonStore?.moonPosition?.parallacticAngle || 0');

  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  transform: translateZ(0);
  background: url('images/moon.png') center / cover no-repeat;
  filter: sepia(0.5);
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
  /* rotate: calc(var(--_r) * 1deg); */
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

.moon-phase[phase*="Waning"] .moon-half-shadow::before {
  right: -20px;
}

.moon-phase[phase*="Waxing"] .moon-half-shadow::before {
  left: -20px;
}

.moon-curved-shadow {
  width: calc(2% * var(--_ci) + var(--_i)*1px);
  top: calc(-7px - var(--_i)*1px);
  bottom: calc(-7px - var(--_i)*1px);
  border-radius: 50%;
  left: 50%;
  transform: translateX(-50%);
  position: absolute;
  background: var(--_curvedColor);
}

.moon-curved-shadow::after {
  content: " ";
  position: absolute;
  display: block;
  width: calc(100% + 10px);
  height: 100%;;
  border-radius: 50%;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background: var(--_curvedColor);
  filter: blur(20px);
}
</style>
