<template>
	<div class="moon-calendar">
		<div class="calendar-header">
			<v-btn icon size="small" @click="previousMonth">
				<v-icon>mdi-chevron-left</v-icon>
			</v-btn>
			<div class="calendar-title">
				{{ monthYear }}
			</div>
			<v-btn icon size="small" @click="nextMonth">
				<v-icon>mdi-chevron-right</v-icon>
			</v-btn>
		</div>

		<div class="calendar-weekdays">
			<div v-for="day in weekDays" :key="day" class="weekday">
				{{ day }}
			</div>
		</div>

		<div class="calendar-days">
			<div
				v-for="(day, index) in calendarDays"
				:key="index"
				:class="[
					'calendar-day',
					{
						'other-month': !day.isCurrentMonth,
						selected: day.isSelected,
						today: day.isToday,
						'has-icon': day.phaseIcon
					}
				]"
				@click="selectDate(day)"
			>
				<div class="d-flex flex-column align-center">
					<div class="day-number">{{ day.date }}</div>
					<div
						v-if="day.isCurrentMonth"
						class="day-icon d-flex flex-column align-center"
					>
						<v-icon
							v-if="day.phaseIcon"
							:icon="day.phaseIcon"
							size="x-small"
							class="phase-icon"
						></v-icon>
						<!-- <div class="day-illumination">
              {{ day.illumination }}%
            </div> -->
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue';
	import { useMoonStore, getPhaseName, extractPhaseValue } from '@/store/moon';
	import { getMoonIllumination } from '@noim/suncalc3';

	const moonStore = useMoonStore();

	const currentDate = ref(new Date());
	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	const monthYear = computed(() => {
		return currentDate.value.toLocaleDateString('en-US', {
			month: 'long',
			year: 'numeric'
		});
	});

	// Cache for moon illumination data to avoid redundant calculations
	const moonIlluminationCache = new Map<string, any>();

	const getMoonIlluminationData = (date: Date): any => {
		const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format

		if (!moonIlluminationCache.has(dateKey)) {
			try {
				const illumination = getMoonIllumination(date);
				moonIlluminationCache.set(dateKey, illumination);
			} catch (error) {
				console.error('Error calculating moon illumination:', error);
				moonIlluminationCache.set(dateKey, null);
			}
		}

		return moonIlluminationCache.get(dateKey);
	};

	const getMoonIlluminationForDate = (date: Date): number => {
		const data = getMoonIlluminationData(date);
		if (data) {
			return Math.round(data.fraction * 100);
		}
		return 0;
	};

	const getPhaseIcon = (
		date: Date,
		prevDate?: Date,
		nextDate?: Date
	): string | null => {
		try {
			const moonIlluminationData = getMoonIlluminationData(date);
			if (!moonIlluminationData) return null;

			const phaseValue = extractPhaseValue(moonIlluminationData);

			// Get adjacent phase values if provided
			let prevPhaseValue: number | undefined;
			let nextPhaseValue: number | undefined;

			if (prevDate) {
				const prevData = getMoonIlluminationData(prevDate);
				if (prevData) {
					prevPhaseValue = extractPhaseValue(prevData);
				}
			}

			if (nextDate) {
				const nextData = getMoonIlluminationData(nextDate);
				if (nextData) {
					nextPhaseValue = extractPhaseValue(nextData);
				}
			}

			const phaseName = getPhaseName(phaseValue, prevPhaseValue, nextPhaseValue);

			switch (phaseName) {
				case 'New Moon':
					return 'mdi-moon-new';
				case 'Full Moon':
					return 'mdi-moon-full';
				case 'First Quarter':
					return 'mdi-moon-first-quarter';
				case 'Last Quarter':
					return 'mdi-moon-last-quarter';
				default:
					return null;
			}
		} catch (error) {
			console.error('Error getting phase icon:', error);
			return null;
		}
	};

	// Update the day object type
	interface CalendarDay {
		date: number;
		isCurrentMonth: boolean;
		isSelected: boolean;
		isToday: boolean;
		illumination: number;
		fullDate: Date;
		phaseIcon?: string | null;
	}

	const calendarDays = computed<CalendarDay[]>(() => {
		const year = currentDate.value.getFullYear();
		const month = currentDate.value.getMonth();

		// Get first day of month and number of days
		const firstDay = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const daysInPrevMonth = new Date(year, month, 0).getDate();

		const days: CalendarDay[] = [];

		// Previous month days
		for (let i = firstDay - 1; i >= 0; i--) {
			const date = daysInPrevMonth - i;
			days.push({
				date,
				isCurrentMonth: false,
				isSelected: false,
				isToday: false,
				illumination: 0,
				fullDate: new Date(year, month - 1, date)
			});
		}

		// Current month days
		const today = new Date();
		const currentMonthDays: CalendarDay[] = [];
		for (let date = 1; date <= daysInMonth; date++) {
			const fullDate = new Date(year, month, date);
			fullDate.setHours(12, 0, 0, 0); // Set to noon
			const isToday = fullDate.toDateString() === today.toDateString();
			const isSelected =
				fullDate.toDateString() === (moonStore.currentDate || today).toDateString();
			const illumination = getMoonIlluminationForDate(fullDate);

			currentMonthDays.push({
				date,
				isCurrentMonth: true,
				isSelected,
				isToday,
				illumination,
				fullDate
			});
		}

		// Add phase icons with adjacent date context
		for (let i = 0; i < currentMonthDays.length; i++) {
			const day = currentMonthDays[i];
			const prevDate = i > 0 ? currentMonthDays[i - 1].fullDate : undefined;
			const nextDate =
				i < currentMonthDays.length - 1
					? currentMonthDays[i + 1].fullDate
					: undefined;

			day.phaseIcon = getPhaseIcon(day.fullDate, prevDate, nextDate);
			days.push(day);
		}

		// Next month days
		const remainingDays = 42 - days.length; // 6 rows * 7 days
		for (let date = 1; date <= remainingDays; date++) {
			days.push({
				date,
				isCurrentMonth: false,
				isSelected: false,
				isToday: false,
				illumination: 0,
				fullDate: new Date(year, month + 1, date)
			});
		}

		return days;
	});

	const previousMonth = () => {
		currentDate.value = new Date(
			currentDate.value.getFullYear(),
			currentDate.value.getMonth() - 1
		);
	};

	const nextMonth = () => {
		currentDate.value = new Date(
			currentDate.value.getFullYear(),
			currentDate.value.getMonth() + 1
		);
	};

	const selectDate = (day: any) => {
		if (day.isCurrentMonth) {
			moonStore.setCurrentDate(day.fullDate, false);
		}
	};
</script>

<style scoped>
	.moon-calendar {
		background: rgb(var(--v-theme-surface));
		border-radius: 8px;
		padding: 12px 8px 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		width: 100%;
	}

	.calendar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
		padding: 0 4px;
	}

	.calendar-title {
		font-size: 14px;
		font-weight: 600;
		color: rgb(var(--v-theme-primary));
	}

	.calendar-weekdays {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0;
		margin-bottom: 4px;
	}

	.weekday {
		text-align: center;
		font-weight: 500;
		font-size: 11px;
		color: rgba(var(--v-theme-on-surface), 0.5);
		padding: 4px 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.calendar-days {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 4px;
	}

	.calendar-day {
		aspect-ratio: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
		border-radius: 2px;
		cursor: pointer;
		transition: all 0.15s ease;
		padding: 2px;
		text-align: center;
		background-color: rgba(var(--v-theme-on-surface), 0.05);
		color: rgb(var(--v-theme-on-surface));
		min-width: 0;
	}

	.calendar-day:hover:not(.other-month) {
		background-color: rgba(var(--v-theme-primary), 0.12);
		border-color: rgb(var(--v-theme-primary));
	}

	.calendar-day.other-month {
		color: rgba(var(--v-theme-on-surface), 0.3);
		cursor: default;
		background-color: rgba(var(--v-theme-on-surface), 0.02);
	}

	.calendar-day.selected {
		/* color: rgb(var(--v-theme-on-primary)); */
		border-color: rgb(var(--v-theme-primary));
	}
	.calendar-day.selected,
	.calendar-day.selected.has-icon {
		background-color: rgb(var(--v-theme-primary));
	}

	.calendar-day.selected {
		color: #000;
	}
	.calendar-day.selected .phase-icon {
		color: #000;
	}

	.calendar-day.today {
		border: 2px solid rgb(var(--v-theme-primary));
	}

	.day-number {
		font-size: 12px;
		font-weight: 500;
		line-height: 1;
	}

	.day-icon {
		margin-top: 6px;
	}

	.phase-icon {
		color: rgb(var(--v-theme-primary));
		font-size: 12px;
		margin: 0;
		line-height: 1;
	}

	.day-illumination {
		font-size: 10px;
		color: rgba(var(--v-theme-on-surface), 0.6);
		margin-top: 2px;
	}

	.calendar-day.selected .day-illumination {
		color: rgba(var(--v-theme-on-primary), 0.8);
	}

	.calendar-day.has-icon {
		background-color: rgba(var(--v-theme-on-surface), 0.2);
	}

	/* .calendar-day.has-icon:hover:not(.other-month) {
  background-color: rgba(var(--v-theme-primary), 0.15);
} */
</style>
