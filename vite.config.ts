import { defineConfig } from 'vite-plus'
import { recommended as effectRules } from '@effect/tsgo/oxlint-presets'

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    tabWidth: 2,
    semi: false,
    singleQuote: true,
  },
  lint: {
    extends: [effectRules],
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'off',
      'effecttsgo/unstable-api-usage': 'off',
    },
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: true,
    tasks: {
      vite: {
        command: 'vp run @playground/vite#build',
      },
      build: {
        command: 'vp run --filter "@oxim/*" --filter "!@oxim/docs" build',
      },
      test: {
        command: 'vp run -r test',
      },
    },
  },
})
