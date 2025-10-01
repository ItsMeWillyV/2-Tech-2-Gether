const express = require('express');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const db = require('../utils/db');
const AuthUtils = require('../utils/AuthUtils');
const emailService = require('../utils/email');
const {
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification,
  validateResendVerification,
  validateProfileUpdate
} = require('../utils/validation');
const auth = require('../middleware/auth');

const router = express.Router();

// Rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // limit each IP to 15 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper function to handle validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  return null;
};

// POST /api/auth/register - User registration
router.post('/register', generalLimiter, validateRegistration, async (req, res) => {
  try {
    // Check for validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      pronouns,
      user_linkedin,
      user_github,
      em_first_name,
      em_last_name,
      em_relationship,
      em_phone,
      preferred_name
    } = req.body;

    // Sanitize inputs
    const sanitizedData = {
      email: AuthUtils.sanitizeInput(email),
      first_name: AuthUtils.sanitizeInput(first_name),
      last_name: AuthUtils.sanitizeInput(last_name),
      phone: phone ? AuthUtils.sanitizeInput(phone) : null,
      pronouns: pronouns ? AuthUtils.sanitizeInput(pronouns) : null,
      user_linkedin: user_linkedin ? AuthUtils.sanitizeInput(user_linkedin) : null,
      user_github: user_github ? AuthUtils.sanitizeInput(user_github) : null,
      em_first_name: em_first_name ? AuthUtils.sanitizeInput(em_first_name) : null,
      em_last_name: em_last_name ? AuthUtils.sanitizeInput(em_last_name) : null,
      em_relationship: em_relationship ? AuthUtils.sanitizeInput(em_relationship) : null,
      em_phone: em_phone ? AuthUtils.sanitizeInput(em_phone) : null,
      pre_name: preferred_name ? AuthUtils.sanitizeInput(preferred_name) : null
    };

    // Validate password strength
    const passwordValidation = AuthUtils.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Create user
    const result = await db.createUser({
      ...sanitizedData,
      password
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    // Send verification email
    try {
      await emailService.sendVerificationEmail(
        result.user,
        result.emailVerificationToken
      );
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      user: {
        user_id: result.user.user_id,
        email: result.user.email,
        first_name: result.user.first_name,
        last_name: result.user.last_name
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// POST /api/auth/login - User login
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    // Check for validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { email, password } = req.body;

    // Sanitize input
    const sanitizedEmail = AuthUtils.sanitizeInput(email);

    // Authenticate user
    const result = await db.authenticateUser(sanitizedEmail, password);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message
      });
    }

    // Generate tokens
    const tokenPayload = {
      userId: result.user.user_id,
      email: result.user.email,
      isAdmin: result.login.is_admin
    };

    const accessToken = AuthUtils.generateToken(tokenPayload);
    const refreshToken = AuthUtils.generateRefreshToken(tokenPayload);

    // Set secure HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        user_id: result.user.user_id,
        email: result.user.email,
        first_name: result.user.first_name,
        last_name: result.user.last_name,
        phone: result.user.phone,
        pronouns: result.user.pronouns,
        user_linkedin: result.user.user_linkedin,
        user_github: result.user.user_github,
        isAdmin: result.login.is_admin,
        emailVerified: result.login.email_is_verified,
        pre_name: result.user.pre_name
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

// POST /api/auth/logout - User logout
router.post('/logout', (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', generalLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found'
      });
    }

    // Verify refresh token
    const decoded = AuthUtils.verifyToken(refreshToken);

    // Get current user data
    const user = await db.getUserById(decoded.userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    // Generate new access token
    const newAccessToken = AuthUtils.generateToken({
      userId: decoded.userId,
      email: decoded.email,
      isAdmin: decoded.isAdmin
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
      user:{
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        pronouns: user.pronouns,
        user_linkedin: user.user_linkedin,
        user_github: user.user_github,
        pre_name: user.pre_name
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Clear invalid refresh token
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
});

// POST /api/auth/verify-email - Verify email address
router.post('/verify-email', generalLimiter, validateEmailVerification, async (req, res) => {
  try {
    // Check for validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { token } = req.body;

    // Find user by verification token (implement this in db.js)
    const result = await db.verifyEmailToken(token);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

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

// GET /api/auth/verify-email/:token - Direct API verification (for email links)
router.get('/verify-email/:token', generalLimiter, async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const result = await db.verifyEmailToken(token);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    // Redirect to frontend success page or return success response
    const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    res.redirect(`${frontendBase}/email-verified?success=true`);

  } catch (error) {
    console.error('Email verification error:', error);
    const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    res.redirect(`${frontendBase}/email-verified?success=false&error=server_error`);
  }
});

// POST /api/auth/resend-verification - Resend verification email
router.post('/resend-verification', generalLimiter, validateResendVerification, async (req, res) => {
  try {
    // Check for validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { email } = req.body;
    const sanitizedEmail = AuthUtils.sanitizeInput(email);

    const result = await db.resendEmailVerification(sanitizedEmail);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    // Send verification email
    try {
      await emailService.sendVerificationEmail(
        result.user,
        result.emailVerificationToken
      );
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', generalLimiter, validatePasswordResetRequest, async (req, res) => {
  try {
    // Check for validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { email } = req.body;
    const sanitizedEmail = AuthUtils.sanitizeInput(email);

    const result = await db.setPasswordResetToken(sanitizedEmail);

    if (!result.success) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.'
      });
    }

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(
        result.user,
        result.passwordResetToken
      );
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't reveal email sending failure for security
    }

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/reset-password - Reset password
router.post('/reset-password', generalLimiter, validatePasswordReset, async (req, res) => {
  try {
    // Check for validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { token, password } = req.body;

    // Validate password strength
    const passwordValidation = AuthUtils.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Reset password (implement this in db.js)
    const result = await db.resetPasswordWithToken(token, password);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

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

// GET /api/auth/profile - Get user profile (protected route)
router.get('/profile', auth.requireVerification, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await db.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        pronouns: user.pronouns,
        user_linkedin: user.user_linkedin,
        user_github: user.user_github,
        em_first_name: user.em_first_name,
        em_last_name: user.em_last_name,
        em_relationship: user.em_relationship,
        em_phone: user.em_phone,
        pre_name: user.pre_name
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/auth/profile - Update user profile (protected route)
router.put('/profile', auth.authenticateToken, validateProfileUpdate, async (req, res) => {
  try {
    // Check for validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const userId = req.user.userId;
    const updateData = req.body;

    // Sanitize inputs
    const sanitizedData = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined && value !== null) {
        sanitizedData[key] = AuthUtils.sanitizeInput(value);
      }
    }

    const result = await db.updateUserProfile(userId, sanitizedData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        user_id: result.user.user_id,
        email: result.user.email,
        first_name: result.user.first_name,
        last_name: result.user.last_name,
        phone: result.user.phone,
        pronouns: result.user.pronouns,
        user_linkedin: result.user.user_linkedin,
        user_github: result.user.user_github,
        is_admin: result.user.is_admin,
        pre_name: result.user.pre_name
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during profile update'
    });
  }
});

// PUT /api/auth/change-password - Change password (protected route)
router.put('/change-password', auth.authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password strength
    const passwordValidation = AuthUtils.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'New password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    const userId = req.user.userId;

    // Verify current password
    const login = await db.getLoginByUserId(userId);
    if (!login) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isCurrentPasswordValid = await AuthUtils.verifyPassword(
      currentPassword,
      login.password_hash,
      login.password_salt
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    const result = await db.updateUserPassword(userId, newPassword);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password change'
    });
  }
});

// GET /api/auth/verify-token - Verify if access token is valid (protected route)
router.get('/verify-token', auth.authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      userId: req.user.userId,
      email: req.user.email,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      phone: req.user.phone,
      pronouns: req.user.pronouns,
      user_linkedin: req.user.user_linkedin,
      user_github: req.user.user_github,
      isAdmin: req.user.isAdmin
    }
  });
});

module.exports = router;
