module.exports = {
  name: "server-extension-int",
  displayName: "Server Extension Integration Tests",
  testEnvironment: "node",
  resetMocks: true,
  rootDir: "./",
  roots: ["<rootDir>/src"],
  setupFiles: ["<rootDir>/src/__tests__/int/globals/jest.setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/int/globals/jest.setupEnv.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testRegex: "/__tests__/int/.*\\.(spec|test)\\.[tj]sx?$",
  moduleNameMapper: {
    "^@server-extension/(.*)$": "<rootDir>/src/$1",
  },
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: "./html-reports/int",
        filename: "jest-report.html",
      },
    ],
  ],
  collectCoverageFrom: ["**/*.ts"],
  coverageReporters: ["html", "text"],
  coverageDirectory: "./html-reports/int/coverage",
  coveragePathIgnorePatterns: [
    "<rootDir>/src/__tests__/",
    "<rootDir>/src/controllers/validation",
  ],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 20,
      functions: 30,
      lines: 30,
    },
  },
};
