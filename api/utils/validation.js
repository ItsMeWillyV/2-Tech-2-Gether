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
  
  body('name_first')
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name is required and must contain only letters, spaces, hyphens, and apostrophes'),
  
  body('name_last')
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name is required and must contain only letters, spaces, hyphens, and apostrophes'),
  
  body('name_first_preferred')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .matches(/^[a-zA-Z\s'-]*$/)
    .withMessage('Preferred name must contain only letters, spaces, hyphens, and apostrophes'),
  
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Phone number format is invalid'),
  
  body('school_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('School name must be less than 100 characters'),
  
  body('pronouns')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Pronouns must be less than 20 characters'),
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
  body('name_first')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name must contain only letters, spaces, hyphens, and apostrophes'),
  
  body('name_last')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name must contain only letters, spaces, hyphens, and apostrophes'),
  
  body('name_first_preferred')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .matches(/^[a-zA-Z\s'-]*$/)
    .withMessage('Preferred name must contain only letters, spaces, hyphens, and apostrophes'),
  
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Phone number format is invalid'),
  
  body('school_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('School name must be less than 100 characters'),
  
  body('pronouns')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Pronouns must be less than 20 characters')
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
