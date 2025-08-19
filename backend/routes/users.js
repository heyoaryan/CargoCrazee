const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, asyncHandler(async (req, res) => {
  res.json({
    status: 'success',
    data: {
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        fullName: req.user.fullName,
        email: req.user.email,
        company: req.user.company,
        businessType: req.user.businessType,
        phone: req.user.phone,
        address: req.user.address,
        profileImage: req.user.profileImage,
        isEmailVerified: req.user.isEmailVerified,
        isPhoneVerified: req.user.isPhoneVerified,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      }
    }
  });
}));

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('businessType')
    .optional()
    .isIn(['ecommerce', 'retail', 'manufacturing', 'wholesale', 'services', 'other'])
    .withMessage('Please select a valid business type'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage('Zip code must be between 3 and 10 characters')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const user = await User.findById(req.user._id);

  // Update fields
  const updateFields = ['firstName', 'lastName', 'company', 'phone', 'businessType', 'address'];
  updateFields.forEach(field => {
    if (req.body[field]) {
      if (field === 'address') {
        user[field] = { ...user[field], ...req.body[field] };
      } else {
        user[field] = req.body[field];
      }
    }
  });

  await user.save();

  res.json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        company: user.company,
        businessType: user.businessType,
        phone: user.phone,
        address: user.address,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    }
  });
}));

// @route   POST /api/users/upload-profile-image
// @desc    Upload profile image
// @access  Private
router.post('/upload-profile-image', auth, asyncHandler(async (req, res) => {
  // TODO: Implement file upload logic with multer
  // For now, just return success
  res.json({
    status: 'success',
    message: 'Profile image upload endpoint - implementation pending',
    data: {
      imageUrl: 'https://example.com/profile-image.jpg'
    }
  });
}));

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Deactivate account instead of deleting
  user.isActive = false;
  await user.save();

  res.json({
    status: 'success',
    message: 'Account deactivated successfully'
  });
}));

module.exports = router;
