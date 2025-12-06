import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
	base: '/moonphase/',
	plugins: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: tag => tag.startsWith('v-') && !tag.startsWith('v-')
				}
			}
		}),
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: false,
			includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
			manifest: {
				name: 'Moon Phase',
				short_name: 'MoonPhase',
				description:
					"Track the current moon phase and get detailed information about the moon's position and illumination.",
				theme_color: '#05060a',
				background_color: '#05060a',
				display: 'standalone',
				start_url: '.',
				scope: '.',
				icons: [
					{
						src: 'icons/android-chrome-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any maskable'
					},
					{
						src: 'icons/android-chrome-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable'
					},
					{
						src: 'icons/moonIcon.png',
						sizes: '1024x1024',
						type: 'image/png',
						purpose: 'any maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,png,svg,ico}']
			},
			devOptions: {
				enabled: true,
				type: 'module'
			}
		})
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	server: {
		port: 3000,
		host: true
	},
	define: { 'process.env': {} }
});
