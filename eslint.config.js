import neo from 'neostandard'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettierPlugin from 'eslint-plugin-prettier'

export default [
  {
    ignores: ['dist/', 'node_modules/']
  },
  ...neo({
    ts: true
  }),
  {
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': 'error', // Re-enabling Prettier enforcement in ESLint
      '@typescript-eslint/no-unused-vars': ['error'], // Catch unused variables
      '@typescript-eslint/no-explicit-any': ['warn'], // Disallow usage of 'any'
      '@typescript-eslint/explicit-function-return-type': 'off', // Enforce return types
      '@stylistic/space-before-function-paren': 'off', // Allow no space before function parentheses
      ...tsPlugin.configs.recommended.rules
    }
  }
]
