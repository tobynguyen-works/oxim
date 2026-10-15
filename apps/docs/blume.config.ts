import { defineConfig } from 'blume'
import { gateway } from 'blume/ai'
import { vercel } from 'blume/analytics'
import { hcaptcha } from 'blume/captcha'
import { vercel as VercelAdapter } from 'blume/deploy'
import { upstash } from 'blume/ratelimit'

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
    og: {
      enabled: true,
    },
    structuredData: true,
    software: {
      license: 'MIT',
      price: 0,
      sameAs: ['https://github.com/tobynguyen-works/oxim'],
    },
  },

  agents: {
    llmsTxt: true,
    mcp: { enabled: true },
    agentReadability: true,
  },

  ai: {
    assistant: {
      enabled: true,
      suggestions: [
        { label: 'What is Oxim?', icon: 'rocket' },
        { label: 'How to install and setup Oxim?', icon: 'download' },
      ],
      provider: gateway({ model: 'alibaba/qwen3.8-omni-flash', reasoning: 'minimal' }),
      captcha: hcaptcha({ siteKey: '0cd894da-a096-4322-aa9a-8ffa01aef3b4' }),
    },
    openInChat: ['chatgpt', 'claude', 'cursor', 't3', 'scira', 'v0'],
  },

  rateLimit: upstash({ urlEnv: 'KV_REST_API_URL', tokenEnv: 'KV_REST_API_TOKEN', requests: 10 }),

  github: {
    owner: 'tobynguyen-works',
    repo: 'oxim',
    dir: 'apps/docs',
  },

  analytics: [vercel()],

  deployment: VercelAdapter({ site: 'https://oxim.tobynguyen.net' }),
})
