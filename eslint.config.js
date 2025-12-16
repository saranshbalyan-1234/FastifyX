import neo from 'neostandard'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettierPlugin from 'eslint-plugin-prettier'

export default [
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
      '@typescript-eslint/no-explicit-any': ['error'], // Disallow usage of 'any'
      '@typescript-eslint/explicit-function-return-type': ['error'], // Enforce return types
      ...tsPlugin.configs.recommended.rules
    }
  }
]
