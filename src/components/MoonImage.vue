<template>
    <div class="moon-phase-display">
        <div class="moon-phase" :phase="moonStore.phaseName">
            <div class="moon-half-shadow">
            <div class="moon-curved-shaddow"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useMoonStore } from '../store/moon';

const moonStore = useMoonStore();

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

/*.moon-container {
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
}*/

.moon-phase {
  --_ci: v-bind('(moonStore.illumination ? moonStore.illumination > 50 ? (moonStore.illumination-50) : 50-moonStore.illumination : 0)');
  --_curvedColor: v-bind('((moonStore.illumination || 0) > 50) ? "#fff" : "#000"');
  --_r: v-bind('moonStore?.moonPosition?.parallacticAngle || 0');

  width: 100%;
  height: 100%;
  border: 2px solid #ffffff;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  transform: translateZ(0);
  background: url('images/moon.png') center / cover no-repeat;
  filter: sepia(0.5);
}
  
.moon-half-shadow {
  display: block;
  position: absolute;
  left: -5px;
  top: -5px;
  bottom: -5px;
  right: -5px;
  mix-blend-mode: multiply;
  opacity: 0.85;
  filter: blur(5px);
  rotate: calc(var(--_r) * 1deg);
}
.moon-half-shadow::before {
  content: " ";
  display: block;
  width: 50%;
  height: 100%;
  background-color: #000;
  position: absolute;
}

.moon-phase[phase*="Crescent"] .moon-half-shadow::before,
.moon-phase[phase*="Last Quarter"] .moon-half-shadow::before,
.moon-phase[phase*="Waning"] .moon-half-shadow::before {
  right: 0;
}

/* .moon-phase[phase*="Crescent"] .moon-half-shadow::before, */
.moon-phase[phase*="First Quarter"] .moon-half-shadow::before,
.moon-phase[phase*="Waxing"] .moon-half-shadow::before {
  left: 0;
}

.moon-curved-shaddow {
  width: calc(2% * var(--_ci));
  height: 100%;
  /* animation: rotate 20s linear infinite; */
  border-radius: 50%;
  left: 50%;
  transform: translateX(-50%);
  position: absolute;
  background: var(--_curvedColor);
}
  
/* .moon-curved-shaddow::before, .moon-curved-shaddow::after {
  content: " ";
  display: block;
  transform-style: preserve-3d;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: transform 20s;
  position: absolute;
  backface-visibility: hidden;
} */
/* .moon-curved-shaddow::before {
  background-color: #222;
}
.moon-curved-shaddow::after {
  background-color: #fff;
    transform: rotateY(180deg);
} */

@keyframes rotate {
  0%   { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}

@keyframes flip {
  0%   { left: 0; }
  100% { left: 100%; }
}

/*.moon-curved-shaddow {
  --moon-phase-blur: 3px;
  --moon-phase-mask-bg: #000;
  --moon-phase-mask-opacity: 0.85;
  --moon-phase-filter: sepia(1) grayscale(0.25);
  
  --_i: v-bind('(moonStore.illumination || 0)');
  --_w: calc(100% - 1% * v-bind('(moonStore.illumination || 0)'));
  --_lat: v-bind('moonStore.location.lat');
  --_hour: v-bind('moonStore.currentDate.getHours()');
  --_l: calc(var(--_lat) * 1.5deg);
  --_a: calc((var(--_hour) - 12) * 15 * 0.7 * 1deg);
  --_r: calc(var(--_l) + var(--_a));
  
  aspect-ratio: 1;
  border-radius: 50%;
  display: block;
  overflow: clip;
  position: relative;
  rotate: var(--_r, 0deg);
}*/

/*.moon-curved-shaddow::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('images/moon.png') center / cover no-repeat;
  filter: var(--moon-phase-filter);
}

.moon-curved-shaddow::after {
  content: '';
  background-color: var(--moon-phase-mask-bg, #000);
  border-radius: var(--_btlr, 0) var(--_btrr, 0) var(--_bbrr, 0) var(--_bblr, 0);
  filter: var(--moon-phase-mask-filter, blur(var(--moon-phase-blur, 0px)));
  height: 100%;
  inset-inline: var(--_ii, auto 0);
  opacity: var(--moon-phase-mask-opacity, .85);
  position: absolute;
  width: var(--_w);
}*/

/* Phases */
/*.moon-curved-shaddow[phase*="First Quarter"],
.moon-curved-shaddow[phase*="Waxing"] {
  --_ii: 0 auto;
}

.moon-curved-shaddow[phase*="Crescent"],
.moon-curved-shaddow[phase*="First Quarter"],
.moon-curved-shaddow[phase*="Waxing"] {
  --_bblr: 100%;
  --_btlr: 100%;
}

.moon-curved-shaddow[phase*="Crescent"],
.moon-curved-shaddow[phase*="Last Quarter"],
.moon-curved-shaddow[phase*="Waning"] {
  --_btrr: 100%;
  --_bbrr: 100%;
}

.moon-curved-shaddow[phase*="Gibbous"]::after {
  border-radius: 0;
  width: 100% !important;
}

.moon-curved-shaddow[phase="Waxing Gibbous"]::after {
  mask: radial-gradient(circle at 100% 50%,
    #0000 calc(100% - var(--_w)),
    #000 calc(100% - var(--_w) + 1px + (2 * var(--moon-phase-blur, 0))) 100%);
}
.moon-curved-shaddow[phase="Waning Gibbous"]::after {
  mask: radial-gradient(circle at 0% 50%,
    #0000 calc(100% - var(--_w)),
    #000 calc(100% - var(--_w) + 1px + (2 * var(--moon-phase-blur, 0))) 100%);
}*/
/* Remove pulse animation for cleaner look */
</style>
