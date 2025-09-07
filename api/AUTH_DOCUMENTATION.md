# Tech2Gether Authentication System

## Overview

This is a comprehensive, secure authentication system built for the Tech2Gether application. It includes user registration, login, email verification, password reset, and role-based access control.

## Security Features

### Password Security
- **Password Hashing**: Uses bcrypt with salt rounds of 12
- **Password Strength Validation**: Requires:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

### JWT Tokens
- **Access Tokens**: Short-lived (24 hours by default)
- **Refresh Tokens**: Longer-lived (7 days by default)
- **Secure Storage**: Uses environment variables for JWT secrets

### Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Authentication Routes**: 5 requests per 15 minutes per IP
- **Account Lockout**: 5 failed login attempts locks account for 30 minutes

### Security Headers
- **Helmet.js**: Adds security headers
- **CORS**: Configured for development and production
- **Content Security Policy**: Prevents XSS attacks
- **HSTS**: Forces HTTPS in production

### Input Validation
- **express-validator**: Server-side validation
- **Input Sanitization**: Prevents XSS attacks
- **Email Normalization**: Consistent email format

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name_first": "John",
  "name_last": "Doe",
  "name_first_preferred": "Johnny", // Optional
  "phone": "+1234567890", // Optional
  "school_name": "University of Example", // Optional
  "pronouns": "he/him", // Optional
  "emergency_contact_name_first": "Jane",
  "emergency_contact_name_last": "Doe",
  "emergency_contact_phone": "+1234567891"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "email_is_verified": false,
    "name_first": "John",
    "name_last": "Doe",
    "permission_level": 0
  }
}
```

#### POST `/api/auth/login`
Authenticate user and get tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "email_is_verified": true,
    "name_first": "John",
    "name_last": "Doe",
    "permission_level": 0
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": "24h"
  }
}
```

#### POST `/api/auth/verify-email`
Verify user's email address.

**Request Body:**
```json
{
  "token": "verification_token_here"
}
```

#### POST `/api/auth/forgot-password`
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST `/api/auth/reset-password`
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "NewSecurePass123!"
}
```

#### GET `/api/auth/profile`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

#### PUT `/api/auth/profile`
Update user profile (requires authentication).

#### POST `/api/auth/refresh-token`
Get new access token using refresh token.

#### POST `/api/auth/logout`
Logout user (invalidate tokens).

### Protected Routes (`/api/api`)

#### GET `/api/api/public`
Public endpoint (no authentication required).

#### GET `/api/api/protected`
Protected endpoint (requires authentication).

#### GET `/api/api/verified-only`
Requires email verification.

#### GET `/api/api/moderator`
Requires permission level 3 or higher.

#### GET `/api/api/admin`
Requires permission level 5 or higher.

## Permission Levels

- **0**: Regular user
- **1**: Verified user
- **2**: Active member
- **3**: Moderator
- **4**: Senior moderator
- **5**: Administrator
- **10**: Super administrator

## Environment Variables

Create a `.env` file in the api directory with the following variables:

```env
# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tech2gether
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Server Configuration
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Usage Examples

### Frontend Integration

#### Register User
```javascript
const registerUser = async (userData) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Registration error:', error);
  }
};
```

#### Login User
```javascript
const loginUser = async (email, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store tokens securely
      localStorage.setItem('access_token', data.tokens.access_token);
      localStorage.setItem('refresh_token', data.tokens.refresh_token);
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

#### Make Authenticated Request
```javascript
const makeAuthenticatedRequest = async (url) => {
  const token = localStorage.getItem('access_token');
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (response.status === 401) {
      // Token expired, try to refresh
      await refreshToken();
      // Retry the request
    }
    
    return await response.json();
  } catch (error) {
    console.error('Request error:', error);
  }
};
```

## Database Integration

Currently, the system uses in-memory storage for demonstration. To integrate with a database:

1. Install your database driver (e.g., `pg` for PostgreSQL, `mysql2` for MySQL)
2. Create a database connection module
3. Replace the in-memory user storage with database operations
4. Create database tables for users, sessions, etc.

### Example Database Schema (PostgreSQL)

```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  password_salt VARCHAR(255) NOT NULL,
  email_is_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  name_first VARCHAR(50) NOT NULL,
  name_last VARCHAR(50) NOT NULL,
  name_first_preferred VARCHAR(50),
  phone VARCHAR(20),
  school_name VARCHAR(100),
  pronouns VARCHAR(20),
  emergency_contact_name_first VARCHAR(50) NOT NULL,
  emergency_contact_name_last VARCHAR(50) NOT NULL,
  emergency_contact_phone VARCHAR(20) NOT NULL,
  permission_level INTEGER DEFAULT 0,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_verification_token ON users(email_verification_token);
CREATE INDEX idx_users_reset_token ON users(password_reset_token);
```

## Security Best Practices Implemented

1. **Password Security**: Strong hashing with bcrypt and salt
2. **JWT Security**: Short-lived tokens with refresh mechanism
3. **Rate Limiting**: Prevents brute force attacks
4. **Input Validation**: Server-side validation and sanitization
5. **Account Lockout**: Temporary lockout after failed attempts
6. **Email Verification**: Ensures email ownership
7. **HTTPS Enforcement**: Security headers for production
8. **CORS Configuration**: Restricts cross-origin requests
9. **Error Handling**: Doesn't reveal sensitive information
10. **Environment Variables**: Secrets stored securely

## Testing

To test the authentication system:

1. Start the server: `npm start`
2. Use tools like Postman, curl, or create a frontend
3. Test all endpoints with various scenarios
4. Verify security measures work correctly

## Production Deployment

Before deploying to production:

1. Change all default secrets in `.env`
2. Set `NODE_ENV=production`
3. Use a real database instead of in-memory storage
4. Set up email service for verification and password reset
5. Configure HTTPS
6. Set up monitoring and logging
7. Implement token blacklisting for logout
8. Consider implementing refresh token rotation

## Next Steps

1. **Database Integration**: Replace in-memory storage
2. **Email Service**: Implement actual email sending
3. **Token Blacklisting**: For secure logout
4. **Session Management**: Track active sessions
5. **OAuth Integration**: Social login options
6. **Two-Factor Authentication**: Additional security layer
7. **Audit Logging**: Track security events
8. **API Documentation**: Generate with Swagger/OpenAPI
