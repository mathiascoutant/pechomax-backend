import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/main.ts'],
  splitting: true,
  treeshake: true,
  sourcemap: true,
  clean: true,
  format: 'esm',
  target: 'esnext',
  outDir: 'dist',
})
