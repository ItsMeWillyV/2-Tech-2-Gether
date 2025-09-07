const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission, requireVerification } = require('../middleware/auth');

// Public route - accessible to everyone
router.get('/public', (req, res) => {
  res.json({
    success: true,
    message: 'This is a public endpoint',
    data: {
      timestamp: new Date().toISOString(),
      server_status: 'running'
    }
  });
});

// Protected route - requires authentication
router.get('/protected', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'This is a protected endpoint',
    user: {
      user_id: req.user.user_id,
      email: req.user.email,
      name: `${req.user.name_first} ${req.user.name_last}`
    }
  });
});

// Verified users only - requires email verification
router.get('/verified-only', authenticateToken, requireVerification, (req, res) => {
  res.json({
    success: true,
    message: 'This endpoint is only accessible to verified users',
    user: {
      user_id: req.user.user_id,
      email: req.user.email,
      verified: req.user.email_is_verified
    }
  });
});

// Admin only - requires permission level 5 or higher
router.get('/admin', authenticateToken, requirePermission(5), (req, res) => {
  res.json({
    success: true,
    message: 'Admin-only endpoint',
    user: {
      user_id: req.user.user_id,
      permission_level: req.user.permission_level
    }
  });
});

// Moderator only - requires permission level 3 or higher
router.get('/moderator', authenticateToken, requirePermission(3), (req, res) => {
  res.json({
    success: true,
    message: 'Moderator-level endpoint',
    user: {
      user_id: req.user.user_id,
      permission_level: req.user.permission_level
    }
  });
});

// User management endpoints (admin only)
router.get('/users', authenticateToken, requirePermission(5), (req, res) => {
  // In production, fetch from database with pagination
  res.json({
    success: true,
    message: 'User list (admin access)',
    note: 'This would return a list of users from the database'
  });
});

router.put('/users/:userId/permission', authenticateToken, requirePermission(5), (req, res) => {
  const { userId } = req.params;
  const { permission_level } = req.body;

  // Validate permission level
  if (typeof permission_level !== 'number' || permission_level < 0 || permission_level > 10) {
    return res.status(400).json({
      success: false,
      message: 'Permission level must be a number between 0 and 10'
    });
  }

  // In production, update user in database
  res.json({
    success: true,
    message: `User ${userId} permission level updated to ${permission_level}`
  });
});

module.exports = router;
