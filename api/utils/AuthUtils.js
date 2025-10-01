const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const email = require('./email');

class AuthUtils {

  // Hash password
  static async hashPassword(password) {

    // Generate 16-digit salt
    const salt = crypto.randomBytes(8).toString('hex');

    // Hash & salt
    const saltRounds = 12;
    const hash = await bcrypt.hash(password + salt, saltRounds);

    return { hash, salt };
  }

  // Verify password
  static async verifyPassword(password, hash, salt = null) {
    return await bcrypt.compare(password + salt, hash);
  }

  // Generate JWT
  static generateToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || '24h') {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  // Generate refresh token
  static generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
  }

  // Verify JWT
  static verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  // Generic token generator for email verification, password reset, etc.
  static generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Validate password strength
  static validatePasswordStrength(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Sanitize input to prevent XSS
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
      // Remove HTML tags completely
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  // Generate secure session ID
  static generateSessionId() {
    return crypto.randomBytes(64).toString('hex');
  }

  static userSafeJSON(user){
    return {
      user_id: user.user_id,
      email: user.email,  
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      pronouns: user.pronouns,
      user_linkedin: user.user_linkedin,
      user_github: user.user_github,
      pre_name: user.pre_name
    };
  }

  static loginSafeJson(login){
    return {
      login_id: login.login_id,
      user_id: login.user_id,
      username: login.username,
      is_admin: login.is_admin,
      // email_verified: login.email_verified
    };
  }
}


module.exports = AuthUtils;
