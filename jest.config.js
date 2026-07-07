module.exports = {
  testTimeout: 20000,
  reporters: ['default'],
  watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/.git/'],
  moduleFileExtensions: ['js', 'json'],
  rootDir: __dirname,
  testMatch: [
    '<rootDir>/test/**/*.test.[jt]s?(x)',
    '<rootDir>/test/**/*.spec.[jt]s?(x)'
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@common/(.*)$': '<rootDir>/common/$1',
    '^@store/(.*)$': '<rootDir>/store/$1',
    '^@components/(.*)$': '<rootDir>/components/$1'
  },
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testEnvironment: 'node'
}
