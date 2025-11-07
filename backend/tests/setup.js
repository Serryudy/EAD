// Test setup file - runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = '30d';
process.env.JWT_REFRESH_EXPIRES_IN = '70d';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests (optional)
// Uncomment these if you want to suppress console output during tests
/*
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
*/

// Helper function to create mock request object
global.createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: null,
  headers: {},
  cookies: {},
  ...overrides
});

// Helper function to create mock response object
global.createMockResponse = () => {
  const res = {
    statusCode: 200,
    data: null,
    cookies: {}
  };
  
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  
  res.json = jest.fn((data) => {
    res.data = data;
    return res;
  });
  
  res.cookie = jest.fn((name, value, options) => {
    res.cookies[name] = { value, options };
    return res;
  });
  
  res.clearCookie = jest.fn((name, options) => {
    delete res.cookies[name];
    return res;
  });
  
  res.send = jest.fn((data) => {
    res.data = data;
    return res;
  });
  
  res.sendStatus = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  
  return res;
};

// Helper function to create mock next middleware
global.createMockNext = () => jest.fn();

// Helper to create mock user objects
global.createMockEmployee = (overrides = {}) => ({
  _id: 'emp123',
  employeeId: 'EMP001',
  name: 'John Doe',
  role: 'employee',
  department: 'IT',
  position: 'Developer',
  isActive: true,
  lastLogin: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

global.createMockAdmin = (overrides = {}) => ({
  _id: 'admin123',
  username: 'admin',
  name: 'Admin User',
  role: 'admin',
  isActive: true,
  lastLogin: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

global.createMockCustomer = (overrides = {}) => ({
  _id: 'cust123',
  firstName: 'Jane',
  lastName: 'Doe',
  phoneNumber: '+94712345678',
  email: 'jane@example.com',
  nic: 'NIC123456',
  role: 'customer',
  isVerified: false,
  isActive: true,
  lastLogin: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

// Helper to create mock tokens
global.createMockTokens = () => ({
  accessToken: 'mock_access_token_' + Date.now(),
  refreshToken: 'mock_refresh_token_' + Date.now()
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

// Clean up after all tests
afterAll(() => {
  jest.clearAllTimers();
});

// Suppress specific warnings (optional)
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    const message = args[0];
    // Suppress specific warnings if needed
    if (typeof message === 'string' && message.includes('deprecated')) {
      return;
    }
    originalWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});