const express = require('express');
const Delivery = require('../models/Delivery');
const Alert = require('../models/Alert');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/dashboard/overview
// @desc    Get dashboard overview statistics
// @access  Private
router.get('/overview', auth, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get delivery statistics
  const deliveryStats = await Delivery.aggregate([
    { $match: { userId, isActive: true } },
    {
      $group: {
        _id: null,
        totalDeliveries: { $sum: 1 },
        completedDeliveries: {
          $sum: { $cond: [{ $eq: ['$status.current', 'Delivered'] }, 1, 0] }
        },
        totalRevenue: {
          $sum: { $cond: [{ $eq: ['$status.current', 'Delivered'] }, '$pricing.totalCost', 0] }
        },
        averageDeliveryTime: {
          $avg: {
            $cond: [
              { $eq: ['$status.current', 'Delivered'] },
              { $subtract: ['$tracking.actualDeliveryTime', '$tracking.actualPickupTime'] },
              null
            ]
          }
        }
      }
    }
  ]);

  // Get alert statistics
  const alertStats = await Alert.aggregate([
    { $match: { userId, isActive: true } },
    {
      $group: {
        _id: null,
        totalAlerts: { $sum: 1 },
        unreadAlerts: {
          $sum: { $cond: ['$read', 0, 1] }
        },
        urgentAlerts: {
          $sum: { $cond: [{ $in: ['$priority', ['high', 'urgent']] }, 1, 0] }
        }
      }
    }
  ]);

  // Get recent deliveries
  const recentDeliveries = await Delivery.find({ userId, isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('deliveryId customer pickup delivery status pricing createdAt');

  // Get recent alerts
  const recentAlerts = await Alert.find({ userId, isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('type title message status priority createdAt');

  // Get delivery status breakdown
  const statusBreakdown = await Delivery.aggregate([
    { $match: { userId, isActive: true } },
    { $group: { _id: '$status.current', count: { $sum: 1 } } }
  ]);

  // Get monthly revenue for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Delivery.aggregate([
    {
      $match: {
        userId,
        isActive: true,
        'status.current': 'Delivered',
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$pricing.totalCost' },
        deliveries: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Calculate CO2 savings (simplified calculation)
  const totalDistance = await Delivery.aggregate([
    { $match: { userId, isActive: true, 'status.current': 'Delivered' } },
    { $group: { _id: null, totalDistance: { $sum: '$route.distance' } } }
  ]);

  const co2Saved = (totalDistance[0]?.totalDistance || 0) * 0.2; // 0.2 kg CO2 per km saved

  // Calculate time savings (simplified calculation)
  const timeSaved = (deliveryStats[0]?.averageDeliveryTime || 0) * 0.15; // 15% time savings

  const overview = {
    deliveries: {
      total: deliveryStats[0]?.totalDeliveries || 0,
      completed: deliveryStats[0]?.completedDeliveries || 0,
      inProgress: (deliveryStats[0]?.totalDeliveries || 0) - (deliveryStats[0]?.completedDeliveries || 0),
      revenue: deliveryStats[0]?.totalRevenue || 0,
      averageTime: deliveryStats[0]?.averageDeliveryTime || 0
    },
    alerts: {
      total: alertStats[0]?.totalAlerts || 0,
      unread: alertStats[0]?.unreadAlerts || 0,
      urgent: alertStats[0]?.urgentAlerts || 0
    },
    savings: {
      co2: co2Saved,
      time: timeSaved,
      cost: deliveryStats[0]?.totalRevenue * 0.25 || 0 // 25% cost savings
    },
    statusBreakdown: statusBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    monthlyRevenue,
    recentDeliveries,
    recentAlerts
  };

  res.json({
    status: 'success',
    data: { overview }
  });
}));

// @route   GET /api/dashboard/analytics
// @desc    Get detailed analytics data
// @access  Private
router.get('/analytics', auth, asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const period = req.query.period || '30'; // days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period));

  // Get delivery analytics
  const deliveryAnalytics = await Delivery.aggregate([
    {
      $match: {
        userId,
        isActive: true,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          status: '$status.current'
        },
        count: { $sum: 1 },
        revenue: { $sum: '$pricing.totalCost' }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);

  // Get package type distribution
  const packageTypes = await Delivery.aggregate([
    {
      $match: {
        userId,
        isActive: true,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$package.type',
        count: { $sum: 1 },
        totalWeight: { $sum: '$package.weight' }
      }
    }
  ]);

  // Get route popularity
  const routePopularity = await Delivery.aggregate([
    {
      $match: {
        userId,
        isActive: true,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          from: '$pickup.address',
          to: '$delivery.address'
        },
        count: { $sum: 1 },
        totalDistance: { $sum: '$route.distance' },
        totalCost: { $sum: '$pricing.totalCost' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Get performance metrics
  const performanceMetrics = await Delivery.aggregate([
    {
      $match: {
        userId,
        isActive: true,
        'status.current': 'Delivered',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        avgDeliveryTime: {
          $avg: { $subtract: ['$tracking.actualDeliveryTime', '$tracking.actualPickupTime'] }
        },
        avgCost: { $avg: '$pricing.totalCost' },
        avgDistance: { $avg: '$route.distance' },
        onTimeDeliveries: {
          $sum: {
            $cond: [
              { $lte: ['$tracking.actualDeliveryTime', '$schedule.deliveryDate'] },
              1,
              0
            ]
          }
        },
        totalDeliveries: { $sum: 1 }
      }
    }
  ]);

  const analytics = {
    deliveryTrends: deliveryAnalytics,
    packageTypes,
    routePopularity,
    performance: performanceMetrics[0] || {
      avgDeliveryTime: 0,
      avgCost: 0,
      avgDistance: 0,
      onTimeDeliveries: 0,
      totalDeliveries: 0
    },
    period
  };

  res.json({
    status: 'success',
    data: { analytics }
  });
}));

// @route   GET /api/dashboard/notifications
// @desc    Get recent notifications and alerts
// @access  Private
router.get('/notifications', auth, asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const limit = parseInt(req.query.limit) || 10;

  // Get recent alerts
  const alerts = await Alert.find({ userId, isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('type title message status priority createdAt read');

  // Get delivery updates
  const deliveryUpdates = await Delivery.find({ userId, isActive: true })
    .sort({ 'status.history.timestamp': -1 })
    .limit(limit)
    .select('deliveryId status customer pickup delivery createdAt');

  const notifications = {
    alerts,
    deliveryUpdates,
    unreadCount: alerts.filter(alert => !alert.read).length
  };

  res.json({
    status: 'success',
    data: { notifications }
  });
}));

// @route   GET /api/dashboard/quick-stats
// @desc    Get quick statistics for dashboard widgets
// @access  Private
router.get('/quick-stats', auth, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Today's statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStats = await Delivery.aggregate([
    {
      $match: {
        userId,
        isActive: true,
        createdAt: { $gte: today }
      }
    },
    {
      $group: {
        _id: null,
        deliveries: { $sum: 1 },
        revenue: { $sum: '$pricing.totalCost' }
      }
    }
  ]);

  // This week's statistics
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekStats = await Delivery.aggregate([
    {
      $match: {
        userId,
        isActive: true,
        createdAt: { $gte: weekStart }
      }
    },
    {
      $group: {
        _id: null,
        deliveries: { $sum: 1 },
        revenue: { $sum: '$pricing.totalCost' }
      }
    }
  ]);

  // This month's statistics
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthStats = await Delivery.aggregate([
    {
      $match: {
        userId,
        isActive: true,
        createdAt: { $gte: monthStart }
      }
    },
    {
      $group: {
        _id: null,
        deliveries: { $sum: 1 },
        revenue: { $sum: '$pricing.totalCost' }
      }
    }
  ]);

  // Active deliveries
  const activeDeliveries = await Delivery.countDocuments({
    userId,
    isActive: true,
    'status.current': { $in: ['Scheduled', 'Picked Up', 'In Transit', 'Out for Delivery'] }
  });

  // Pending alerts
  const pendingAlerts = await Alert.countDocuments({
    userId,
    isActive: true,
    read: false
  });

  const quickStats = {
    today: {
      deliveries: todayStats[0]?.deliveries || 0,
      revenue: todayStats[0]?.revenue || 0
    },
    week: {
      deliveries: weekStats[0]?.deliveries || 0,
      revenue: weekStats[0]?.revenue || 0
    },
    month: {
      deliveries: monthStats[0]?.deliveries || 0,
      revenue: monthStats[0]?.revenue || 0
    },
    active: activeDeliveries,
    pendingAlerts
  };

  res.json({
    status: 'success',
    data: { quickStats }
  });
}));

module.exports = router;
