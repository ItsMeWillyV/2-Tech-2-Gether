class User {
  constructor({
    user_id = null,
    password_hash = null,
    password_salt = null,
    email = null,
    email_is_verified = false,
    email_verification_token = null,
    email_verification_expires = null,
    password_reset_token = null,
    password_reset_expires = null,
    school_name = null,
    phone = null,
    pronouns = null,
    name_first = null,
    name_last = null,
    name_first_preferred = null,
    emergency_contact_name_first = null,
    emergency_contact_name_last = null,
    emergency_contact_phone = null,
    permission_level = 0,
    failed_login_attempts = 0,
    account_locked_until = null,
    last_login = null,
    created_at = null,
    updated_at = null
  } = {}) {
    this.user_id = user_id;
    this.password_hash = password_hash;
    this.password_salt = password_salt;
    this.email = email;
    this.email_is_verified = email_is_verified;
    this.email_verification_token = email_verification_token;
    this.email_verification_expires = email_verification_expires;
    this.password_reset_token = password_reset_token;
    this.password_reset_expires = password_reset_expires;
    this.school_name = school_name;
    this.phone = phone;
    this.pronouns = pronouns;
    this.name_first = name_first;
    this.name_last = name_last;
    this.name_first_preferred = name_first_preferred;
    this.emergency_contact_name_first = emergency_contact_name_first;
    this.emergency_contact_name_last = emergency_contact_name_last;
    this.emergency_contact_phone = emergency_contact_phone;
    this.permission_level = permission_level;
    this.failed_login_attempts = failed_login_attempts;
    this.account_locked_until = account_locked_until;
    this.last_login = last_login;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  // Get preferred name or fall back to first name
  getPreferredName() {
    return this.name_first_preferred || this.name_first;
  }

  // Get full name
  getFullName() {
    return `${this.getPreferredName()} ${this.name_last}`;
  }

  // Get emergency contact full name
  getEmergencyContactName() {
    if (this.emergency_contact_name_first && this.emergency_contact_name_last) {
      return `${this.emergency_contact_name_first} ${this.emergency_contact_name_last}`;
    }
    return null;
  }

  // Check if user is verified
  isVerified() {
    return this.email_is_verified;
  }

  // Check permission level
  hasPermissionLevel(requiredLevel) {
    return this.permission_level >= requiredLevel;
  }

  // Validate required fields for registration
  validateRegistration() {
    const errors = [];
    
    if (!this.email) errors.push('Email is required');
    if (!this.password_hash) errors.push('Password is required');
    if (!this.name_first) errors.push('First name is required');
    if (!this.name_last) errors.push('Last name is required');
    if (!this.school_name) errors.push('School name is required');
    if (!this.emergency_contact_name_first) errors.push('Emergency contact first name is required');
    if (!this.emergency_contact_name_last) errors.push('Emergency contact last name is required');
    if (!this.emergency_contact_phone) errors.push('Emergency contact phone is required');
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Sanitize user data for public display
  toPublicJSON() {
    return {
      user_id: this.user_id,
      email: this.email,
      email_is_verified: this.email_is_verified,
      school_name: this.school_name,
      phone: this.phone,
      pronouns: this.pronouns,
      name_first: this.name_first,
      name_last: this.name_last,
      name_first_preferred: this.name_first_preferred,
      permission_level: this.permission_level
    };
  }

  // Convert to JSON (excludes sensitive data by default)
  toJSON() {
    return this.toPublicJSON();
  }

  // Check if account is locked
  isAccountLocked() {
    return this.account_locked_until && new Date() < new Date(this.account_locked_until);
  }

  // Lock account for specified duration (in minutes)
  lockAccount(durationMinutes = 30) {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + durationMinutes);
    this.account_locked_until = lockUntil;
    this.failed_login_attempts = 0; // Reset attempts when locking
  }

  // Unlock account
  unlockAccount() {
    this.account_locked_until = null;
    this.failed_login_attempts = 0;
  }

  // Increment failed login attempts
  incrementFailedLoginAttempts() {
    this.failed_login_attempts = (this.failed_login_attempts || 0) + 1;
    
    // Lock account after 5 failed attempts
    if (this.failed_login_attempts >= 5) {
      this.lockAccount(30); // Lock for 30 minutes
    }
  }

  // Reset failed login attempts on successful login
  resetFailedLoginAttempts() {
    this.failed_login_attempts = 0;
    this.account_locked_until = null;
    this.last_login = new Date();
  }

  // Set email verification token
  setEmailVerificationToken(token) {
    this.email_verification_token = token;
    // Token expires in 24 hours
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    this.email_verification_expires = expires;
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

  // Set password reset token
  setPasswordResetToken(token) {
    this.password_reset_token = token;
    // Token expires in 1 hour
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);
    this.password_reset_expires = expires;
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

  // Get JWT payload
  getJWTPayload() {
    return {
      user_id: this.user_id,
      email: this.email,
      permission_level: this.permission_level,
      email_is_verified: this.email_is_verified,
      name_first: this.name_first,
      name_last: this.name_last,
      name_first_preferred: this.name_first_preferred
    };
  }
}

module.exports = User;
