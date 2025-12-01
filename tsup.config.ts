import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['cjs', 'esm'],
	outDir: 'dist',
	dts: true,
	sourcemap: true,
	minify: false,
	splitting: false,
	clean: true,
	external: ['discord.js'],
})
