import { tegami } from 'tegami'
import { runCli } from 'tegami/cli'
import { github } from 'tegami/plugins/github'

const paper = tegami({
  groups: {
    oxim: {
      prerelease: 'rc',
      syncBump: true,
    },
  },
  plugins: [
    github({
      repo: 'tobynguyen-works/oxim',
      versionPr: {
        base: 'main',
      },
    }),
  ],
  packages: {
    '@oxim/core': {
      group: 'oxim',
    },
    '@oxim/storage': {
      group: 'oxim',
    },
    '@oxim/utils': {
      group: 'oxim',
    },
    '@oxim/vite': {
      group: 'oxim',
    },
  },
})

runCli(paper).then(() => {
  process.exit(0)
})
