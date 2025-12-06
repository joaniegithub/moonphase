<template>
	<svg
		:width="size"
		:height="size"
		viewBox="0 0 24 24"
		:style="{ color }"
		class="mdi-icon"
	>
		<path :d="path" />
		<!-- Debug: Show path data -->
		<title>{{ path }}</title>
	</svg>
</template>

<script setup lang="ts">
	interface Props {
		path: string;
		size?: number | string;
		color?: string;
	}

	const props = withDefaults(defineProps<Props>(), {
		size: 24,
		color: 'currentColor'
	});
</script>

<style scoped>
	.mdi-icon {
		fill: currentColor;
	}
</style>
