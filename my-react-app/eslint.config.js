import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // 검증 하네스와 설정 파일은 브라우저가 아니라 Node 에서 돌아갑니다. page.evaluate 안의 코드만 브라우저에서 돕니다.
  {
    files: ['harness/**/*.mjs', 'planning/**/*.mjs', 'vite.config.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: { 'no-empty': ['error', { allowEmptyCatch: true }] },
  },
])
