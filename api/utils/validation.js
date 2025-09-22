const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('first_name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name is required and must contain only letters, spaces, hyphens, and apostrophes'),
  
  body('last_name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name is required and must contain only letters, spaces, hyphens, and apostrophes'),
  
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Phone number format is invalid'),
  
  body('pronouns')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Pronouns must be less than 20 characters'),

  body('user_linkedin')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('LinkedIn URL must be less than 200 characters'),

  body('user_github')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('GitHub URL must be less than 200 characters'),
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required')
];

// Validation rules for password reset request
const validatePasswordResetRequest = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required')
];

// Validation rules for password reset
const validatePasswordReset = [
  body('token')
    .isLength({ min: 1 })
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// Validation rules for email verification
const validateEmailVerification = [
  body('token')
    .isLength({ min: 1 })
    .withMessage('Verification token is required')
];

// Validation for resend verification request
const validateResendVerification = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required')
];

// Validation rules for profile update
const validateProfileUpdate = [
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name must contain only letters, spaces, hyphens, and apostrophes'),
  
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name must contain only letters, spaces, hyphens, and apostrophes'),
  
  body('preferred_name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .matches(/^[a-zA-Z\s'-]*$/)
    .withMessage('Preferred name must contain only letters, spaces, hyphens, and apostrophes'),
  
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Phone number format is invalid'),
  
  body('school')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('School name must be less than 100 characters'),
  
  body('pronouns')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Pronouns must be less than 20 characters'),

  body('user_linkedin')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('LinkedIn URL must be less than 200 characters'),

  body('user_github')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('GitHub URL must be less than 200 characters')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification,
  validateProfileUpdate,
  validateResendVerification,
  handleValidationErrors
};
