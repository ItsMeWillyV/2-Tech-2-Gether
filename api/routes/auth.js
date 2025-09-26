const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Login = require('../models/Login');
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

// Register new user
router.post('/register', validateRegistration, handleValidationErrors, async (req, res) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      pronouns,
      user_linkedin,
      user_github
    } = req.body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required fields'
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

    // Create user data object
    const userData = {
      email: AuthUtils.sanitizeInput(email),
      password,
      first_name: AuthUtils.sanitizeInput(first_name),
      last_name: AuthUtils.sanitizeInput(last_name),
      phone: phone ? AuthUtils.sanitizeInput(phone) : null,
      pronouns: pronouns ? AuthUtils.sanitizeInput(pronouns) : null,
      user_linkedin: user_linkedin ? AuthUtils.sanitizeInput(user_linkedin) : null,
      user_github: user_github ? AuthUtils.sanitizeInput(user_github) : null
    };

    // Create user and login using db method
    const result = await db.createUser(userData);
    
    // Generate JWT-based email verification token
    const verificationToken = AuthUtils.generateToken({
      user_id: result.user.user_id,
      email: result.user.email,
      type: 'email_verification'
    }, '24h'); // 24 hour expiration for email verification
    
    let emailResult = { sent: false, skipped: false };
    try {
      emailResult = await EmailService.sendVerificationEmail(result.user, verificationToken);
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
      user: result.user
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

    // Authenticate user using database method
    const authResult = await db.authenticateUser(email, password);
    
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        message: authResult.message
      });
    }

    // Generate tokens using Login object methods
    const accessToken = authResult.login.generateJWTToken();
    const refreshToken = AuthUtils.generateRefreshToken({ user_id: authResult.user.user_id });

    res.json({
      success: true,
      message: 'Login successful',
      user: authResult.user.toPublicJSON(),
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

    // Verify JWT token locally
    let decoded;
    try {
      decoded = AuthUtils.verifyToken(token);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check if this is an email verification token
    if (decoded.type !== 'email_verification') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Update email verification status in database
    const result = await db.updateEmailVerificationStatus(decoded.user_id, true);
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

// GET email verification (clickable link)
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Verify JWT token locally
    let decoded;
    try {
      decoded = AuthUtils.verifyToken(token);
    } catch (error) {
      // Optional redirect to frontend if configured
      if (process.env.FRONTEND_BASE_URL) {
        const redirectUrl = `${process.env.FRONTEND_BASE_URL.replace(/\/$/, '')}/email-verified?status=error&message=${encodeURIComponent('Invalid or expired verification token')}`;
        return res.redirect(302, redirectUrl);
      }
      
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check if this is an email verification token
    if (decoded.type !== 'email_verification') {
      // Optional redirect to frontend if configured
      if (process.env.FRONTEND_BASE_URL) {
        const redirectUrl = `${process.env.FRONTEND_BASE_URL.replace(/\/$/, '')}/email-verified?status=error&message=${encodeURIComponent('Invalid token type')}`;
        return res.redirect(302, redirectUrl);
      }
      
      return res.status(400).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Update email verification status in database
    const result = await db.updateEmailVerificationStatus(decoded.user_id, true);
    if (!result.success) {
      // Optional redirect to frontend if configured
      if (process.env.FRONTEND_BASE_URL) {
        const redirectUrl = `${process.env.FRONTEND_BASE_URL.replace(/\/$/, '')}/email-verified?status=error&message=${encodeURIComponent(result.message)}`;
        return res.redirect(302, redirectUrl);
      }
      
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

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
    
    // Optional redirect to frontend if configured
    if (process.env.FRONTEND_BASE_URL) {
      const redirectUrl = `${process.env.FRONTEND_BASE_URL.replace(/\/$/, '')}/email-verified?status=error&message=${encodeURIComponent('Internal server error')}`;
      return res.redirect(302, redirectUrl);
    }
    
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
    
    const result = await db.resendEmailVerification(email);
    
    if (!result.success) {
      // Don't reveal existence/status
      return res.json({
        success: true,
        message: 'If the account exists and is unverified, a new verification email was sent.'
      });
    }

    // Generate JWT-based email verification token
    const verificationToken = AuthUtils.generateToken({
      user_id: result.user.user_id,
      email: result.user.email,
      type: 'email_verification'
    }, '24h'); // 24 hour expiration for email verification

    // Send email with new token
    const emailResult = await EmailService.sendVerificationEmail(result.user, verificationToken);

    const response = {
      success: true,
      message: 'If the account exists and is unverified, a new verification email was sent.'
    };

    if (process.env.NODE_ENV !== 'production') {
      response.dev = {
        sent: emailResult.sent,
        messageId: emailResult.messageId,
        previewUrl: emailResult.previewUrl,
        verification_token: verificationToken
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

    const result = await db.setPasswordResetToken(email);
    
    if (result.success) {
      // Generate JWT-based password reset token
      const resetToken = AuthUtils.generateToken({
        user_id: result.user.user_id,
        email: result.user.email,
        type: 'password_reset'
      }, '1h'); // 1 hour expiration for password reset
      
      // TODO: Send password reset email
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }

    // Always return success to prevent email enumeration
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

    // Verify JWT token locally
    let decoded;
    try {
      decoded = AuthUtils.verifyToken(token);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if this is a password reset token
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token type'
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

    // Update password using database method
    const result = await db.updateUserPassword(decoded.user_id, password);
    
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

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.user_id);
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
router.put('/profile', authenticateToken, validateProfileUpdate, handleValidationErrors, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      preferred_name,
      school,
      phone,
      pronouns,
      user_linkedin,
      user_github
    } = req.body;

    // Sanitize inputs
    const updateData = {};
    if (first_name !== undefined) updateData.first_name = AuthUtils.sanitizeInput(first_name);
    if (last_name !== undefined) updateData.last_name = AuthUtils.sanitizeInput(last_name);
    if (preferred_name !== undefined) updateData.preferred_name = preferred_name ? AuthUtils.sanitizeInput(preferred_name) : null;
    if (school !== undefined) updateData.school = school ? AuthUtils.sanitizeInput(school) : null;
    if (phone !== undefined) updateData.phone = phone ? AuthUtils.sanitizeInput(phone) : null;
    if (pronouns !== undefined) updateData.pronouns = pronouns ? AuthUtils.sanitizeInput(pronouns) : null;
    if (user_linkedin !== undefined) updateData.user_linkedin = user_linkedin ? AuthUtils.sanitizeInput(user_linkedin) : null;
    if (user_github !== undefined) updateData.user_github = user_github ? AuthUtils.sanitizeInput(user_github) : null;

    // Update user using database method
    const updatedUser = await db.updateUserProfile(req.user.user_id, updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser.toPublicJSON()
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
    const user = await db.getUserById(decoded.user_id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token using User methods
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