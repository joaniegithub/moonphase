<template>
	<div class="time-slider-container">
		<!-- Moon Time Markers Overlay -->
		<div class="moon-markers-overlay">
			<!-- Moon Rise Marker -->
			<div
				v-if="
					moonStore.moonTimes?.rise &&
					!moonStore.moonTimes.alwaysUp &&
					!moonStore.moonTimes.alwaysDown
				"
				class="moon-time-marker moon-rise-marker"
				:style="{ left: getMoonTimePosition(moonStore.moonTimes.rise) + '%' }"
			>
				<SvgIcon :path="mdiWeatherMoonsetUp" :size="16"></SvgIcon>
			</div>

			<!-- Moon Set Marker -->
			<div
				v-if="
					moonStore.moonTimes?.set &&
					!moonStore.moonTimes.alwaysUp &&
					!moonStore.moonTimes.alwaysDown
				"
				class="moon-time-marker moon-set-marker"
				:style="{ left: getMoonTimePosition(moonStore.moonTimes.set) + '%' }"
			>
				<SvgIcon :path="mdiWeatherMoonsetDown" :size="16"></SvgIcon>
			</div>
		</div>

		<v-slider
			v-model="localHour"
			class="mt-4"
			min="0"
			:max="24"
			step="1"
			:thumb-size="24"
			:thumb-label="'always'"
			:thumb-label-text="
				(value: number) => (value === 24 ? '24:00' : `${value}:00`)
			"
			:ticks="thickLabels"
			show-ticks="always"
			@update:modelValue="handleTimeUpdate"
		></v-slider>
	</div>
</template>

<script setup lang="ts">
	import { ref, watch } from 'vue';
	import { useMoonStore } from '@/store/moon';
	import SvgIcon from './MdiIcon.vue';
	import { mdiWeatherMoonsetUp, mdiWeatherMoonsetDown } from '@mdi/js';

	interface Props {
		modelValue: number;
	}

	interface Emits {
		(e: 'update:modelValue', value: number): void;
	}

	const props = defineProps<Props>();
	const emit = defineEmits<Emits>();

	const moonStore = useMoonStore();
	const thickLabels = { 0: '0', 6: '6', 12: '12', 18: '18', 24: '24' };

	const localHour = ref(props.modelValue);

	watch(
		() => props.modelValue,
		newValue => {
			localHour.value = newValue;
		}
	);

	const handleTimeUpdate = () => {
		emit('update:modelValue', localHour.value);

		const newDate = new Date(moonStore.currentDate || new Date());
		if (localHour.value === 24) {
			// Set to 23:59:59.999 for the end of the day
			newDate.setHours(23, 59, 59, 999);
		} else {
			newDate.setHours(localHour.value, 0, 0, 0);
		}
		moonStore.setCurrentDate(newDate, true);
	};

	// Calculate position for moon time markers on slider (0-100%)
	const getMoonTimePosition = (moonTime: Date) => {
		const hours = moonTime.getHours();
		const minutes = moonTime.getMinutes();
		const totalMinutes = hours * 60 + minutes;
		const dayMinutes = 24 * 60;
		return (totalMinutes / dayMinutes) * 100;
	};
</script>

<style scoped>
	.time-slider-container {
		position: relative;
	}

	.moon-markers-overlay {
		position: absolute;
		top: -8px;
		left: 16px;
		right: 16px;
		height: 20px;
		pointer-events: none;
		z-index: 0;
	}

	.moon-time-marker {
		position: absolute;
		top: 0px;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		pointer-events: auto;
	}

	.moon-time-marker svg {
		background: rgb(var(--v-theme-surface));
		border-radius: 50%;
	}

	.moon-rise-marker,
	.moon-set-marker {
		color: var(--v-theme-primary);
	}

	.moon-time-marker .v-icon {
		font-size: 16px !important;
	}
</style>
