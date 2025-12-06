<template>
	<!-- Moon Phase Display -->
	<div class="d-flex flex-column align-center main-container">
		<div class="top-content d-flex align-center flex-column justify-center">
			<!-- Location Picker -->
			<LocationPicker></LocationPicker>

			<!-- Moon Phase Name -->
			<h1 class="text-h5 font-weight-bold">
				{{ moonStore.phaseName || '&nbsp;' }}
			</h1>

			<!-- Moon Image -->
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
		</div>

		<!-- Moon Information Grid -->
		<v-container class="bottom-content">

			<!-- Time Slider -->
			<div v-if="showTimeSlider">
				<TimeSlider v-model="currentHour" />
			</div>

			<!-- Date and Time Buttons -->
			<p class="text-caption text-center d-flex align-center justify-center">
				<v-btn
					icon
					variant="text"
					size="small"
					@click="goToToday"
					title="Go to today"
					color="primary"
				>
					<v-icon>mdi-calendar-blank</v-icon>
				</v-btn>
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

			<MoonInformation v-if="!showCalendar" />
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
	import { ref, onMounted, watch, provide } from 'vue';
	import { useMoonStore } from '@/store/moon';
	import MoonImage from './MoonImage.vue';
	import LocationPicker from './LocationPicker.vue';
	import MoonCalendar from './MoonCalendar.vue';
	import TimeSlider from './TimeSlider.vue';
	import MoonInformation from './MoonInformation.vue';

	const moonStore = useMoonStore();
	const loading = ref(false);

	const showCalendar = ref(false);
	const showTimeSlider = ref(false);
	const currentHour = ref(new Date().getHours());

	// Provide showCalendar to child components
	provide('showCalendar', showCalendar);

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

	const goToToday = async () => {
		try {
			loading.value = true;
			const today = new Date();
			
			// // Update the hour if we're using the time slider
			// if (showTimeSlider.value) {
			// 	today.setHours(currentHour.value, 0, 0, 0);
			// }
			
			// Use setCurrentDate to update the date and fetch moon phase
			await moonStore.setCurrentDate(today);
			
			// // Close calendar if it's open
			// showCalendar.value = false;
		} catch (error) {
			console.error('Error going to today:', error);
		} finally {
			loading.value = false;
		}
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

	/* Moon Phase Name */
	.main-container {
		height: 100%;
		box-sizing: border-box;
		padding: 16px 0;
		justify-content: space-between;
	}

	.moon-image-container {
		width: calc(100% + 32px);
	}
	.top-content {
		padding: 0;
		width: 100%;
	}
	.bottom-content {
		padding: 0;
		width: 100%;
		flex-grow: 1;
		flex-shrink: 1;
	}

	@media (min-height: 800px) {
		.main-container {
			padding: 20px 0;
		}
		.moon-image-container {
			width: calc(100% + 40px);
		}
	}
</style>
