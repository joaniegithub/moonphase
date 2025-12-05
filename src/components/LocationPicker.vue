<template>
	<div class="location-picker">
		<v-dialog v-model="showDialog" max-width="500px">
			<template v-slot:activator="{ props }">
				<v-btn
					v-bind="props"
					variant="outlined"
					color="primary"
					class="location-button"
					prepend-icon="mdi-map-marker"
					size="small"
				>
					{{ locationName || 'Change Location' }}
				</v-btn>
			</template>

			<v-card>
				<v-card-title>Change Location</v-card-title>
				<v-card-text>
					<v-btn
						block
						color="primary"
						variant="tonal"
						class="mb-4"
						prepend-icon="mdi-crosshairs-gps"
						@click="getCurrentLocation"
						:loading="isGettingLocation"
						:disabled="isLoading"
					>
						Use My Current Location
					</v-btn>

					<v-divider class="my-4">OR</v-divider>

					<v-text-field
						v-model="searchQuery"
						label="Search for a location"
						variant="outlined"
						clearable
						hide-details
						class="mb-4"
						@keyup.enter="searchLocation"
					></v-text-field>

					<div v-if="isLoading" class="text-center py-4">
						<v-progress-circular indeterminate color="primary"></v-progress-circular>
					</div>

					<v-list v-else-if="searchResults.length > 0" class="location-results">
						<v-list-item
							v-for="(result, index) in searchResults"
							:key="index"
							@click="selectLocation(result)"
							class="location-item"
						>
							<v-list-item-title>{{ result.name }}</v-list-item-title>
						</v-list-item>
					</v-list>

					<div
						v-else-if="hasSearched && searchQuery && !isLoading"
						class="text-center py-4"
					>
						No locations found
					</div>

					<div class="current-location mt-4" v-if="currentLocation">
						<v-divider class="my-4"></v-divider>
						<div class="text-subtitle-2 mb-2">Current Location</div>
						<div class="d-flex align-center">
							<v-icon class="mr-2">mdi-map-marker</v-icon>
							<div class="flex-grow-1">
								<div>{{ currentLocation.name }}</div>
								<div class="text-caption text-medium-emphasis">
									{{ currentLocation.lat.toFixed(4) }},
									{{ currentLocation.lon.toFixed(4) }}
								</div>
							</div>
						</div>
					</div>
				</v-card-text>
			</v-card>
		</v-dialog>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted } from 'vue';
	import { getCookie } from '../utils/cookies';
	import { useMoonStore } from '@/store/moon';

	const moonStore = useMoonStore();
	const showDialog = ref(false);
	const searchQuery = ref('');
	const searchResults = ref<any[]>([]);
	const isLoading = ref(false);
	const hasSearched = ref(false);
	const error = ref<string | null>(null);

	const isGettingLocation = ref(false);
	const locationError = ref<string | null>(null);

	const currentLocation = computed(() => moonStore.location);

	const locationName = computed(() => {
		if (!currentLocation.value) return 'Set Location';
		return (
			currentLocation.value.name ||
			`${currentLocation.value.lat.toFixed(2)}, ${currentLocation.value.lon.toFixed(2)}`
		);
	});

	async function getCurrentLocation() {
		if (!navigator.geolocation) {
			locationError.value = 'Geolocation is not supported by your browser';
			return;
		}

		isGettingLocation.value = true;
		locationError.value = null;

		try {
			const position = await new Promise<GeolocationPosition>(
				(resolve, reject) => {
					navigator.geolocation.getCurrentPosition(resolve, reject, {
						enableHighAccuracy: true,
						timeout: 10000,
						maximumAge: 0
					});
				}
			);

			// Get location name using reverse geocoding
			const { latitude: lat, longitude: lon } = position.coords;
			const locationName = await getLocationName(lat, lon);

			const location = {
				name: locationName,
				lat,
				lon
			};

			moonStore.setLocation(location);
			showDialog.value = false;
			searchQuery.value = '';
			searchResults.value = [];
		} catch (err) {
			console.error('Error getting location:', err);
			locationError.value =
				'Could not get your location. Please try again or search manually.';
		} finally {
			isGettingLocation.value = false;
		}
	}

	async function searchLocation() {
		if (!searchQuery.value.trim()) {
			searchResults.value = [];
			hasSearched.value = false;
			return;
		}

		isLoading.value = true;
		error.value = null;
		hasSearched.value = true;

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=geocodejson&addressdetails=1&q=${encodeURIComponent(searchQuery.value)}`
			);
			const data = await response.json();
			console.log(data);
			searchResults.value = data.features.map((item: any) => ({
				name: `${item.properties.geocoding.name}, ${item.properties.geocoding.state ? item.properties.geocoding.state + ', ' : ''}${item.properties.geocoding.country}`,
				lat: parseFloat(item.geometry.coordinates[1]),
				lon: parseFloat(item.geometry.coordinates[0])
			}));
		} catch (err) {
			console.error('Error searching location:', err);
			error.value = 'Failed to search for locations';
			searchResults.value = [];
		} finally {
			isLoading.value = false;
		}
	}

	// Helper function to get location name from coordinates
	async function getLocationName(lat: number, lon: number): Promise<string> {
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
			);
			const data = await response.json();
			// Return city name if available, otherwise return timezone
			return (
				data.address?.city ||
				data.address?.town ||
				data.address?.village ||
				data.address?.county ||
				data.address?.state ||
				data.timezone?.split('/').pop() ||
				'Your Location'
			);
		} catch (error) {
			console.error('Error getting location name:', error);
			return 'Your Location';
		}
	}

	function selectLocation(location: { name: string; lat: number; lon: number }) {
		moonStore.setLocation(location);
		showDialog.value = false;
		searchQuery.value = '';
		searchResults.value = [];
	}

	// Close dialog when clicking outside
	function handleClickOutside(event: Event) {
		const target = event.target as HTMLElement;
		const dialog = document.querySelector('.location-picker .v-dialog');

		// Only close if clicking outside both the dialog and its activator
		if (
			dialog &&
			!dialog.contains(target) &&
			!target.closest('.location-button') &&
			!target.closest('.v-dialog')
		) {
			showDialog.value = false;
		}
	}

	onMounted(async () => {
		// Only try to get location if no location is set in the store AND no cookie exists
		const savedLocation = getCookie('moonLocation');
		if (!moonStore.location && !savedLocation && navigator.geolocation) {
			await getCurrentLocation();
		}
		document.addEventListener('click', handleClickOutside);
	});
</script>

<style scoped>
	.location-picker {
		display: inline-block;
	}

	.location-button {
		min-width: 180px;
		text-transform: none;
	}

	.location-results {
		max-height: 300px;
		overflow-y: auto;
		border: 1px solid rgba(0, 0, 0, 0.12);
		border-radius: 4px;
	}

	.location-item {
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.location-item:hover {
		background-color: rgba(0, 0, 0, 0.04);
	}

	.current-location {
		background-color: rgba(0, 0, 0, 0.02);
		border-radius: 4px;
		padding: 12px;
	}

	/* Add some spacing between the buttons and the divider */
	.v-divider {
		margin: 16px 0;
	}

	/* Style for the error message */
	.location-error {
		color: #f44336;
		font-size: 0.875rem;
		margin-top: 8px;
		text-align: center;
	}
</style>
