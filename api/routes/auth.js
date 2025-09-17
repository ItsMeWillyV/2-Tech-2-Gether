const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuthUtils = require('../utils/auth');
const EmailService = require('../utils/email');
const db = require('../utils/db');
const {
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification,
  validateResendVerification,
  validateProfileUpdate,
  handleValidationErrors
} = require('../utils/validation');
const { authenticateToken, requireVerification } = require('../middleware/auth');

// API root path for database endpoints
const root = '/api/v1';

// In-memory storage for demonstration (replace with database in production)
let users = [];
let userIdCounter = 1;

// Helper function to find user by email
const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

// Helper function to find user by ID
const findUserById = (id) => {
  return users.find(user => user.user_id === id);
};

// Helper function to find user by verification token
const findUserByVerificationToken = (token) => {
  return users.find(user => user.email_verification_token === token);
};

// Helper function to find user by password reset token
const findUserByPasswordResetToken = (token) => {
  return users.find(user => user.password_reset_token === token);
};

// Register new user
router.post('/register', validateRegistration, handleValidationErrors, async (req, res) => {
  try {
    const {
      email,
      password,
      name_first,
      name_last,
      name_first_preferred,
      phone,
      school_name,
      pronouns,
    } = req.body;

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate password strength
    const passwordValidation = AuthUtils.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors
      });
    }

    // Hash password
    const { hash, salt } = await AuthUtils.hashPassword(password);

    // Generate email verification token
    const verificationToken = AuthUtils.generateVerificationToken();

    // Create new user
    const newUser = new User({
      user_id: userIdCounter++,
      email: AuthUtils.sanitizeInput(email),
      password_hash: hash,
      password_salt: salt,
      name_first: AuthUtils.sanitizeInput(name_first),
      name_last: AuthUtils.sanitizeInput(name_last),
      name_first_preferred: name_first_preferred ? AuthUtils.sanitizeInput(name_first_preferred) : null,
      phone: phone ? AuthUtils.sanitizeInput(phone) : null,
      school_name: school_name ? AuthUtils.sanitizeInput(school_name) : null,
      pronouns: pronouns ? AuthUtils.sanitizeInput(pronouns) : null,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Set email verification token
    newUser.setEmailVerificationToken(verificationToken);

    // Validate user data
    const validation = newUser.validateRegistration();
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Registration validation failed',
        errors: validation.errors
      });
    }

    // Save user (in production, save to database)
    users.push(newUser);

    let emailResult = { sent: false, skipped: false };
    try {
      emailResult = await EmailService.sendVerificationEmail(newUser, verificationToken);
      if (!emailResult.sent) {
        console.warn('[Register] Verification email not sent:', emailResult.reason || emailResult.error);
      }
    } catch (e) {
      console.error('[Register] Email send exception:', e.message);
    }

    // Always log token in dev for testing
    if (process.env.NODE_ENV !== 'production') {
      console.log(`(DEV) Verification token for ${email}: ${verificationToken}`);
    }

    const baseResponse = {
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      user: newUser.toPublicJSON()
    };

    if (process.env.NODE_ENV !== 'production') {
      baseResponse.dev = {
        verification_token: verificationToken,
        email_send: emailResult,
        email_debug: EmailService.getEmailDebugInfo()
      };
    }

    res.status(200).json(baseResponse);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// Login user
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Verify password
    const isPasswordValid = await AuthUtils.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      user.incrementFailedLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset failed login attempts on successful login
    user.resetFailedLoginAttempts();

    // Generate tokens
    const accessToken = AuthUtils.generateToken(user.getJWTPayload());
    const refreshToken = AuthUtils.generateRefreshToken({ user_id: user.user_id });

    res.json({
      success: true,
      message: 'Login successful',
      user: user.toPublicJSON(),
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: process.env.JWT_EXPIRES_IN || '24h'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Verify email
router.post('/verify-email', validateEmailVerification, handleValidationErrors, async (req, res) => {
  try {
    const { token } = req.body;

    const user = findUserByVerificationToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    const result = user.verifyEmailWithToken(token);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    user.updated_at = new Date();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during email verification'
    });
  }
});

// GET email verification (clickable link)
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = findUserByVerificationToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    const result = user.verifyEmailWithToken(token);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    user.updated_at = new Date();

    // Optional redirect to frontend if configured
    if (process.env.FRONTEND_BASE_URL) {
      const redirectUrl = `${process.env.FRONTEND_BASE_URL.replace(/\/$/, '')}/email-verified?status=success`;
      return res.redirect(302, redirectUrl);
    }

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification (GET) error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during email verification'
    });
  }
});

// Resend verification email
router.post('/resend-verification', validateResendVerification, handleValidationErrors, async (req, res) => {
  try {
    const { email } = req.body;
    const user = findUserByEmail(email);
    if (!user) {
      // Do not reveal existence
      return res.json({
        success: true,
        message: 'If the account exists and is unverified, a new verification email was sent.'
      });
    }

    if (user.email_is_verified) {
      return res.json({
        success: true,
        message: 'Email already verified.'
      });
    }

    // Generate fresh token
    const newToken = AuthUtils.generateVerificationToken();
    user.setEmailVerificationToken(newToken);
    user.updated_at = new Date();

    const result = await EmailService.sendVerificationEmail(user, newToken);

    const response = {
      success: true,
      message: 'If the account exists and is unverified, a new verification email was sent.'
    };

    if (process.env.NODE_ENV !== 'production') {
      response.dev = {
        sent: result.sent,
        messageId: result.messageId,
        previewUrl: result.previewUrl,
        verification_token: newToken
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during resend verification'
    });
  }
});

// Request password reset
router.post('/forgot-password', validatePasswordResetRequest, handleValidationErrors, async (req, res) => {
  try {
    const { email } = req.body;

    const user = findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate password reset token
    const resetToken = AuthUtils.generatePasswordResetToken();
    user.setPasswordResetToken(resetToken);
    user.updated_at = new Date();

    // TODO: Send password reset email
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password reset request'
    });
  }
});

// Reset password
router.post('/reset-password', validatePasswordReset, handleValidationErrors, async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = findUserByPasswordResetToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const tokenValidation = user.verifyPasswordResetToken(token);
    if (!tokenValidation.success) {
      return res.status(400).json({
        success: false,
        message: tokenValidation.message
      });
    }

    // Validate password strength
    const passwordValidation = AuthUtils.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors
      });
    }

    // Hash new password
    const { hash, salt } = await AuthUtils.hashPassword(password);
    user.password_hash = hash;
    user.password_salt = salt;
    user.clearPasswordResetToken();
    user.updated_at = new Date();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password reset'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = findUserById(req.user.user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, validateProfileUpdate, handleValidationErrors, (req, res) => {
  try {
    const user = findUserById(req.user.user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const {
      name_first,
      name_last,
      name_first_preferred,
      phone,
      school_name,
      pronouns
    } = req.body;

    // Update only provided fields
    if (name_first !== undefined) user.name_first = AuthUtils.sanitizeInput(name_first);
    if (name_last !== undefined) user.name_last = AuthUtils.sanitizeInput(name_last);
    if (name_first_preferred !== undefined) user.name_first_preferred = name_first_preferred ? AuthUtils.sanitizeInput(name_first_preferred) : null;
    if (phone !== undefined) user.phone = phone ? AuthUtils.sanitizeInput(phone) : null;
    if (school_name !== undefined) user.school_name = school_name ? AuthUtils.sanitizeInput(school_name) : null;
    if (pronouns !== undefined) user.pronouns = pronouns ? AuthUtils.sanitizeInput(pronouns) : null;

    user.updated_at = new Date();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating profile'
    });
  }
});

// Refresh access token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = AuthUtils.verifyToken(refresh_token);
    const user = findUserById(decoded.user_id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const accessToken = AuthUtils.generateToken(user.getJWTPayload());

    res.json({
      success: true,
      access_token: accessToken,
      expires_in: process.env.JWT_EXPIRES_IN || '24h'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// Logout (invalidate tokens - in production, implement token blacklisting)
router.post('/logout', authenticateToken, (req, res) => {
  // In production, add token to blacklist
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// endpoints

// Create user endpoint
router.post(`${root}/users`, async (req, res, next) => {
  try {
    const { 
      email, 
      password, 
      org_id,
      first_name, 
      last_name,
      pronouns,
      phone,
      user_linkedin,
      user_github
    } = req.body;
    
    // Validate required fields
    if (!email || !password || !org_id || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password, org_id, first_name, last_name'
      });
    }

    // Validate password strength
    const passwordValidation = AuthUtils.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors
      });
    }

    // Sanitize inputs
    const userData = {
      email: AuthUtils.sanitizeInput(email),
      password,
      org_id,
      first_name: AuthUtils.sanitizeInput(first_name),
      last_name: AuthUtils.sanitizeInput(last_name),
      pronouns: pronouns ? AuthUtils.sanitizeInput(pronouns) : null,
      phone: phone ? AuthUtils.sanitizeInput(phone) : null,
      user_linkedin: user_linkedin ? AuthUtils.sanitizeInput(user_linkedin) : null,
      user_github: user_github ? AuthUtils.sanitizeInput(user_github) : null
    };

    // Create user using db.js method
    const user = await db.createUser(userData);

    res.status(200).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Invalid organization ID') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Login endpoint
router.post(`${root}/auth/login`, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const userData = await db.authenticateUser(email, password);

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    next(error);
  }
});

// Get user profile endpoint
router.get(`${root}/users/:userId`, async (req, res, next) => {
  try {
    const user = await db.getUserById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Update user endpoint
router.put(`${root}/users/:userId`, async (req, res, next) => {
  try {
    const { first_name, last_name, email } = req.body;
    const updateData = {};

    // Only include fields that are provided
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (email) updateData.email = email;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    const updatedUser = await db.updateUser(req.params.userId, updateData);

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// Register user for event endpoint
router.post(`${root}/users/:userId/events/:eventId/register`, async (req, res, next) => {
  try {
    const { userId, eventId } = req.params;
    const { emergencyContact } = req.body;

    // Validate required path parameters
    if (!userId || !eventId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Event ID are required'
      });
    }

    // Convert to numbers (assuming they should be numeric)
    const userIdNum = parseInt(userId);
    const eventIdNum = parseInt(eventId);

    if (isNaN(userIdNum) || isNaN(eventIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Event ID must be valid numbers'
      });
    }

    let emergencyContactData = null;

    // Process emergency contact if provided
    if (emergencyContact) {
      const { 
        em_first_name, 
        em_last_name, 
        em_relationship, 
        em_phone
      } = emergencyContact;

      // Validate required emergency contact fields
      if (!em_first_name || !em_last_name || !em_relationship || !em_phone) {
        return res.status(400).json({
          success: false,
          message: 'Emergency contact requires: em_first_name, em_last_name, em_relationship, em_phone'
        });
      }

      // Sanitize emergency contact inputs
      emergencyContactData = {
        em_first_name: AuthUtils.sanitizeInput(em_first_name),
        em_last_name: AuthUtils.sanitizeInput(em_last_name),
        em_relationship: AuthUtils.sanitizeInput(em_relationship),
        em_phone: AuthUtils.sanitizeInput(em_phone),
        em_linkedin: em_linkedin ? AuthUtils.sanitizeInput(em_linkedin) : null
      };
    }

    // Register user for event using db.js method
    const registration = await db.registerUserForEvent(userIdNum, eventIdNum, emergencyContactData);

    res.status(200).json({
      success: true,
      message: 'User registered for event successfully',
      data: registration
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Event not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'User is already registered for this event') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    if (error.message.includes('Emergency contact requires')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Get all organizations endpoint
router.get(`${root}/organizations`, async (req, res, next) => {
  try {
    const organizations = await db.getOrganizations();

    res.json({
      success: true,
      message: 'Organizations retrieved successfully',
      data: organizations
    });
  } catch (error) {
    next(error);
  }
});

// Get user's emergency contacts endpoint
router.get(`${root}/users/:userId/emergency-contacts`, async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'User ID must be a valid number'
      });
    }

    const emergencyContacts = await db.getEmergencyContacts(userIdNum);

    res.json({
      success: true,
      message: 'Emergency contacts retrieved successfully',
      data: emergencyContacts
    });
  } catch (error) {
    next(error);
  }
});

// Update user address endpoint
router.put(`${root}/users/:userId/address`, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { street_1, street_2, city, state, zip } = req.body;

    // Validate user ID
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'User ID must be a valid number'
      });
    }

    // Validate required address fields
    if (!street_1 || !city || !state || !zip) {
      return res.status(400).json({
        success: false,
        message: 'Required address fields: street_1, city, state, zip'
      });
    }

    // Sanitize address inputs
    const addressData = {
      street_1: AuthUtils.sanitizeInput(street_1),
      street_2: street_2 ? AuthUtils.sanitizeInput(street_2) : null,
      city: AuthUtils.sanitizeInput(city),
      state: AuthUtils.sanitizeInput(state),
      zip: AuthUtils.sanitizeInput(zip)
    };

    const result = await db.updateUserAddress(userIdNum, addressData);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message.includes('required for address')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

module.exports = router;
