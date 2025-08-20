const express = require('express');
const { body, validationResult } = require('express-validator');
const Delivery = require('../models/Delivery');
const Alert = require('../models/Alert');
const { auth, checkOwnership } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @route   POST /api/deliveries
// @desc    Create a new delivery
// @access  Private
router.post('/', [
  auth,
  body('customer.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  body('customer.phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('pickup.address')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Pickup address must be between 10 and 500 characters'),
  body('delivery.address')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Delivery address must be between 10 and 500 characters'),
  body('package.type')
    .isIn(['Furniture', 'Electronics', 'Clothing', 'Food Items', 'Fragile Items', 'Other'])
    .withMessage('Please select a valid package type'),
  body('package.weight')
    .isFloat({ min: 0.1 })
    .withMessage('Package weight must be at least 0.1 kg'),
  body('schedule.deliveryDate')
    .isISO8601()
    .withMessage('Please provide a valid delivery date'),
  body('schedule.preferredTimeSlot')
    .isIn(['9-12', '12-15', '15-18', '18-21'])
    .withMessage('Please select a valid time slot')
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

  const {
    customer,
    pickup,
    delivery,
    package,
    schedule,
    notes,
    pricing: clientPricing = {},
    route: clientRoute = {}
  } = req.body;

  // Calculate base pricing
  let baseCost = 150; // align with frontend Step 4
  let distanceCost = 0;
  let weightCost = 0;
  let specialHandlingCost = package.isFragile ? 50 : 0;
  // Fallback model mirrors frontend computedMetrics
  const routeKm = Number(clientRoute.distance) || 0;
  const pkgWeight = Number(package.weight) || 0;
  distanceCost = Math.round(routeKm * 12);
  weightCost = Math.max(0, pkgWeight - 5) * 5;
  let totalCost = baseCost + distanceCost + weightCost + specialHandlingCost;

  // If client provided a computed pricing from Step 4, prefer that
  const asNumber = (v) => (typeof v === 'number' && isFinite(v) ? v : undefined);
  const providedTotal = asNumber(clientPricing.totalCost);
  if (providedTotal && providedTotal > 0) {
    baseCost = asNumber(clientPricing.baseCost) ?? baseCost;
    distanceCost = asNumber(clientPricing.distanceCost) ?? distanceCost;
    weightCost = asNumber(clientPricing.weightCost) ?? weightCost;
    specialHandlingCost = asNumber(clientPricing.specialHandlingCost) ?? specialHandlingCost;
    totalCost = providedTotal;
  }

  // Create delivery
  const deliveryData = new Delivery({
    userId: req.user._id,
    customer,
    pickup,
    delivery,
    package,
    schedule: {
      ...schedule,
      pickupDate: schedule.pickupDate || schedule.deliveryDate
    },
    pricing: {
      baseCost,
      distanceCost,
      weightCost,
      specialHandlingCost,
      totalCost
    },
    route: {
      distance: asNumber(clientRoute.distance) ?? undefined,
      estimatedTime: asNumber(clientRoute.estimatedTime) ?? undefined,
      optimizedRoute: clientRoute.optimizedRoute || 'Standard Route',
      waypoints: Array.isArray(clientRoute.waypoints) ? clientRoute.waypoints : undefined
    },
    notes
  });

  try {
    await deliveryData.save();
  } catch (err) {
    // If rate limit or DB write errors happen, surface a clear message
    return res.status(429).json({
      status: 'error',
      message: err?.message?.includes('rate') ? 'Too many requests. Please wait a moment.' : 'Failed to create delivery. Please try again.'
    });
  }

  // Create success alert
  await Alert.createDeliveryAlert(
    req.user._id,
    deliveryData._id,
    'success',
    'Delivery Scheduled Successfully!',
    `New delivery ${deliveryData.deliveryId} has been scheduled from ${pickup.address.substring(0, 30)}... to ${delivery.address.substring(0, 30)}...`,
    {
      cost: { original: totalCost, optimized: totalCost, savings: 0 }
    }
  );

  // Create route optimization alert
  await Alert.createDeliveryAlert(
    req.user._id,
    deliveryData._id,
    'info',
    'Route Optimization Available',
    `AI has found a more efficient route for ${deliveryData.deliveryId} that could save 15% on delivery time.`,
    {
      cost: { original: totalCost, optimized: totalCost * 0.85, savings: totalCost * 0.15 }
    }
  );

  res.status(201).json({
    status: 'success',
    message: 'Delivery created successfully',
    data: {
      delivery: {
        id: deliveryData._id,
        deliveryId: deliveryData.deliveryId,
        customer: deliveryData.customer,
        pickup: deliveryData.pickup,
        delivery: deliveryData.delivery,
        package: deliveryData.package,
        schedule: deliveryData.schedule,
        pricing: deliveryData.pricing,
        status: deliveryData.status,
        createdAt: deliveryData.createdAt
      }
    }
  });
}));

// @route   GET /api/deliveries
// @desc    Get all deliveries for the user
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  const skip = (page - 1) * limit;

  // Build query
  const query = { userId: req.user._id, isActive: true };
  
  if (status) {
    query['status.current'] = status;
  }

  if (startDate && endDate) {
    query['schedule.deliveryDate'] = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Get deliveries
  const deliveries = await Delivery.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'firstName lastName company');

  // Get total count
  const total = await Delivery.countDocuments(query);

  res.json({
    status: 'success',
    data: {
      deliveries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   GET /api/deliveries/by-delivery-id/:deliveryId
// @desc    Get a delivery by its human-friendly deliveryId (e.g., #DEL...)
// @access  Private
router.get('/by-delivery-id/:deliveryId', auth, asyncHandler(async (req, res) => {
  const delivery = await Delivery.findOne({
    userId: req.user._id,
    deliveryId: req.params.deliveryId,
    isActive: true,
  });

  if (!delivery) {
    return res.status(404).json({
      status: 'error',
      message: 'Delivery not found',
    });
  }

  res.json({
    status: 'success',
    data: { delivery }
  });
}));

// @route   GET /api/deliveries/:id
// @desc    Get delivery by ID
// @access  Private
router.get('/:id', [auth, checkOwnership(Delivery)], asyncHandler(async (req, res) => {
  const delivery = await Delivery.findById(req.params.id)
    .populate('userId', 'firstName lastName company');

  res.json({
    status: 'success',
    data: { delivery }
  });
}));

// @route   PUT /api/deliveries/:id
// @desc    Update delivery
// @access  Private
router.put('/:id', [
  auth,
  checkOwnership(Delivery),
  body('customer.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  body('customer.phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('pickup.address')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Pickup address must be between 10 and 500 characters'),
  body('delivery.address')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Delivery address must be between 10 and 500 characters')
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

  const delivery = req.resource;

  // Only allow updates if delivery is not in progress
  if (delivery.isInProgress) {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot update delivery that is in progress'
    });
  }

  // Update fields
  const updateFields = ['customer', 'pickup', 'delivery', 'package', 'schedule', 'notes'];
  updateFields.forEach(field => {
    if (req.body[field]) {
      delivery[field] = { ...delivery[field], ...req.body[field] };
    }
  });

  await delivery.save();

  res.json({
    status: 'success',
    message: 'Delivery updated successfully',
    data: { delivery }
  });
}));

// @route   DELETE /api/deliveries/:id
// @desc    Cancel delivery
// @access  Private
router.delete('/:id', [auth, checkOwnership(Delivery)], asyncHandler(async (req, res) => {
  const delivery = req.resource;

  // Only allow cancellation if delivery is not in progress
  if (delivery.isInProgress) {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot cancel delivery that is in progress'
    });
  }

  // Update status to cancelled
  await delivery.updateStatus('Cancelled', 'System', 'Delivery cancelled by user');

  // Create cancellation alert
  await Alert.createDeliveryAlert(
    req.user._id,
    delivery._id,
    'warning',
    'Delivery Cancelled',
    `Delivery ${delivery.deliveryId} has been cancelled.`,
    {}
  );

  res.json({
    status: 'success',
    message: 'Delivery cancelled successfully'
  });
}));

// @route   PUT /api/deliveries/:id/status
// @desc    Update delivery status
// @access  Private
router.put('/:id/status', [
  auth,
  checkOwnership(Delivery),
  body('status')
    .isIn(['Scheduled', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed'])
    .withMessage('Please provide a valid status'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
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

  const { status, location, notes } = req.body;
  const delivery = req.resource;

  // Update status
  await delivery.updateStatus(status, location, notes, req.user._id);

  // Create status update alert
  const alertType = status === 'Delivered' ? 'success' : 
                   status === 'Failed' ? 'error' : 'info';

  const alertTitle = status === 'Delivered' ? 'Delivery Completed Successfully! 🎉' :
                    status === 'Failed' ? 'Delivery Failed' :
                    `Delivery ${status}`;

  const alertMessage = status === 'Delivered' ? 
    `Delivery ${delivery.deliveryId} has been completed successfully. Customer: ${delivery.customer.name}` :
    status === 'Failed' ? 
    `Delivery ${delivery.deliveryId} has failed. Please contact support.` :
    `Delivery ${delivery.deliveryId} status updated to ${status}.`;

  await Alert.createDeliveryAlert(
    req.user._id,
    delivery._id,
    alertType,
    alertTitle,
    alertMessage,
    { location, notes }
  );

  // If delivery is completed, create additional success metrics alert
  if (status === 'Delivered') {
    await Alert.createDeliveryAlert(
      req.user._id,
      delivery._id,
      'success',
      'Revenue Generated! 💰',
      `Delivery ${delivery.deliveryId} has generated ₹${delivery.pricing.totalCost} in revenue.`,
      { 
        revenue: delivery.pricing.totalCost,
        customer: delivery.customer.name 
      }
    );
  }

  res.json({
    status: 'success',
    message: 'Delivery status updated successfully',
    data: { delivery }
  });
}));

// @route   PUT /api/deliveries/:id/tracking
// @desc    Update delivery tracking
// @access  Private
router.put('/:id/tracking', [
  auth,
  checkOwnership(Delivery),
  body('currentLocation.coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('currentLocation.coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('currentLocation.address')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Address must be between 2 and 200 characters'),
  body('estimatedArrival')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date')
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

  const delivery = req.resource;

  // Update tracking info
  if (req.body.currentLocation) {
    delivery.tracking.currentLocation = {
      ...delivery.tracking.currentLocation,
      ...req.body.currentLocation,
      timestamp: new Date()
    };
  }

  if (req.body.estimatedArrival) {
    delivery.tracking.estimatedArrival = new Date(req.body.estimatedArrival);
  }

  await delivery.save();

  res.json({
    status: 'success',
    message: 'Tracking updated successfully',
    data: { delivery }
  });
}));

// @route   POST /api/deliveries/:id/delivery-proof
// @desc    Add delivery proof
// @access  Private
router.post('/:id/delivery-proof', [
  auth,
  checkOwnership(Delivery),
  body('signature')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Signature must be between 2 and 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
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

  const delivery = req.resource;

  // Only allow delivery proof for completed deliveries
  if (delivery.status.current !== 'Delivered') {
    return res.status(400).json({
      status: 'error',
      message: 'Can only add delivery proof for completed deliveries'
    });
  }

  // Update delivery proof
  delivery.tracking.deliveryProof = {
    ...delivery.tracking.deliveryProof,
    ...req.body,
    timestamp: new Date()
  };

  await delivery.save();

  res.json({
    status: 'success',
    message: 'Delivery proof added successfully',
    data: { delivery }
  });
}));

// @route   GET /api/deliveries/stats/overview
// @desc    Get delivery statistics
// @access  Private
router.get('/stats/overview', auth, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get delivery counts by status
  const statusCounts = await Delivery.aggregate([
    { $match: { userId, isActive: true } },
    { $group: { _id: '$status.current', count: { $sum: 1 } } }
  ]);

  // Get total deliveries
  const totalDeliveries = await Delivery.countDocuments({ userId, isActive: true });

  // Get completed deliveries
  const completedDeliveries = await Delivery.countDocuments({ 
    userId, 
    isActive: true, 
    'status.current': 'Delivered' 
  });

  // Get total revenue
  const revenueStats = await Delivery.aggregate([
    { $match: { userId, isActive: true, 'status.current': 'Delivered' } },
    { $group: { _id: null, totalRevenue: { $sum: '$pricing.totalCost' } } }
  ]);

  // Get recent deliveries
  const recentDeliveries = await Delivery.find({ userId, isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('deliveryId customer pickup delivery status pricing createdAt');

  const stats = {
    total: totalDeliveries,
    completed: completedDeliveries,
    inProgress: totalDeliveries - completedDeliveries,
    revenue: revenueStats[0]?.totalRevenue || 0,
    statusBreakdown: statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    recentDeliveries
  };

  res.json({
    status: 'success',
    data: { stats }
  });
}));

module.exports = router;
