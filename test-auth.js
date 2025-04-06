/**
 * Manual Authentication Test Script
 * 
 * This script tests the authentication and authorization functionality
 * by making direct HTTP requests to the API endpoints.
 * 
 * Usage:
 * 1. Start your server: npm run start
 * 2. Run this script: node test-auth.js
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');

// Configuration
const API_URL = 'http://localhost:3000/api';
const JWT_SECRET = 'dev_secret'; // Should match your server's JWT secret

// Create test tokens
const createToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

// User tokens
const regularUserToken = createToken({
  id: 'user123',
  email: 'user@example.com',
  roles: ['user']
});

const adminUserToken = createToken({
  id: 'admin123',
  email: 'admin@example.com',
  roles: ['admin']
});

// Helper for making HTTP requests
const request = async (method, endpoint, token = null, data = null) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      headers,
      data
    });
    
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      status: error.response?.status || 500, 
      data: error.response?.data || { message: error.message } 
    };
  }
};

// Test cases
const testCases = [
  {
    name: 'Public route - Get all products',
    method: 'get',
    endpoint: '/products',
    token: null,
    data: null,
    expectStatus: 200
  },
  {
    name: 'Protected route without token - Get users',
    method: 'get',
    endpoint: '/users',
    token: null,
    data: null,
    expectStatus: 401
  },
  {
    name: 'Protected route with token - Get users',
    method: 'get',
    endpoint: '/users',
    token: regularUserToken,
    data: null,
    expectStatus: 200
  },
  {
    name: 'Regular user accessing admin route - Create product',
    method: 'post',
    endpoint: '/products',
    token: regularUserToken,
    data: { name: 'Test Product', type: 'Test' },
    expectStatus: 403
  },
  {
    name: 'Admin accessing admin route - Create product',
    method: 'post',
    endpoint: '/products',
    token: adminUserToken,
    data: { name: 'Admin Test Product', type: 'Test' },
    expectStatus: 201
  },
  {
    name: 'User accessing own profile',
    method: 'get',
    endpoint: '/users/user123',
    token: regularUserToken,
    data: null,
    expectStatus: 200
  },
  {
    name: 'User accessing someone else\'s profile',
    method: 'get',
    endpoint: '/users/other123',
    token: regularUserToken,
    data: null,
    expectStatus: 403
  },
  {
    name: 'Admin accessing any user profile',
    method: 'get',
    endpoint: '/users/user123',
    token: adminUserToken,
    data: null,
    expectStatus: 200
  }
];

// Run tests
const runTests = async () => {
  console.log('🔒 Starting Authentication Tests 🔒\n');
  
  for (const test of testCases) {
    process.stdout.write(`Testing: ${test.name}... `);
    
    const result = await request(test.method, test.endpoint, test.token, test.data);
    
    if (result.status === test.expectStatus) {
      console.log('✅ PASSED');
    } else {
      console.log('❌ FAILED');
      console.log(`  Expected status: ${test.expectStatus}`);
      console.log(`  Actual status: ${result.status}`);
      console.log(`  Response: ${JSON.stringify(result.data)}`);
    }
  }
  
  console.log('\n🔒 Authentication Tests Complete 🔒');
};

// Run the tests
runTests().catch(console.error); 