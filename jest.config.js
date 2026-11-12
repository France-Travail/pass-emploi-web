const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  clearMocks: true,
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    // https://github.com/vercel/next.js/pull/36787
    '^.+\\.(svg)$': '<rootDir>/assets/__mocks__/SvgrMock.jsx',
    '^react-router-dom$': '<rootDir>/assets/__mocks__/ReactRouterDomMock.js',
  },
  restoreMocks: true,
  setupFilesAfterEnv: ['./setupTests.ts'],
  testEnvironment: '<rootDir>/tests/jsdomWithFetchEnvironment.js',
}

const jestConfig = async () => {
  const nextJestConfig = await createJestConfig(customJestConfig)()
  // https://github.com/vercel/next.js/issues/35634
  // htmlparser2 >= 12 (via sanitize-html) et ses dépendances sont ESM-only : Jest ne sait pas les require()
  nextJestConfig.transformIgnorePatterns = [
    '/node_modules/(?!(@?firebase|htmlparser2|domhandler|domutils|domelementtype|dom-serializer|entities)/)',
  ]
  return nextJestConfig
}

module.exports = jestConfig
