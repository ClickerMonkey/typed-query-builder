module.exports = {
  testURL: 'http://localhost',
  roots: [
    '<rootDir>/test/',
  ],
  testRegex: '(.*)\\.spec\\.ts$',
  moduleFileExtensions: [
    'js',
    'ts',
    'tsx',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
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