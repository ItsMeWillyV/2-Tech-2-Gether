const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000/api';
let accessToken = '';
let refreshToken = '';

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  name_first: 'Test',
  name_last: 'User',
  emergency_contact_name_first: 'Emergency',
  emergency_contact_name_last: 'Contact',
  emergency_contact_phone: '+1234567890'
};

// Helper function to make requests
const makeRequest = async (method, endpoint, data = null, includeAuth = false) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      data,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (includeAuth && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
};

// Test functions
const testHealthCheck = async () => {
  console.log('\n=== Testing Health Check ===');
  const result = await makeRequest('GET', '/health');
  console.log('Health Check:', result.success ? 'PASSED' : 'FAILED');
  if (!result.success) console.log('Error:', result.error);
};

const testRegistration = async () => {
  console.log('\n=== Testing User Registration ===');
  const result = await makeRequest('POST', '/auth/register', testUser);
  console.log('Registration:', result.success ? 'PASSED' : 'FAILED');
  if (!result.success) console.log('Error:', result.error);
  else console.log('User registered:', result.data.user.email);
};

const testLogin = async () => {
  console.log('\n=== Testing User Login ===');
  const result = await makeRequest('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  
  console.log('Login:', result.success ? 'PASSED' : 'FAILED');
  if (!result.success) {
    console.log('Error:', result.error);
  } else {
    accessToken = result.data.tokens.access_token;
    refreshToken = result.data.tokens.refresh_token;
    console.log('Tokens received successfully');
  }
};

const testProtectedRoute = async () => {
  console.log('\n=== Testing Protected Route ===');
  const result = await makeRequest('GET', '/api/protected', null, true);
  console.log('Protected Route:', result.success ? 'PASSED' : 'FAILED');
  if (!result.success) console.log('Error:', result.error);
  else console.log('Protected data:', result.data.message);
};

const testProfileAccess = async () => {
  console.log('\n=== Testing Profile Access ===');
  const result = await makeRequest('GET', '/auth/profile', null, true);
  console.log('Profile Access:', result.success ? 'PASSED' : 'FAILED');
  if (!result.success) console.log('Error:', result.error);
  else console.log('Profile data:', result.data.user.email);
};

const testInvalidLogin = async () => {
  console.log('\n=== Testing Invalid Login ===');
  const result = await makeRequest('POST', '/auth/login', {
    email: testUser.email,
    password: 'wrongpassword'
  });
  
  console.log('Invalid Login (should fail):', !result.success ? 'PASSED' : 'FAILED');
  if (result.success) console.log('Error: Should have failed!');
};

const testTokenRefresh = async () => {
  console.log('\n=== Testing Token Refresh ===');
  const result = await makeRequest('POST', '/auth/refresh-token', {
    refresh_token: refreshToken
  });
  
  console.log('Token Refresh:', result.success ? 'PASSED' : 'FAILED');
  if (!result.success) console.log('Error:', result.error);
  else {
    accessToken = result.data.access_token;
    console.log('New access token received');
  }
};

const testPublicRoute = async () => {
  console.log('\n=== Testing Public Route ===');
  const result = await makeRequest('GET', '/api/public');
  console.log('Public Route:', result.success ? 'PASSED' : 'FAILED');
  if (!result.success) console.log('Error:', result.error);
  else console.log('Public data:', result.data.message);
};

const testAdminRoute = async () => {
  console.log('\n=== Testing Admin Route (should fail) ===');
  const result = await makeRequest('GET', '/api/admin', null, true);
  console.log('Admin Route (should fail):', !result.success ? 'PASSED' : 'FAILED');
  if (result.success) console.log('Error: Should have failed - user lacks admin privileges!');
  else console.log('Expected error:', result.error.message);
};

// Run all tests
const runTests = async () => {
  console.log('🚀 Starting Authentication System Tests...');
  console.log('Make sure the server is running on http://localhost:3000');
  
  await testHealthCheck();
  await testPublicRoute();
  await testRegistration();
  await testLogin();
  await testProtectedRoute();
  await testProfileAccess();
  await testInvalidLogin();
  await testTokenRefresh();
  await testAdminRoute();
  
  console.log('\n✅ All tests completed!');
  console.log('\nNote: Some tests are expected to fail (like admin access for regular users)');
  console.log('Check each test result above for details.');
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testHealthCheck,
  testRegistration,
  testLogin,
  testProtectedRoute,
  testProfileAccess,
  testInvalidLogin,
  testTokenRefresh,
  testPublicRoute,
  testAdminRoute
};
