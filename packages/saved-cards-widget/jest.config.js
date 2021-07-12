const srcPath = '<rootDir>/widget/saved-cards/js';

module.exports = {
  name: 'saved-cards-widget',
  displayName: 'Saved Cards Widget Tests',
  testEnvironment: 'jsdom',
  resetMocks: true,
  rootDir: './',
  roots: [srcPath],
  testRegex: '/__tests__/.*\\.(spec|test)\\.[tj]sx?$',
  moduleDirectories: ['node_modules', 'node_modules/@isv-occ-payment/occ-mock-storefront/src'],
  moduleNameMapper: {
    '^@saved-cards-widget/(.*)$': `${srcPath}/$1`,
    '^.+\\.html$': `${srcPath}/__tests__/common/htmlLoader.js`
  },
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  setupFilesAfterEnv: [`${srcPath}/__tests__/jest.setup.ts`],
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './html-reports',
        filename: 'jest-report.html'
      }
    ]
  ],
  collectCoverageFrom: ['**/*.ts'],
  coverageReporters: ['html', 'text'],
  coverageDirectory: './html-reports/coverage',
  coveragePathIgnorePatterns: [`${srcPath}/__tests__/`, `${srcPath}/dev/`],
  coverageThreshold: {
    global: {
      branches: 92,
      functions: 80,
      lines: 92,
      statements: 93
    }
  }
};
