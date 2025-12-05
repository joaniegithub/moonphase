module.exports = {
	root: true,
	env: {
		node: true,
		browser: true,
		es2022: true
	},
	extends: [
		'eslint:recommended',
		'@typescript-eslint/recommended',
		'plugin:vue/vue3-recommended'
	],
	parser: 'vue-eslint-parser',
	parserOptions: {
		parser: '@typescript-eslint/parser',
		ecmaVersion: 2022,
		sourceType: 'module'
	},
	plugins: ['@typescript-eslint', 'vue'],
	rules: {
		// TypeScript rules
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-empty-function': 'off',

		// Vue rules
		'vue/multi-word-component-names': 'off',
		'vue/no-v-html': 'off',
		'vue/require-default-prop': 'off',
		'vue/require-explicit-emits': 'off',
		'vue/component-tags-order': [
			'error',
			{
				order: ['template', 'script', 'style']
			}
		],

		// General rules
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-unused-vars': 'off', // Turned off in favor of @typescript-eslint/no-unused-vars
		semi: ['error', 'never'],
		quotes: ['error', 'single', { avoidEscape: true }],
		'comma-dangle': ['error', 'never'],
		indent: ['error', 'tab'],
		'no-tabs': 'off'
	}
};
