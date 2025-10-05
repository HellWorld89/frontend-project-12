import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
import stylistic from '@stylistic/eslint-plugin'
import react from 'eslint-plugin-react'

export default defineConfig([
  // Базовые рекомендованные правила
  js.configs.recommended,

  // Stylistic правила с кастомизацией
  {
    ...stylistic.configs.customize({
      // Включить только те правила, которые хотим
      semi: true,
      commaDangle: true,
      arrowParens: true,
      braceStyle: true,
      jsxWrapMultilines: true,
    }),
    rules: {
      // Настройки для автоматического исправления
      '@stylistic/semi': ['error', 'never'], // Убрать точки с запятой
      '@stylistic/comma-dangle': ['error', 'always-multiline'], // Висячие запятые только для многострочных
      '@stylistic/arrow-parens': ['error', 'as-needed'], // Скобки только когда нужны
      '@stylistic/brace-style': ['error', '1tbs'], // Стиль скобок One True Brace Style
      '@stylistic/jsx-wrap-multilines': 'off', // Отключить оборачивание JSX
      '@stylistic/multiline-ternary': 'off', // Отключить многострочные тернарные операторы
      '@stylistic/jsx-one-expression-per-line': 'off', // Отключить одно выражение на строку
      '@stylistic/jsx-closing-bracket-location': 'off', // Отключить проверку расположения закрывающих тегов
      '@stylistic/operator-linebreak': 'off', // Отключить перенос операторов
      '@stylistic/padded-blocks': 'off', // Отключить отступы в блоках
    },
  },

  // React правила
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react,
    },
    rules: {
      ...react.configs.recommended.rules,
      'react/display-name': 'off', // Отключить требование displayName
      'react/react-in-jsx-scope': 'off', // Не требовать импорт React в JSX
    },
    settings: {
      react: {
        version: 'detect', // Автоматически определять версию React
      },
    },
  },

  // Общие правила для всех JS файлов
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Добавляем Node.js глобалы
        process: 'readonly', // Добавляем process для i18n.js
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Включить поддержку JSX
        },
      },
    },
    rules: {
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }], // Предупреждение для неиспользуемых переменных, игнорировать _ префикс
    },
  },

  // Специфичные правила для тестовых файлов
  {
    files: ['**/setupTests.js', '**/*.test.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.jest, // Глобальные переменные Jest
        jest: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off', // Отключить проверку неопределенных переменных для тестов
    },
  },

  // Специфичные правила для конфигурационных файлов
  {
    files: ['vite.config.js', '**/config/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node, // Node.js глобалы для конфигов
      },
    },
    rules: {
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }], // Игнорировать переменные с _ префиксом
    },
  },
])
