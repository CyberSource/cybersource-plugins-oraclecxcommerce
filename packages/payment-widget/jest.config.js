module.exports = {
  name: 'payment-widget',
  displayName: 'Payment Widget Tests',
  testEnvironment: 'jsdom',
  resetMocks: true,
  rootDir: './',
  roots: ['<rootDir>/widget/isv-occ-payment/js'],
  testRegex: '/__tests__/.*\\.(spec|test)\\.[tj]sx?$',
  moduleDirectories: ['node_modules', 'node_modules/@isv-occ-payment/occ-mock-storefront/src'],
  moduleNameMapper: {
    '^@payment-widget/(.*)$': '<rootDir>/widget/isv-occ-payment/js/$1'
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.html$': '<rootDir>/widget/isv-occ-payment/js/__tests__/common/htmlLoader.js'
  },
  setupFilesAfterEnv: ['<rootDir>/widget/isv-occ-payment/js/__tests__/jest.setup.ts'],
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
  coveragePathIgnorePatterns: ['<rootDir>/widget/isv-occ-payment/js/__tests__/'],
  coverageThreshold: {
    global: {
      branches: 37,
      functions: 39,
      lines: 49,
      statements: 47
    }
  }
};
