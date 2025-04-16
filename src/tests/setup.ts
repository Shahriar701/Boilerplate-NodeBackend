// This file will be run before each test file
import 'reflect-metadata';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.API_PREFIX = '/api';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

// Mock database connection
jest.mock('@/database/database.factory', () => ({
  DatabaseFactory: jest.fn().mockImplementation(() => ({
    createConnection: jest.fn().mockResolvedValue({
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined)
    })
  }))
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((password) => Promise.resolve(`hashed-${password}`)),
  compare: jest.fn().mockImplementation((password, hashed) => Promise.resolve(password === hashed.replace('hashed-', '')))
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('test-token'),
  verify: jest.fn().mockImplementation((token) => {
    if (token === 'invalid-token') {
      throw new Error('Invalid token');
    }
    return {
      id: '1',
      email: 'test@example.com',
      roles: ['user']
    };
  })
}));

// Increase Jest timeout to avoid issues with async tests
jest.setTimeout(10000);

// Global setup for tests
beforeAll(async () => {
  // Any global setup needed before all tests (e.g., connecting to a test DB)
});

// Global teardown for tests
afterAll(async () => {
  // Any global teardown needed after all tests (e.g., disconnecting from a test DB)
}); 