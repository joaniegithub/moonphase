import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import * as vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

export default [
	{
		files: ['**/*.{js,ts,vue}'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			parser: vueParser,
			parserOptions: {
				parser: typescriptParser
			},
			globals: {
				console: 'readonly',
				process: 'readonly'
			}
		},
		plugins: {
			'@typescript-eslint': typescript,
			vue: vue
		},
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
	},
	{
		files: ['**/*.vue'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: typescriptParser
			}
		}
	},
	{
		files: ['**/*.{js,ts}'],
		languageOptions: {
			parser: typescriptParser
		}
	}
];
