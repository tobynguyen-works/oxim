import { defineConfig } from 'vite-plus'
import Oxim from '@oxim/vite'

export default defineConfig({
  plugins: [Oxim()],
  run: {
    tasks: {
      build: {
        command: 'vp build',
        dependsOn: [{ task: 'build', from: 'dependencies' }],
      },
    },
  },
})
