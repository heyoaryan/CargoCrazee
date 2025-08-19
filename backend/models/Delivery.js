const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  deliveryId: {
    type: String,
    required: true,
    default: function() {
      return `#DEL${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customer: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  pickup: {
    address: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    contactPerson: String,
    contactPhone: String,
    instructions: String
  },
  delivery: {
    address: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    contactPerson: String,
    contactPhone: String,
    instructions: String
  },
  package: {
    type: {
      type: String,
      required: [true, 'Package type is required'],
      enum: ['Documents', 'Electronics', 'Clothing', 'Food Items', 'Fragile Items', 'Other']
    },
    name: {
      type: String,
      trim: true
    },
    weight: {
      type: Number,
      required: [true, 'Package weight is required'],
      min: [0.1, 'Weight must be at least 0.1 kg']
    },
    dimensions: {
      length: {
        type: Number,
        min: [0, 'Length must be positive']
      },
      width: {
        type: Number,
        min: [0, 'Width must be positive']
      },
      height: {
        type: Number,
        min: [0, 'Height must be positive']
      }
    },
    specialInstructions: String,
    isFragile: {
      type: Boolean,
      default: false
    },
    requiresClimateControl: {
      type: Boolean,
      default: false
    }
  },
  schedule: {
    pickupDate: {
      type: Date,
      required: [true, 'Pickup date is required']
    },
    deliveryDate: {
      type: Date,
      required: [true, 'Delivery date is required']
    },
    preferredTimeSlot: {
      type: String,
      enum: ['9-12', '12-15', '15-18', '18-21'],
      required: [true, 'Preferred time slot is required']
    },
    isUrgent: {
      type: Boolean,
      default: false
    }
  },
  pricing: {
    baseCost: {
      type: Number,
      required: true,
      min: [0, 'Base cost cannot be negative']
    },
    distanceCost: {
      type: Number,
      default: 0
    },
    weightCost: {
      type: Number,
      default: 0
    },
    specialHandlingCost: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      required: true,
      min: [0, 'Total cost cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  route: {
    distance: {
      type: Number,
      min: [0, 'Distance cannot be negative']
    },
    estimatedTime: {
      type: Number,
      min: [0, 'Estimated time cannot be negative']
    },
    optimizedRoute: {
      type: String,
      default: 'Standard Route'
    },
    waypoints: [{
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      },
      order: Number
    }]
  },
  status: {
    current: {
      type: String,
      enum: ['Scheduled', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed', 'Cancelled'],
      default: 'Scheduled'
    },
    history: [{
      status: {
        type: String,
        enum: ['Scheduled', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed', 'Cancelled']
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      location: String,
      notes: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  tracking: {
    currentLocation: {
      coordinates: {
        lat: Number,
        lng: Number
      },
      address: String,
      timestamp: Date
    },
    estimatedArrival: Date,
    actualPickupTime: Date,
    actualDeliveryTime: Date,
    deliveryProof: {
      signature: String,
      photo: String,
      notes: String,
      timestamp: Date
    }
  },
  aiOptimization: {
    routeOptimized: {
      type: Boolean,
      default: false
    },
    sharedTruckAvailable: {
      type: Boolean,
      default: false
    },
    sharedTruckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SharedTruck'
    },
    costSavings: {
      type: Number,
      default: 0
    },
    timeSavings: {
      type: Number,
      default: 0
    },
    carbonFootprint: {
      type: Number,
      default: 0
    },
    recommendations: [{
      type: String,
      enum: ['route_optimization', 'shared_truck', 'time_slot_change', 'package_consolidation']
    }]
  },
  weather: {
    condition: String,
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low'
    }
  },
  notes: {
    internal: String,
    customer: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for delivery status
deliverySchema.virtual('isCompleted').get(function() {
  return this.status.current === 'Delivered';
});

deliverySchema.virtual('isInProgress').get(function() {
  return ['Picked Up', 'In Transit', 'Out for Delivery'].includes(this.status.current);
});

deliverySchema.virtual('isCancelled').get(function() {
  return this.status.current === 'Cancelled';
});

// Indexes for better query performance
deliverySchema.index({ userId: 1, createdAt: -1 });
deliverySchema.index({ deliveryId: 1 });
deliverySchema.index({ 'status.current': 1 });
deliverySchema.index({ 'schedule.deliveryDate': 1 });
deliverySchema.index({ 'pickup.coordinates': '2dsphere' });
deliverySchema.index({ 'delivery.coordinates': '2dsphere' });

// Pre-save middleware to update status history
deliverySchema.pre('save', function(next) {
  if (this.isModified('status.current')) {
    this.status.history.push({
      status: this.status.current,
      timestamp: new Date(),
      location: this.tracking.currentLocation?.address || 'System Update'
    });
  }
  next();
});

// Method to update delivery status
deliverySchema.methods.updateStatus = function(newStatus, location = '', notes = '', updatedBy = null) {
  this.status.current = newStatus;
  this.status.history.push({
    status: newStatus,
    timestamp: new Date(),
    location,
    notes,
    updatedBy
  });
  
  // Update tracking info based on status
  if (newStatus === 'Picked Up') {
    this.tracking.actualPickupTime = new Date();
  } else if (newStatus === 'Delivered') {
    this.tracking.actualDeliveryTime = new Date();
  }
  
  return this.save();
};

// Method to calculate delivery time
deliverySchema.methods.calculateDeliveryTime = function() {
  if (this.tracking.actualPickupTime && this.tracking.actualDeliveryTime) {
    return this.tracking.actualDeliveryTime - this.tracking.actualPickupTime;
  }
  return null;
};

// Static method to find deliveries by status
deliverySchema.statics.findByStatus = function(status) {
  return this.find({ 'status.current': status });
};

// Static method to find active deliveries
deliverySchema.statics.findActive = function() {
  return this.find({ 
    isActive: true,
    'status.current': { $nin: ['Delivered', 'Cancelled', 'Failed'] }
  });
};

// Static method to find deliveries by date range
deliverySchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    'schedule.deliveryDate': {
      $gte: startDate,
      $lte: endDate
    }
  });
};

module.exports = mongoose.model('Delivery', deliverySchema);
