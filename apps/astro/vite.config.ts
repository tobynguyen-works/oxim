import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    dts: true,
    clean: true,
    format: ['esm'],
    exports: true,
    entry: ['src/index.ts', 'src/service.ts'],
  },
  run: {
    tasks: {
      build: {
        command: 'vp pack',
      },
    },
  },
})
