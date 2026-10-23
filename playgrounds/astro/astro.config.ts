import { Oxim } from '@oxim/astro'
import { defineConfig } from 'astro/config'

export default defineConfig({
  integrations: [Oxim()],
  vite: {
    ssr: {
      external: [
        '@node-rs/xxhash',
        '@napi-rs/image',
        '@napi-rs/image-darwin-arm64',
        '@node-rs/xxhash-darwin-arm64',
      ],
    },
    optimizeDeps: {
      exclude: [
        '@node-rs/xxhash',
        '@napi-rs/image',
        '@node-rs/xxhash-darwin-arm64',
        '@napi-rs/image-darwin-arm64',
      ],
    },
    build: {
      rollupOptions: {
        external: [/\.node$/],
      },
    },
  },
})
