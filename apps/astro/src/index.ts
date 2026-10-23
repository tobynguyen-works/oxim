import type { AstroIntegration } from 'astro'

export const Oxim = (): AstroIntegration => ({
  name: 'oxim-integration',
  hooks: {
    'astro:config:setup'({ updateConfig }) {
      updateConfig({
        image: {
          service: {
            entrypoint: '@oxim/astro/service',
          },
        },
      })
    },
  },
})
