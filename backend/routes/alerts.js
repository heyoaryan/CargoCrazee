const express = require('express');
const { body, validationResult } = require('express-validator');
const Alert = require('../models/Alert');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/alerts
// @desc    Get all alerts for the user
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const type = req.query.type;
  const status = req.query.status;
  const priority = req.query.priority;
  const read = req.query.read;

  const skip = (page - 1) * limit;

  // Build query
  const query = { userId: req.user._id, isActive: true };
  
  if (type) {
    query.type = type;
  }

  if (status) {
    query.status = status;
  }

  if (priority) {
    query.priority = priority;
  }

  if (read !== undefined) {
    query.read = read === 'true';
  }

  // Get alerts
  const alerts = await Alert.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count
  const total = await Alert.countDocuments(query);

  // Get unread count
  const unreadCount = await Alert.getUnreadCount(req.user._id);

  res.json({
    status: 'success',
    data: {
      alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    }
  });
}));

// @route   GET /api/alerts/unread
// @desc    Get unread alerts
// @access  Private
router.get('/unread', auth, asyncHandler(async (req, res) => {
  const alerts = await Alert.findUnread(req.user._id);

  res.json({
    status: 'success',
    data: { alerts }
  });
}));

// @route   GET /api/alerts/:id
// @desc    Get alert by ID
// @access  Private
router.get('/:id', auth, asyncHandler(async (req, res) => {
  const alert = await Alert.findOne({
    _id: req.params.id,
    userId: req.user._id,
    isActive: true
  });

  if (!alert) {
    return res.status(404).json({
      status: 'error',
      message: 'Alert not found'
    });
  }

  res.json({
    status: 'success',
    data: { alert }
  });
}));

// @route   PUT /api/alerts/:id/read
// @desc    Mark alert as read
// @access  Private
router.put('/:id/read', auth, asyncHandler(async (req, res) => {
  const alert = await Alert.findOne({
    _id: req.params.id,
    userId: req.user._id,
    isActive: true
  });

  if (!alert) {
    return res.status(404).json({
      status: 'error',
      message: 'Alert not found'
    });
  }

  await alert.markAsRead();

  res.json({
    status: 'success',
    message: 'Alert marked as read',
    data: { alert }
  });
}));

// @route   PUT /api/alerts/:id/archive
// @desc    Archive alert
// @access  Private
router.put('/:id/archive', auth, asyncHandler(async (req, res) => {
  const alert = await Alert.findOne({
    _id: req.params.id,
    userId: req.user._id,
    isActive: true
  });

  if (!alert) {
    return res.status(404).json({
      status: 'error',
      message: 'Alert not found'
    });
  }

  await alert.archive();

  res.json({
    status: 'success',
    message: 'Alert archived successfully'
  });
}));

// @route   PUT /api/alerts/bulk-read
// @desc    Mark multiple alerts as read
// @access  Private
router.put('/bulk-read', [
  auth,
  body('alertIds')
    .isArray({ min: 1 })
    .withMessage('Alert IDs array is required')
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

  const { alertIds } = req.body;

  await Alert.bulkMarkAsRead(req.user._id, alertIds);

  res.json({
    status: 'success',
    message: `${alertIds.length} alerts marked as read`
  });
}));

// @route   DELETE /api/alerts/:id
// @desc    Delete alert
// @access  Private
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const alert = await Alert.findOne({
    _id: req.params.id,
    userId: req.user._id,
    isActive: true
  });

  if (!alert) {
    return res.status(404).json({
      status: 'error',
      message: 'Alert not found'
    });
  }

  alert.isActive = false;
  await alert.save();

  res.json({
    status: 'success',
    message: 'Alert deleted successfully'
  });
}));

// @route   GET /api/alerts/stats/overview
// @desc    Get alert statistics
// @access  Private
router.get('/stats/overview', auth, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get alert counts by status
  const statusCounts = await Alert.getCountByStatus(userId);

  // Get alert counts by type
  const typeCounts = await Alert.aggregate([
    { $match: { userId, isActive: true } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  // Get alert counts by priority
  const priorityCounts = await Alert.aggregate([
    { $match: { userId, isActive: true } },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);

  // Get unread count
  const unreadCount = await Alert.getUnreadCount(userId);

  // Get total alerts
  const totalAlerts = await Alert.countDocuments({ userId, isActive: true });

  const stats = {
    total: totalAlerts,
    unread: unreadCount,
    read: totalAlerts - unreadCount,
    statusBreakdown: statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    typeBreakdown: typeCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    priorityBreakdown: priorityCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  };

  res.json({
    status: 'success',
    data: { stats }
  });
}));

// @route   POST /api/alerts/test
// @desc    Create a test alert (for development)
// @access  Private
router.post('/test', [
  auth,
  body('type')
    .isIn(['delay', 'success', 'warning', 'info', 'error'])
    .withMessage('Please provide a valid alert type'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Message must be between 10 and 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Please provide a valid priority level')
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

  const { type, title, message, priority = 'medium' } = req.body;

  const alert = await Alert.createSystemAlert(
    req.user._id,
    type,
    title,
    message,
    { priority }
  );

  res.status(201).json({
    status: 'success',
    message: 'Test alert created successfully',
    data: { alert }
  });
}));

module.exports = router;
