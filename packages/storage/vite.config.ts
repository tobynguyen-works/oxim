import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    dts: true,
    clean: true,
    format: ['esm'],
    exports: true,
  },
  run: {
    tasks: {
      build: {
        command: 'vp pack',
        dependsOn: [{ from: 'dependencies', task: 'build' }, 'test'],
      },
    },
  },
})
