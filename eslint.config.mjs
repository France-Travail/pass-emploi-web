import nextConfig from 'eslint-config-next/core-web-vitals'
import prettierConfigRecommended from 'eslint-plugin-prettier/recommended'
import reactCompiler from 'eslint-plugin-react-compiler'

const eslintConfig = [
  { ignores: ['dist/**', 'nodes_modules/**'] },
  ...nextConfig,
  prettierConfigRecommended,
  {
    // Rules using plugins registered by nextConfig for JS/JSX/TS/TSX files
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    rules: {
      'react-hooks/set-state-in-effect': 'error',
      'react-hooks/exhaustive-deps': 'off',
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
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['app/**/page.tsx', 'app/**/layout.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...[
          "ExportNamedDeclaration FunctionDeclaration[id.name='generateMetadata'] AwaitExpression > CallExpression:not([callee.name='getMandatorySessionServerSide'])",
          "ExportNamedDeclaration VariableDeclarator[id.name='generateMetadata'] AwaitExpression > CallExpression:not([callee.name='getMandatorySessionServerSide'])",
        ].map((selector) => ({
          selector,
          message:
            'Pas d’appel api dans generateMetadata : Next l’exécute au prefetch de chaque <Link> visible vers la page. Titre construit depuis params, searchParams ou la session uniquement.',
        })),
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
