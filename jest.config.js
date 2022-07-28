module.exports = {
  "roots": [
    "<rootDir>/app"
  ],
  "testMatch": [
    "**/__tests__/**/*.+(ts|tsx)",
    "**/?(*.)+(spec|test).+(ts|tsx)"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testEnvironment: 'node'
}
