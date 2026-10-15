import { defineConfig } from 'vite-plus'
import Oxim from '@oxim/vite'

export default defineConfig({
  plugins: [
    Oxim({
      png: {
        method: 'lossy',
        maxQuality: 50,
        minQuality: 30,
      },
      jpeg: {
        method: 'lossy',
        quality: 50,
      },
    }),
  ],
  run: {
    tasks: {
      build: {
        command: 'vp build',
        dependsOn: [{ task: 'build', from: 'dependencies' }],
      },
    },
  },
})
