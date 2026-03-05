import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm'],
	dts: {
		resolve: true,
	},
	splitting: false,
	sourcemap: false,
	clean: true,
	external: [
		'@open-form/ai-tools',
		'@open-form/sdk',
		'@open-form/core',
		'@open-form/renderers',
		'@tanstack/ai',
		'zod',
	],
})
