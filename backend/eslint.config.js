import baseConfig from '../eslint.config.js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  ...baseConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
  },
])
