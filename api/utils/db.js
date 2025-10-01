const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Login = require('../models/Login');
const AuthUtils = require('./AuthUtils');
const crypto = require('crypto');

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
        email, // required
        password, // required
        first_name, // required
        last_name, // required
        pronouns = null, // optional
        phone = null, // optional
        user_linkedin = null,
        user_github = null,
        pre_name = null,
      } = userData;
      // Validate required fields
      if (!email || !password || !first_name || !last_name) {
        throw new Error('Email, password, first name, and last name are required fields');
      }
      
      const cleanedPhone = phone ? phone.replace(/[^\d+]/g, '') : null;
      
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
      
      const [userResult] = await connection.execute(
        `INSERT INTO user (email, first_name, last_name, phone, pronouns, user_linkedin, user_github, pre_name) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [email, first_name, last_name, cleanedPhone, pronouns, user_linkedin, user_github, pre_name]
      );
      
      const userId = userResult.insertId;

      // Hash password and create login entry
      const { hash, salt } = await AuthUtils.hashPassword(password);

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
      await connection.execute(
        `INSERT INTO login (user_id, username, password_hash, password_salt, is_admin, email_verification_token, email_verification_expires) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, email, hash, salt, 0, verificationToken, verificationExpires]
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
        user_github,
        pre_name
      });

      const createdLogin = new Login({
        user_id: userId,
        username: email,
        password: hash,
        salt: salt,
        is_admin: 0
      });
      
      // Return user data with login and tokens
      return {
        success: true,
        user: AuthUtils.userSafeJSON(createdUser),
        login: AuthUtils.loginSafeJson(createdLogin),
        emailVerificationToken: verificationToken,
        tokens: {
          access_token: generateToken(userId),
          refresh_token: AuthUtils.generateRefreshToken({ user_id: userId })
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
        'pronouns', 'user_linkedin', 'user_github', 'pre_name'
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
         user_linkedin, user_github, pre_name
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
      
      // Generate new verification token and save to database
      const newToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await connection.execute(
        'UPDATE login SET email_verification_token = ?, email_verification_expires = ? WHERE user_id = ?',
        [newToken, tokenExpires, userData.user_id]
      );

      return {
        success: true, 
        user: new User(userData), 
        login: login,
        emailVerificationToken: newToken 
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
        'first_name', 'last_name', 'pre_name', 'phone', 'pronouns', 
        'user_linkedin', 'user_github', 'school'
      ];
      const updates = [];
      const values = [];

      if (updateData.preferred_name !== undefined) {
      updateData.pre_name = updateData.preferred_name;
      delete updateData.preferred_name;
      }

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value || null);
        }
      }
      
      if (updates.length === 0) {
        throw new Error('No valid fields provided for update');
      }
      
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
      const updatedUser = await db.getUserById(userId);
      return{
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      }
      
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
      
      // Hash new password with new salt
      const { hash, salt } = await AuthUtils.hashPassword(newPassword);
      
      // Update login with new password and salt
      const [result] = await connection.execute(
        'UPDATE login SET password_hash = ?, password_salt = ? WHERE user_id = ?',
        [hash, salt, userId]
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
        'UPDATE login SET email_is_verified = ? WHERE user_id = ?',
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

  // Authenticate user with email and password
  authenticateUser: async (email, password) => {
    const connection = await pool.getConnection();
    try {
      // Get user and login data
      const [userRows] = await connection.execute(
        'SELECT u.*, l.user_id as login_user_id, l.username, l.password_hash, l.password_salt, l.is_admin FROM user u INNER JOIN login l ON u.user_id = l.user_id WHERE l.username = ?',
        [email]
      );
      
      if (userRows.length === 0) {
        return { success: false, message: 'Invalid credentials' };
      }
      
      const userData = userRows[0];

      // Create Login instance with salt for password verification
      const login = new Login({
        user_id: userData.login_user_id,
        username: userData.username,
        password_hash: userData.password_hash,
        password_salt: userData.password_salt,
        is_admin: userData.is_admin
      });
      
      // Verify password using stored salt
      const isPasswordValid = await AuthUtils.verifyPassword(password, login.password_hash, login.password_salt);
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid credentials' };
      }
      
      // Create User instance
      const user = new User({
        user_id: userData.user_id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        pronouns: userData.pronouns,
        user_linkedin: userData.user_linkedin,
        user_github: userData.user_github,
        pre_name: userData.pre_name
      });
      
      return {
        success: true,
        user: user,
        login: login
      };
      
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  },

  verifyEmailToken: async (token) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT user_id FROM login WHERE email_verification_token = ? AND email_verification_expires > NOW()',
      [token]
    );
    
    if (rows.length === 0) {
      return { success: false, message: 'Invalid or expired verification token' };
    }
    
    // Mark email as verified and clear token
    await connection.execute(
      'UPDATE login SET email_is_verified = TRUE, email_verification_token = NULL, email_verification_expires = NULL WHERE user_id = ?',
      [rows[0].user_id]
    );
    
    return { success: true, message: 'Email verified successfully' };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
  },
};

module.exports = db;