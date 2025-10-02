import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    ignores: ['dist/**', '**/*.config.js'],
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }],
      'react/display-name': 'off',

      // Базовые правила стиля
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'only-multiline'],
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'eol-last': ['error', 'always'],
      'no-multi-spaces': 'error',
      'arrow-parens': ['error', 'always'],
      'brace-style': ['error', '1tbs'],
    },
    // ДОБАВЬТЕ ЭТОТ БЛОК ДЛЯ НАСТРОЙКИ REACT
    settings: {
      react: {
        version: 'detect', // Автоматически определяет версию React
      },
    },
  },
  {
    files: ['**/__tests__/**', '**/*.test.js', '**/*.test.jsx'],
    rules: {
      'no-undef': 'off',
    },
  },
  {
    files: ['**/setupTests.js', '**/vite.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
])