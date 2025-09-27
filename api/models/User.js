class User {
  constructor(data = {}) {

    // User profile
    this.user_id = data.user_id || null;
    this.first_name = data.first_name || null;
    this.last_name = data.last_name || null;
    this.pre_name = data.pre_name || null;
    this.email = data.email || null;
    this.phone = data.phone || null;
    this.pronouns = data.pronouns || null;
    
    // Social profiles
    this.user_linkedin = data.user_linkedin || null;
    this.user_github = data.user_github || null;
    
    // Membership
    this.mem_id = data.mem_id || 1;
    
    // Emergency contact
    this.em_first_name = data.em_first_name || null;
    this.em_last_name = data.em_last_name || null;
    this.em_relationship = data.em_relationship || null;
    this.em_phone = data.em_phone || null;
  }
}

module.exports = User;