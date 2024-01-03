module.exports = {
  name: "server-extension-unit",
  displayName: "Server Extension Unit Tests",
  testEnvironment: "node",
  resetMocks: true,
  rootDir: "./",
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testRegex: "/__tests__/unit/.*\\.(spec|test)\\.[tj]sx?$",
  moduleNameMapper: {
    "^@server-extension/(.*)$": "<rootDir>/src/$1",
  },
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: "./html-reports/unit",
        filename: "jest-report.html",
      },
    ],
  ],
  collectCoverageFrom: ["**/*.ts"],
  coverageReporters: ["html", "text"],
  coverageDirectory: "./html-reports/unit/coverage",
  coveragePathIgnorePatterns: [
    "<rootDir>/src/__tests__/",
    "<rootDir>/src/controllers/validation",
  ],
  coverageThreshold: {
    global: {
      statements: 40,
      branches: 52,
      functions: 60,
      lines: 40,
    },
  },
};
