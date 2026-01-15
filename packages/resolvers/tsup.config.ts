import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'fs/index': 'src/fs/index.ts',
  },
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  external: ['@open-form/types'],
})
