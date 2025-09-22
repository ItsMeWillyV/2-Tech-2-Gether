class User {
  constructor({
    user_id = null,
    first_name = null,
    last_name = null,
    email = null,
    phone = null,
    pronouns = null,
    user_linkedin = null,
    user_github = null
  } = {}) {
    // Core database fields from ERD
    this.user_id = user_id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.phone = phone;
    this.pronouns = pronouns;
    this.user_linkedin = user_linkedin;
    this.user_github = user_github;
  }

  // Get full name
  getFullName() {
    return `${this.first_name} ${this.last_name}`;
  }

  // Get emergency contact full name
  getEmergencyContactName() {
    if (this.emergency_name) {
      return this.emergency_name;
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
    if (!this.first_name) errors.push('First name is required');
    if (!this.last_name) errors.push('Last name is required');
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Sanitize user data for public display
  toPublicJSON() {
    return {
      user_id: this.user_id,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      phone: this.phone,
      pronouns: this.pronouns,
      user_linkedin: this.user_linkedin,
      user_github: this.user_github
    };
  }

  // Convert to JSON (excludes sensitive data by default)
  toJSON() {
    return this.toPublicJSON();
  }
}

module.exports = User;
