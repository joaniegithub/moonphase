<template>
	<!-- Moon Phase Display -->
	<div class="d-flex flex-column align-center main-container">
		<!-- Moon Phase Name -->
		<h1 class="text-h5 font-weight-bold">
			{{ moonStore.phaseName || '&nbsp;' }}
		</h1>

		<!-- Navigation Buttons and Moon Image -->
		<div class="d-flex align-center justify-center moon-image-container">
			<!-- Previous Button -->
			<v-btn
				color="primary"
				variant="text"
				@click="changeDate(-1)"
				:disabled="loading"
				class="mx-2 navigation-button"
				icon
			>
				<v-icon icon="mdi-chevron-left" size="48"></v-icon>
			</v-btn>

			<MoonImage />

			<!-- Next Button -->
			<v-btn
				color="primary"
				variant="text"
				@click="changeDate(1)"
				:disabled="loading"
				class="mx-2 navigation-button"
				icon
			>
				<v-icon icon="mdi-chevron-right" size="48"></v-icon>
			</v-btn>
		</div>

		<!-- Moon Information Grid -->
		<v-container class="bottom-info">
			<div class="d-flex align-center justify-center">
				<!-- <v-icon small icon="mdi-map-marker"></v-icon>
			<span class="text-subtitle-2">{{ moonStore.location.name }}</span> -->
				<LocationPicker></LocationPicker>
			</div>
			<p class="text-caption text-center mt-2 d-flex align-center justify-center">
				<v-btn
					icon
					variant="text"
					size="small"
					@click.stop="showCalendar = !showCalendar"
					:color="'primary'"
				>
					<v-icon>mdi-calendar</v-icon>
				</v-btn>
				{{ moonStore.formattedDate }}
				<v-btn
					icon
					variant="text"
					size="small"
					@click="showTimeSlider = !showTimeSlider"
					:color="'primary'"
				>
					<v-icon>mdi-clock-outline</v-icon>
				</v-btn>
			</p>

			<!-- Time Slider -->
			<div v-if="showTimeSlider">
				<TimeSlider v-model="currentHour" />
			</div>
			<!-- Moon Information (shown when calendar is closed) -->
			<v-card v-if="!showCalendar" variant="outlined" class="mt-2">
				<v-card-title class="text-h6 text-center my-2">
					Moon Information
				</v-card-title>
				<v-card-text class="pb-1">
					<v-row dense>
						<v-col cols="6" class="text-right pr-2">
							<div class="mb-1 text-grey-lighten-1">Illumination:</div>
							<div class="mb-1 text-grey-lighten-1">Moon Age:</div>
							<div class="mb-1 text-grey-lighten-1">Distance:</div>
							<div class="mb-1 text-grey-lighten-1">Moonrise:</div>
							<div class="text-grey-lighten-1">Moonset:</div>
						</v-col>
						<v-col cols="6" class="text-left pl-2">
							<div class="mb-1 font-weight-bold">
								{{
									moonStore.illumination ? moonStore.illumination.toFixed(1) + '%' : '--'
								}}
							</div>
							<div class="mb-1 font-weight-bold">
								{{ moonStore.ageOfMoon ? moonStore.ageOfMoon + ' days' : '--' }}
							</div>
							<div class="mb-1 font-weight-bold">
								{{
									moonStore.distance
										? Math.round(moonStore.distance).toLocaleString() + ' km'
										: '--'
								}}
							</div>
							<div class="mb-1 font-weight-bold">
								{{
									moonStore.moonTimes?.rise ? formatTime(moonStore.moonTimes.rise) : '--'
								}}
							</div>
							<div class="font-weight-bold">
								{{
									moonStore.moonTimes?.set ? formatTime(moonStore.moonTimes.set) : '--'
								}}
							</div>
						</v-col>
					</v-row>
				</v-card-text>
				<!--v-divider class="mb-1 mt-1"></!--v-divider-->
				<v-card-title class="text-h6 text-center mb-2">Moon Events</v-card-title>
				<v-card-text>
					<v-row dense>
						<v-col cols="6" class="text-right pr-2">
							<div class="mb-1 text-grey-lighten-1">Next Full Moon:</div>
							<div class="mb-1 text-grey-lighten-1">Next New Moon:</div>
						</v-col>
						<v-col cols="6" class="text-left pl-2">
							<div class="mb-1 font-weight-bold">
								{{ moonStore.nextFullMoon ? formatDate(moonStore.nextFullMoon) : '--' }}
							</div>
							<div class="mb-1 font-weight-bold">
								{{ moonStore.nextNewMoon ? formatDate(moonStore.nextNewMoon) : '--' }}
							</div>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>

			<!-- Calendar (shown when calendar is open) -->
			<v-card v-else variant="outlined" class="mt-2">
				<MoonCalendar @close="showCalendar = false" />
			</v-card>
		</v-container>

		<!-- Loading Indicator -->
		<v-progress-linear
			v-if="loading"
			indeterminate
			color="primary"
			class="mt-4"
		></v-progress-linear>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted, watch } from 'vue';
	import { useMoonStore } from '@/store/moon';
	import MoonImage from './MoonImage.vue';
	import LocationPicker from './LocationPicker.vue';
	import MoonCalendar from './MoonCalendar.vue';
	import SvgIcon from './MdiIcon.vue';
	import TimeSlider from './TimeSlider.vue';
	import { format } from 'date-fns';
	import { mdiWeatherMoonsetUp, mdiWeatherMoonsetDown } from '@mdi/js';

	// Debug: Check if the icons have valid path data
	console.log('mdiWeatherMoonsetUp:', mdiWeatherMoonsetUp);
	console.log('mdiWeatherMoonsetDown:', mdiWeatherMoonsetDown);
	const moonStore = useMoonStore();
	const loading = ref(false);

	const showCalendar = ref(false);
	const showTimeSlider = ref(false);
	const currentHour = ref(new Date().getHours());

	// Format time for display
	const formatTime = (date: Date | null) => {
		if (!date) return '--:--';
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	};

	const changeDate = async (days: number) => {
		try {
			loading.value = true;

			// Get the current date from the store
			const currentDate = moonStore.currentDate || new Date();

			// Calculate the new date
			const targetDate = new Date(currentDate);
			targetDate.setDate(currentDate.getDate() + days);

			// Update the hour if we're using the time slider
			if (showTimeSlider.value) {
				targetDate.setHours(currentHour.value, 0, 0, 0);
			}

			// Use setCurrentDate to update the date and fetch moon phase
			await moonStore.setCurrentDate(targetDate);
		} catch (error) {
			console.error('Error changing date:', error);
		} finally {
			loading.value = false;
		}
	};

	// Format date for display
	const formatDate = (date: Date) => {
		return format(date, 'MMM d, yyyy');
	};

	// Watch for date changes to reset the hour
	watch(
		() => moonStore.currentDate,
		newDate => {
			if (newDate) {
				const hours = newDate.getHours();
				const minutes = newDate.getMinutes();
				const seconds = newDate.getSeconds();
				// Check if it's the end of day (23:59:59.999)
				currentHour.value =
					hours === 23 &&
					minutes === 59 &&
					seconds === 59 &&
					newDate.getMilliseconds() >= 999
						? 24
						: hours;
			}
		}
	);

	// Initialize moon phase data
	onMounted(async () => {
		try {
			await moonStore.fetchMoonPhase();
		} catch (error) {
			console.error('Error initializing moon phase data:', error);
		} finally {
			loading.value = false;
		}
	});
</script>

<style scoped>
	.navigation-button {
		width: 48px !important;
		height: 48px !important;
		min-width: 48px !important;
		min-height: 48px !important;
		border-radius: 50% !important;
		padding: 0 !important;
		margin: 0 8px !important;
	}

	.navigation-button:hover::before {
		opacity: 0.08 !important;
		border-radius: 50% !important;
	}

	.navigation-button:active::before {
		opacity: 0.16 !important;
		border-radius: 50% !important;
	}

	/* Ensure the icon is properly centered */
	.navigation-button .v-icon {
		margin: 0 !important;
		padding: 0 !important;
	}

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
		color: #b0bec5;
		font-size: 1.1rem;
		opacity: 0.8;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.8;
		}
		50% {
			opacity: 0.5;
		}
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

	.v-picker--date .v-date-picker-table--date th {
		padding: 4px 0;
	}

	.v-picker--date .v-date-picker-table--date th,
	.v-picker--date .v-date-picker-table--date td {
		width: 36px;
		height: 36px;
	}

	.v-picker--date .v-date-picker-table--date .v-btn {
		margin: 0;
		width: 100%;
		height: 100%;
	}

	.main-container {
		height: 100%;
		box-sizing: border-box;
		padding: 20px 0;
		justify-content: space-between;
	}

	.moon-image-container {
		width: calc(100% + 40px);
		flex-grow: 1;
		flex-shrink: 1;
	}
	.bottom-info {
		padding: 0;
	}
</style>
