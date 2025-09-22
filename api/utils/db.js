const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Login = require('../models/Login');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'q&8p%d5S2!B5Z%ojNLXyK#',
  database: process.env.DB_NAME || 'new_schema',
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
  // Create a new user (always creates both user and login entries)
  createUser: async (userData) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { 
        email, // doubles as username
        password, // required
        first_name, // required
        last_name, // required
        pronouns = null, // optional
        phone = null, // optional
        user_linkedin = null,
        user_github = null
      } = userData;
      
      // Validate required fields
      if (!email || !password || !first_name || !last_name) {
        throw new Error('Email, password, first name, and last name are required fields');
      }
      
      // Create User instance for validation
      const userForValidation = new User({
        email,
        first_name,
        last_name,
        phone,
        pronouns,
        user_linkedin,
        user_github
      });
      
      // Validate user data using User class validation
      const validation = userForValidation.validateRegistration();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Check if user already exists (by email)
      const [existingUsers] = await connection.execute(
        'SELECT user_id FROM user WHERE email = ?',
        [email]
      );
      
      if (existingUsers.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Check if login already exists (by email as username)
      const [existingLogin] = await connection.execute(
        'SELECT user_id FROM login WHERE username = ?',
        [email]
      );

      if (existingLogin.length > 0) {
        throw new Error('Login with this email already exists');
      }
      
      // Insert new user - fields match ERD schema exactly
      const [userResult] = await connection.execute(
        `INSERT INTO user (email, first_name, last_name, phone, pronouns, user_linkedin, user_github) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [email, first_name, last_name, phone, pronouns, user_linkedin, user_github]
      );
      
      const userId = userResult.insertId;

      // Hash password and create login entry
      const hashedPassword = await Login.hashPassword(password);
      
      await connection.execute(
        `INSERT INTO login (user_id, username, password, is_admin) VALUES (?, ?, ?, ?)`,
        [userId, email, hashedPassword, 0] // email as username, is_admin=0 for regular user
      );

      await connection.commit();
      
      // Create User and Login instances with complete database data
      const createdUser = new User({
        user_id: userId,
        email,
        first_name,
        last_name,
        phone,
        pronouns,
        user_linkedin,
        user_github
      });

      const createdLogin = new Login({
        user_id: userId,
        username: email,
        password: hashedPassword,
        is_admin: 0
      });
      
      // Return user data with login and tokens
      return {
        user: createdUser.toPublicJSON(),
        login: createdLogin.toSafeJSON(),
        tokens: {
          access_token: createdLogin.generateJWTToken(),
          refresh_token: createdLogin.generateRefreshToken()
        }
      };
      
    } catch (error) {
      await connection.rollback();
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

  // Resend email verification
  resendEmailVerification: async (email) => {
    const connection = await pool.getConnection();
    try {
      // Get user by email
      const [userRows] = await connection.execute(
        'SELECT * FROM user WHERE email = ?',
        [email]
      );
      
      if (userRows.length === 0) {
        return { success: false, message: 'User not found' };
      }
      
      const userData = userRows[0];
      
      // Get login for this user
      const [loginRows] = await connection.execute(
        'SELECT * FROM login WHERE user_id = ?',
        [userData.user_id]
      );
      
      if (loginRows.length === 0) {
        return { success: false, message: 'Login not found' };
      }
      
      const login = new Login(loginRows[0]);
      
      // Check if already verified
      if (login.email_is_verified) {
        return { success: false, message: 'Email already verified' };
      }
      
      // Generate new verification token (handled locally, not stored in DB)
      const newToken = login.setEmailVerificationToken();
      
      return { 
        success: true, 
        user: new User(userData), 
        login: login,
        verificationToken: newToken 
      };
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  },

  // Set password reset token
  setPasswordResetToken: async (email) => {
    const connection = await pool.getConnection();
    try {
      // Get user by email
      const [userRows] = await connection.execute(
        'SELECT * FROM user WHERE email = ?',
        [email]
      );
      
      if (userRows.length === 0) {
        return { success: false, message: 'User not found' };
      }
      
      const userData = userRows[0];
      
      // Get login for this user
      const [loginRows] = await connection.execute(
        'SELECT * FROM login WHERE user_id = ?',
        [userData.user_id]
      );
      
      if (loginRows.length === 0) {
        return { success: false, message: 'Login not found' };
      }
      
      const login = new Login(loginRows[0]);
      
      // Generate password reset token (handled locally, not stored in DB)
      const resetToken = login.setPasswordResetToken();
      
      return { 
        success: true, 
        user: new User(userData), 
        login: login,
        resetToken: resetToken 
      };
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    const connection = await pool.getConnection();
    try {
      const [userRows] = await connection.execute(
        'SELECT * FROM user WHERE user_id = ?',
        [userId]
      );
      
      if (userRows.length === 0) {
        return null;
      }
      
      return new User(userRows[0]);
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  },

  // Update user profile
  updateUserProfile: async (userId, updateData) => {
    const connection = await pool.getConnection();
    try {
      // Build dynamic update query based on provided fields
      const allowedFields = [
        'first_name', 'last_name', 'preferred_name', 'phone', 'pronouns', 
        'user_linkedin', 'user_github', 'school'
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
      
      // Return updated user
      return await this.getUserById(userId);
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  },

  // Update user password by user ID
  updateUserPassword: async (userId, newPassword) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Hash new password
      const hashedPassword = await Login.hashPassword(newPassword);
      
      // Update login with new password
      const [result] = await connection.execute(
        'UPDATE login SET password_hash = ?, updated_at = NOW() WHERE user_id = ?',
        [hashedPassword, userId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Login not found');
      }
      
      await connection.commit();
      
      return { success: true, message: 'Password updated successfully' };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Update email verification status
  updateEmailVerificationStatus: async (userId, isVerified) => {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'UPDATE login SET email_is_verified = ?, updated_at = NOW() WHERE user_id = ?',
        [isVerified ? 1 : 0, userId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Login not found');
      }
      
      return { success: true, message: 'Email verification status updated' };
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  },

  // Get login by user ID
  getLoginByUserId: async (userId) => {
    const connection = await pool.getConnection();
    try {
      const [loginRows] = await connection.execute(
        'SELECT * FROM login WHERE user_id = ?',
        [userId]
      );
      
      if (loginRows.length === 0) {
        return null;
      }
      
      return new Login(loginRows[0]);
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = db;