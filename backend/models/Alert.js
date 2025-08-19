const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['delay', 'success', 'warning', 'info', 'error'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'completed', 'archived'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['delivery', 'payment', 'system', 'weather', 'route', 'shared_truck', 'warehouse'],
    required: true
  },
  shipmentId: {
    type: String,
    trim: true
  },
  deliveryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery'
  },
  route: {
    from: String,
    to: String,
    distance: Number,
    estimatedTime: Number
  },
  metadata: {
    coordinates: {
      lat: Number,
      lng: Number
    },
    weather: {
      condition: String,
      temperature: Number,
      humidity: Number
    },
    traffic: {
      level: String,
      delay: Number
    },
    cost: {
      original: Number,
      optimized: Number,
      savings: Number
    }
  },
  actions: [{
    label: String,
    action: String,
    url: String,
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE'],
      default: 'GET'
    }
  }],
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for alert age
alertSchema.virtual('age').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return created.toLocaleDateString();
});

// Virtual for alert urgency
alertSchema.virtual('isUrgent').get(function() {
  return this.priority === 'urgent' || this.priority === 'high';
});

// Indexes for better query performance
alertSchema.index({ userId: 1, createdAt: -1 });
alertSchema.index({ userId: 1, read: 1 });
alertSchema.index({ userId: 1, status: 1 });
alertSchema.index({ type: 1 });
alertSchema.index({ priority: 1 });
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to set read timestamp
alertSchema.pre('save', function(next) {
  if (this.isModified('read') && this.read && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Method to mark as read
alertSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Method to archive alert
alertSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Method to update status
alertSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Static method to find unread alerts
alertSchema.statics.findUnread = function(userId) {
  return this.find({ userId, read: false, isActive: true });
};

// Static method to find alerts by type
alertSchema.statics.findByType = function(userId, type) {
  return this.find({ userId, type, isActive: true });
};

// Static method to find active alerts
alertSchema.statics.findActive = function(userId) {
  return this.find({ 
    userId, 
    status: { $in: ['active', 'pending'] }, 
    isActive: true 
  });
};

// Static method to get alert count by status
alertSchema.statics.getCountByStatus = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
};

// Static method to get unread count
alertSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, read: false, isActive: true });
};

// Static method to bulk mark as read
alertSchema.statics.bulkMarkAsRead = function(userId, alertIds) {
  return this.updateMany(
    { _id: { $in: alertIds }, userId },
    { 
      $set: { 
        read: true, 
        readAt: new Date() 
      } 
    }
  );
};

// Static method to create system alert
alertSchema.statics.createSystemAlert = function(userId, type, title, message, metadata = {}) {
  return this.create({
    userId,
    type,
    title,
    message,
    category: 'system',
    priority: type === 'error' ? 'high' : 'medium',
    metadata,
    status: 'active'
  });
};

// Static method to create delivery alert
alertSchema.statics.createDeliveryAlert = function(userId, deliveryId, type, title, message, metadata = {}) {
  return this.create({
    userId,
    deliveryId,
    type,
    title,
    message,
    category: 'delivery',
    priority: type === 'delay' ? 'high' : 'medium',
    metadata,
    status: 'active'
  });
};

module.exports = mongoose.model('Alert', alertSchema);
