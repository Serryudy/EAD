module.exports = {
    // Test environment
    testEnvironment: 'node',
  
    // Coverage configuration
    collectCoverageFrom: [
      'controllers/**/*.js',
      'services/**/*.js',
      'models/**/*.js',
      '!**/node_modules/**',
      '!**/tests/**'
    ],
  
    // Coverage thresholds
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    },
  
    // Test match patterns
    testMatch: [
      '**/__tests__/**/*.js',
      '**/?(*.)+(spec|test).js'
    ],
  
    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
    // Transform
    transform: {},
  
    // Module paths
    moduleDirectories: ['node_modules', '<rootDir>'],
  
    // Verbose output
    verbose: true,
  
    // Clear mocks between tests
    clearMocks: true,
  
    // Reset mocks between tests
    resetMocks: true,
  
    // Restore mocks between tests
    restoreMocks: true,
  
    // Test timeout
    testTimeout: 10000
  };