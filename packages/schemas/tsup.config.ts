import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm'], // ESM only
	dts: {
		resolve: true,
	},
	splitting: false,
	sourcemap: false,
	clean: true,
	external: [
		// TypeBox is dev-only, but mark as external if referenced
		'@sinclair/typebox',
	],
})

