module.exports = {
  testURL: 'http://localhost',
  roots: [
    '<rootDir>/test',
  ],
  testRegex: '(.*)\\.ts$',
  moduleFileExtensions: [
    'js',
    'ts',
    'tsx',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/lib/',
    '<rootDir>/lib-esm/',
    '<rootDir>/umd/',
    '<rootDir>/test/(.*)\\.ts$',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 85,
    },
  },
  preset: 'ts-jest',
  testMatch: null,
};