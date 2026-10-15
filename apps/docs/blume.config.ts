import { defineConfig } from 'blume'
import { vercel } from 'blume/analytics'

export default defineConfig({
  title: 'Oxim',
  description: 'An image optimizer for your favourite bundler.',
  logo: {
    text: 'Oxim',
    image: '/logo.svg',
    href: '/',
  },

  content: {
    root: 'contents',
  },

  navigation: {
    sidebar: {
      display: 'group',
    },
  },

  markdown: {
    code: {
      theme: {
        light: 'vitesse-light',
        dark: 'vitesse-dark',
      },
    },
  },

  lastModified: 'git',
  feedback: false,

  theme: {
    accent: '#BC4749',
    fonts: {
      display: 'geist',
      body: 'geist',
      mono: 'geist-mono',
    },
  },

  footer: {
    copyright: `© ${new Date().getFullYear()} Toby Nguyen`,
    links: [{ label: 'Changelog', href: '/changelog' }],
    socials: {
      discord: 'https://discord.gg/XwMQyDn9D7',
    },
  },

  seo: {
    robots: true,
    sitemap: true,
  },

  github: {
    owner: 'tobynguyen-works',
    repo: 'oxim',
    dir: 'apps/docs',
  },

  analytics: [vercel()],

  deployment: {
    site: 'https://oxim.tobynguyen.net',
  },
})
