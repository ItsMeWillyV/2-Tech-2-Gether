const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./User');

const failedAttempts = new Map();
const lockedAccounts = new Map();

class Login {
  constructor({
    user_id = null, // PK in actual schema
    username = null, // This will be the user's email address
    password = null, // This will be hashed
    is_admin = 0 // bit field, 0 for regular user, 1 for admin
  } = {}) {
    this.user_id = user_id; // PK in actual schema
    this.username = username; // Email address serves as username
    this.password = password; // Hashed password - actual field name
    this.is_admin = is_admin; // Admin flag
    
    // Local token properties (not stored in database)
    this.email_verification_token = null;
    this.email_verification_expires = null;
    this.password_reset_token = null;
    this.password_reset_expires = null;
  }

  // Hash password
  static async hashPassword(plainPassword) {
    const saltRounds = 12;
    return await bcrypt.hash(plainPassword, saltRounds);
  }

  // Verify password
  async verifyPassword(plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
  }

  // Generate JWT token
  generateJWTToken() {
    const payload = {
      user_id: this.user_id,
      username: this.username,
      email_is_verified: this.email_is_verified
    };
    
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }

  // Generate refresh token
  generateRefreshToken() {
    const payload = {
      user_id: this.user_id,
      type: 'refresh'
    };
    
    return jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '7d' }
    );
  }

  // Verify JWT token
  static verifyJWTToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Verify refresh token
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Generate email verification token
  setEmailVerificationToken() {
    this.email_verification_token = crypto.randomBytes(32).toString('hex');
    // Token expires in 24 hours
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    this.email_verification_expires = expires;
    return this.email_verification_token;
  }

  // Verify email with token
  verifyEmailWithToken(token) {
    if (!this.email_verification_token || !this.email_verification_expires) {
      return { success: false, message: 'No verification token found' };
    }

    if (new Date() > new Date(this.email_verification_expires)) {
      return { success: false, message: 'Verification token has expired' };
    }

    if (this.email_verification_token !== token) {
      return { success: false, message: 'Invalid verification token' };
    }

    this.email_is_verified = true;
    this.email_verification_token = null;
    this.email_verification_expires = null;
    
    return { success: true, message: 'Email verified successfully' };
  }

  // Generate password reset token
  setPasswordResetToken() {
    this.password_reset_token = crypto.randomBytes(32).toString('hex');
    // Token expires in 1 hour
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);
    this.password_reset_expires = expires;
    return this.password_reset_token;
  }

  // Verify password reset token
  verifyPasswordResetToken(token) {
    if (!this.password_reset_token || !this.password_reset_expires) {
      return { success: false, message: 'No password reset token found' };
    }

    if (new Date() > new Date(this.password_reset_expires)) {
      return { success: false, message: 'Password reset token has expired' };
    }

    if (this.password_reset_token !== token) {
      return { success: false, message: 'Invalid password reset token' };
    }

    return { success: true, message: 'Password reset token is valid' };
  }

  // Clear password reset token
  clearPasswordResetToken() {
    this.password_reset_token = null;
    this.password_reset_expires = null;
  }

  // Session-based failed login attempt tracking
  static getFailedAttempts(username) {
    return failedAttempts.get(username) || 0;
  }

  static incrementFailedAttempts(username) {
    const attempts = Login.getFailedAttempts(username) + 1;
    failedAttempts.set(username, attempts);
    
    // Lock account after 5 failed attempts
    if (attempts >= 5) {
      Login.lockAccount(username, 30); // Lock for 30 minutes
    }
    
    return attempts;
  }

  static resetFailedAttempts(username) {
    failedAttempts.delete(username);
    lockedAccounts.delete(username);
  }

  // Session-based account locking
  static lockAccount(username, durationMinutes = 30) {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + durationMinutes);
    lockedAccounts.set(username, lockUntil);
    failedAttempts.delete(username); // Reset attempts when locking
  }

  static isAccountLocked(username) {
    // TEMPORARILY DISABLED FOR DEBUGGING
    return false;
    
    const lockUntil = lockedAccounts.get(username);
    if (!lockUntil) return false;
    
    if (new Date() >= lockUntil) {
      // Lock has expired, remove it
      lockedAccounts.delete(username);
      return false;
    }
    
    return true;
  }

  static unlockAccount(username) {
    lockedAccounts.delete(username);
    failedAttempts.delete(username);
  }

  // Validate login credentials
  validateCredentials() {
    const errors = [];
    
    if (!this.username) errors.push('Username is required');
    if (!this.password) errors.push('Password is required');
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Convert to safe JSON (exclude sensitive data)
  toSafeJSON() {
    return {
      user_id: this.user_id,
      username: this.username,
      admin: this.admin,
      email_is_verified: this.email_is_verified,
      last_login: this.last_login
    };
  }
}

module.exports = Login;