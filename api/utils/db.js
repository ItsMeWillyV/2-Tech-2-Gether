const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'your_database_name',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Helper function to hash passwords
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

const db = {
  // Create a new user
  createUser: async (userData) => {
    const connection = await pool.getConnection();
    try {
      const { 
        email, 
        password, 
        org_id, 
        first_name, 
        last_name,
        pronouns = null, // Optional: pronouns
        phone = null, // Optional: phone
        user_linkedin = null,
        user_github = null
      } = userData;
      
      // Validate required fields
      if (!email || !password || !org_id || !first_name || !last_name) {
        throw new Error('Email, password, organization, first name, and last name are required fields');
      }
      
      // Check if user already exists
      const [existingUsers] = await connection.execute(
        'SELECT user_id FROM user WHERE email = ?',
        [email]
      );
      
      if (existingUsers.length > 0) {
        throw new Error('User with this email already exists');
      }
      
      
      if (orgExists.length === 0) {
        throw new Error('Invalid organization ID');
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Insert new user
      const [result] = await connection.execute(
        `INSERT INTO user (email, password_hash, first_name, last_name, phone, org_id, pronouns, user_linkedin, user_github) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [email, hashedPassword, first_name, last_name, phone, org_id, pronouns, user_linkedin, user_github]
      );
      
      // Generate JWT token
      const token = generateToken(result.insertId);
      
      return {
        userId: result.insertId,
        email,
        first_name,
        last_name,
        phone,
        org_id,
        pronouns,
        user_linkedin,
        user_github,
        token
      };
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  },

  // Update an existing user
  updateUser: async (userId, updateData) => {
    const connection = await pool.getConnection();
    try {
      // Build dynamic update query based on provided fields
      const allowedFields = [
        'email', 'first_name', 'last_name', 'phone', 'org_id', 
        'pronouns', 'user_linkedin', 'user_github'
      ];
      const updates = [];
      const values = [];
      
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (updates.length === 0) {
        throw new Error('No valid fields provided for update');
      }
      
      // Add updated_at timestamp and userId to values array
      updates.push('updated_at = NOW()');
      values.push(userId);
      
      // Execute update
      const [result] = await connection.execute(
        `UPDATE user SET ${updates.join(', ')} WHERE user_id = ?`,
        values
      );
      
      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }
      
      // Return updated user data (without password)
      const [updatedUser] = await connection.execute(
        `SELECT user_id, email, first_name, last_name, phone, org_id, pronouns, 
         user_linkedin, user_github
         FROM user WHERE user_id = ?`,
        [userId]
      );
      
      return updatedUser[0];
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  },

  // Update user address
  updateUserAddress: async (userId, addressData) => {
    const connection = await pool.getConnection();
    try {
      const { street_1, street_2 = null, city, state, zip } = addressData;
      
      // Validate required address fields
      if (!street_1 || !city || !state || !zip) {
        throw new Error('Street 1, city, state, and zip are required for address');
      }
      
      // Check if user exists
      const [user] = await connection.execute(
        'SELECT user_id FROM user WHERE user_id = ?',
        [userId]
      );
      
      if (user.length === 0) {
        throw new Error('User not found');
      }
      
      // Check if address already exists for user
      const [existingAddress] = await connection.execute(
        'SELECT address_id FROM address WHERE user_id = ?',
        [userId]
      );
      
      if (existingAddress.length > 0) {
        // Update existing address
        const [result] = await connection.execute(
          'UPDATE address SET street_1 = ?, street_2 = ?, city = ?, state = ?, zip = ? WHERE user_id = ?',
          [street_1, street_2, city, state, zip, userId]
        );
        
        return { message: 'Address updated successfully', addressId: existingAddress[0].address_id };
      } else {
        // Create new address
        const [result] = await connection.execute(
          'INSERT INTO address (user_id, street_1, street_2, city, state, zip) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, street_1, street_2, city, state, zip]
        );
        
        return { message: 'Address created successfully', addressId: result.insertId };
      }
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  },

  // Register a user for an event with emergency contact
  registerUserForEvent: async (userId, eventId, emergencyContactData = null) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Check if user exists
      const [user] = await connection.execute(
        'SELECT user_id FROM user WHERE user_id = ?',
        [userId]
      );
      
      if (user.length === 0) {
        throw new Error('User not found');
      }
      
      // Check if event exists
      const [event] = await connection.execute(
        'SELECT event_id FROM event WHERE event_id = ?',
        [eventId]
      );
      
      if (event.length === 0) {
        throw new Error('Event not found');
      }
      
      // Check if user is already registered for this event
      const [existingRegistration] = await connection.execute(
        'SELECT registration_id FROM registrations WHERE user_id = ? AND event_id = ?',
        [userId, eventId]
      );
      
      if (existingRegistration.length > 0) {
        throw new Error('User is already registered for this event');
      }
      
      let emergencyContactId = null;
      
      // Handle emergency contact if provided
      if (emergencyContactData) {
        const { 
          em_first_name, 
          em_last_name, 
          em_relationship, 
          em_phone, 
          em_linkedin = null 
        } = emergencyContactData;
        
        if (!em_first_name || !em_last_name || !em_relationship || !em_phone) {
          throw new Error('Emergency contact requires first name, last name, relationship, and phone');
        }
        
        // Insert emergency contact
        const [emResult] = await connection.execute(
          `INSERT INTO user (first_name, last_name, em_relationship, phone, user_linkedin, mem_id) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [em_first_name, em_last_name, em_relationship, em_phone, em_linkedin, userId]
        );
        
        emergencyContactId = emResult.insertId;
      }
      
      // Register user for event
      const [result] = await connection.execute(
        'INSERT INTO registrations (user_id, event_id, registration_date) VALUES (?, ?, NOW())',
        [userId, eventId]
      );
      
      await connection.commit();
      
      return {
        registrationId: result.insertId,
        userId,
        eventId,
        emergencyContactId,
        message: 'Successfully registered for event'
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Helper method to authenticate user (useful for login)
  authenticateUser: async (email, password) => {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        'SELECT user_id, email, password_hash, first_name, last_name, org_id FROM user WHERE email = ?',
        [email]
      );
      
      if (users.length === 0) {
        throw new Error('Invalid credentials');
      }
      
      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }
      
      const token = generateToken(user.user_id);
      
      return {
        userId: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        org_id: user.org_id,
        token
      };
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  },

  // Helper method to get user by ID (useful for JWT verification)
  getUserById: async (userId) => {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        `SELECT u.user_id, u.email, u.first_name, u.last_name, u.phone, u.org_id, 
         u.user_linkedin, u.user_github,
         a.street_1, a.street_2, a.city, a.state, a.zip,
         o.org_name
         FROM user u
         LEFT JOIN address a ON u.user_id = a.user_id
         LEFT JOIN organization o ON u.org_id = o.org_id
         WHERE u.user_id = ?`,
        [userId]
      );
      
      return users[0] || null;
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  },

  // Get user's emergency contacts
  getEmergencyContacts: async (userId) => {
    const connection = await pool.getConnection();
    try {
      const [contacts] = await connection.execute(
        `SELECT user_id, first_name, last_name, em_relationship, phone, user_linkedin
         FROM user WHERE mem_id = ? AND em_relationship IS NOT NULL`,
        [userId]
      );
      
      return contacts;
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  },

  // Get all organizations (useful for registration forms)
  getOrganizations: async () => {
    const connection = await pool.getConnection();
    try {
      const [organizations] = await connection.execute(
        'SELECT org_id, org_name, org_phone FROM organization WHERE active = 1'
      );
      
      return organizations;
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = db;