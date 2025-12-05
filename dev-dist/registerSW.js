if ('serviceWorker' in navigator)
	navigator.serviceWorker.register('/moonphase/dev-sw.js?dev-sw', {
		scope: '/moonphase/',
		type: 'classic'
	});
