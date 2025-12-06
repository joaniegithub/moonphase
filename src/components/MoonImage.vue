<template>
	<div class="moon-phase-display">
		<div
			class="moon-phase"
			:class="{
				'is-loading': !moonStore.illumination,
				'moon-visible': isMoonVisible
			}"
			:data-phase="moonStore.phaseSide"
			:style="{ opacity: isMoonVisible ? 1 : 0 }"
		>
			<div class="moon-half-shadow">
				<div class="moon-curved-shadow"></div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref, watch } from 'vue';
	import { useMoonStore } from '../store/moon';

	const moonStore = useMoonStore();
	const isMoonVisible = ref(true);

	// Check if current time is between moonrise and moonset
	const checkMoonVisibility = () => {
		if (!moonStore.currentDateUseTime) {
			isMoonVisible.value = true;
			return;
		}
		if (!moonStore.moonTimes?.rise || !moonStore.moonTimes?.set) {
			isMoonVisible.value = true;
			return;
		}

		// Use the current time from the store if available (from the time slider), otherwise use the current time
		const currentTime = moonStore.currentDate || new Date();
		const rise = new Date(moonStore.moonTimes.rise);
		const set = new Date(moonStore.moonTimes.set);

		// If moon sets on the next day
		if (set < rise) {
			isMoonVisible.value = currentTime >= rise || currentTime <= set;
		} else {
			isMoonVisible.value = currentTime >= rise && currentTime <= set;
		}
	};

	// Watch for changes in moon times and current date
	watch(
		[() => moonStore.moonTimes, () => moonStore.currentDate],
		() => {
			checkMoonVisibility();
		},
		{ deep: true }
	);

	// Check visibility initially and set up interval
	onMounted(() => {
		checkMoonVisibility();
		// Update visibility every minute
		const interval = setInterval(checkMoonVisibility, 60000);
		return () => clearInterval(interval);
	});

	const moonVars = computed(() => {
		const illumination = moonStore.illumination || 0;
		const phaseSide = moonStore.phaseSide || '';

		return {
			_i: illumination,
			_w: illumination < 1 ? '10' : '0',
			_ci: illumination > 50 ? illumination - 50 : 50 - illumination,
			_crescent: illumination < 50,
			_r: moonStore.currentDateUseTime ? moonStore.phaseRotation || 0 : 0,
			_phase: `"${phaseSide}"` // For attribute selectors if needed
		};
	});
</script>

<style scoped>
	.moon-phase-display {
		position: relative;
		width: 100%;
		margin: 16px auto;
		border-radius: 50%;
		overflow: hidden;
		background: transparent;
		flex-grow: 1;
		aspect-ratio: 1 / 1;
	}
	/* background: radial-gradient(circle,rgba(0, 0, 0, 0) 99%, rgba(0, 0, 0, 1) 100%); */

	/* @media (min-width: 640px) {
  .moon-phase-display {
    width: 500px;
    height: 500px;
  }
} */

	.moon-phase.is-loading {
		opacity: 0.1;
	}
	.moon-phase.is-loading .moon-half-shadow {
		opacity: 0;
	}
	.moon-phase {
		transition: opacity 0.25s ease-in-out;
		opacity: 1;
	}
	.moon-phase .moon-half-shadow {
		transition: opacity 0.5s ease-in-out;
		opacity: 0.925;
	}

	.moon-phase {
		--_i: v-bind('moonVars._i');
		--_w: v-bind('moonVars._w');
		--_ci: v-bind('moonVars._ci');
		--_curvedColor: v-bind('(moonVars._crescent ? ' #000 ' : ' #fff ')');
		--_crescent: v-bind('(moonVars._crescent ? ' 20px ' : ' 0px ')');
		--_r: v-bind('moonVars._r');
		/* --_phase: v-bind('moonVars._phase'); */

		width: 100%;
		height: 100%;
		overflow: hidden;
		position: absolute;
		top: 0;
		transform: translateZ(0);
		background: url('/images/moon.png') center / cover no-repeat;
		filter: sepia(0.20);
		opacity: 1;
		rotate: calc(var(--_r) * 1deg);
	}

	.moon-phase::after {
		content: ' ';
		box-shadow:
			inset 0 0 1rem #00000088,
			inset 0 0 0.5rem #000;
		display: block;
		position: absolute;
		left: -1px;
		top: -1px;
		right: -1px;
		bottom: -1px;
		border-radius: 50%;
		opacity: calc(var(--_i) / 100);
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
		filter: blur(5px);
	}

	.moon-half-shadow::before {
		content: ' ';
		display: block;
		width: calc(50% + 20px);
		top: -20px;
		bottom: -20px;
		background-color: #000;
		position: absolute;
	}

	.moon-phase[data-phase*='Waning'] .moon-half-shadow::before {
		right: -20px;
	}

	.moon-phase[data-phase*='Waxing'] .moon-half-shadow::before {
		left: -20px;
	}

	.moon-curved-shadow {
		width: calc(2% * var(--_ci) + var(--_w) * 1px - var(--_crescent));
		top: calc(-7px - var(--_w) * 1px);
		bottom: calc(-7px - var(--_w) * 1px);
		border-radius: 50%;
		left: 50%;
		transform: translateX(-50%);
		position: absolute;
		background-color: var(--_curvedColor);
	}

	.moon-curved-shadow::before {
		content: ' ';
		position: absolute;
		display: block;
		width: calc(100% + 10px + var(--_crescent));
		height: 100%;
		border-radius: 50%;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		background-color: var(--_curvedColor);
		filter: blur(20px);
	}
</style>
