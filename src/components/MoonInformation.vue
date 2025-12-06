<template>
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
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useMoonStore } from '@/store/moon'
import { format } from 'date-fns'

// Inject showCalendar from parent component
const showCalendar = inject('showCalendar')

const moonStore = useMoonStore()

// Format time for display
const formatTime = (date: Date | null) => {
	if (!date) return '--:--'
	return date.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	})
}

// Format date for display
const formatDate = (date: Date) => {
	return format(date, 'MMM d, yyyy')
}
</script>

<style scoped>
</style>
