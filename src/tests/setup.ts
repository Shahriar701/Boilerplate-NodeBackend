// This file will be run before each test file
import 'reflect-metadata';

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