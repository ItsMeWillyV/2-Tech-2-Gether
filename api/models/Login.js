class Login {
  constructor(data = {}) {

    // Login details
    this.user_id = data.user_id || null; // Primary key
    this.username = data.username || null; // Email address serves as username
    this.password_hash = data.password_hash || null; // Hashed password
    this.password_salt = data.password_salt || null; // 16-digit hex salt

    // Admin flag
    this.is_admin = data.is_admin || 0;

    // Security tokens
    this.email_verification_token = data.email_verification_token || null; // Token for email verification
    this.email_verification_expires = data.email_verification_expires || null; // Expiry for email verification token
    this.password_reset_token = data.password_reset_token || null; // Token for password reset
    this.password_reset_expires = data.password_reset_expires || null; // Expiry for password reset token
  }
}

module.exports = Login;