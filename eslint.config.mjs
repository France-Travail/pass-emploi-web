import nextConfig from 'eslint-config-next/core-web-vitals'
import prettierConfigRecommended from 'eslint-plugin-prettier/recommended'
import reactCompiler from 'eslint-plugin-react-compiler'

const eslintConfig = [
  ...nextConfig,
  prettierConfigRecommended,
  {
    // Rules using plugins registered by nextConfig for JS/JSX/TS/TSX files
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    rules: {
      // TODO Next.js 16: nouvelle règle stricte, 47 violations à corriger progressivement
      'react-hooks/set-state-in-effect': 'off',
      'import/no-unresolved': 'error',
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },

          'newlines-between': 'always',
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
      'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel'] }],
      'jsx-a11y/no-noninteractive-element-to-interactive-role': [
        'error',
        { ul: ['tablist'] },
      ],
    },
  },
  {
    // Rules using @typescript-eslint plugin (registered by nextConfig for TS files only)
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },
  {
    settings: {
      'jsx-a11y': {
        components: {
          Table: 'table',
          TR: 'tr',
          TH: 'th',
          TD: 'td',
          TDLink: 'td',
          IconComponent: 'svg',
          Input: 'input',
          Select: 'select',
          Textarea: 'textarea',
          SelectButton: 'select',
        },
      },
    },
  },
]

export default eslintConfig
