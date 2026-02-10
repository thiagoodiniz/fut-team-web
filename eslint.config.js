import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules'],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      prettier,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // React hooks
      ...reactHooks.configs.recommended.rules,

      // React refresh (Vite)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Prettier vira regra do ESLint (erros em vermelho)
      'prettier/prettier': 'error',

      // Regras que você pediu
      camelcase: 'off',
      'global-require': 'off',
      'no-unused-expressions': 'off',
      'no-use-before-define': 'off',
      'no-unused-vars': 'off',

      // Melhor para TS
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  prettierConfig,
)
