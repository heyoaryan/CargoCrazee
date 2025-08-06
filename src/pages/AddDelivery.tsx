import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertContext } from '../App';
import { 
  MapPin, 
  Package, 
  Calendar, 
  Clock, 
  Truck,
  Plus,
  Minus,
  CheckCircle,
  Cloud,
  Navigation,
  Thermometer,
  Wind
} from 'lucide-react';

const AddDelivery = () => {
  const navigate = useNavigate();
  const { addAlert } = useContext(AlertContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    packageType: '',
    packageName: '', // New field for custom package name
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    deliveryDate: '',
    deliveryTime: '',
    specialInstructions: '',
    customerName: '',
    customerPhone: '',
  });

  const [showPackageName, setShowPackageName] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const steps = [
    { number: 1, title: 'Pickup & Delivery', icon: MapPin },
    { number: 2, title: 'Package Details', icon: Package },
    { number: 3, title: 'Schedule', icon: Calendar },
    { number: 4, title: 'Confirmation', icon: CheckCircle },
  ];

  const packageTypes = [
    'Documents',
    'Electronics',
    'Clothing',
    'Food Items',
    'Fragile Items',
    'Other',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle package type change
    if (name === 'packageType') {
      setShowPackageName(value === 'Other');
      setFormData(prev => ({ ...prev, [name]: value }));
      return;
    }
    
    if (name.includes('dimensions.')) {
      const dimension = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: { ...prev.dimensions, [dimension]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      
      // Show AI suggestions when moving to step 4 (after scheduling)
      if (currentStep === 3) {
        setShowAISuggestions(true);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleBackToDashboard = () => {
    // Create delivery data to save
    const deliveryData = {
      id: `#DEL${Math.floor(Math.random() * 1000)}`,
      from: formData.pickupAddress.substring(0, 20) + '...',
      to: formData.deliveryAddress.substring(0, 20) + '...',
      status: 'Scheduled',
      time: 'Just now',
      cost: '₹350',
      date: formData.deliveryDate,
      packageType: formData.packageType === 'Other' ? formData.packageName : formData.packageType,
    };

    // Save to localStorage for Dashboard to pick up
    localStorage.setItem('newDelivery', JSON.stringify(deliveryData));
    
    // Add success alert
    addAlert({
      type: 'success',
      title: 'Delivery Scheduled Successfully!',
      message: `New delivery ${deliveryData.id} has been scheduled from ${formData.pickupAddress.substring(0, 30)}... to ${formData.deliveryAddress.substring(0, 30)}...`,
      time: 'Just now',
      status: 'active',
      priority: 'medium',
      shipmentId: deliveryData.id,
      route: `${formData.pickupAddress.substring(0, 15)}... → ${formData.deliveryAddress.substring(0, 15)}...`,
      read: false,
    });

    // Add route optimization alert
    addAlert({
      type: 'info',
      title: 'Route Optimization Available',
      message: `AI has found a more efficient route for ${deliveryData.id} that could save 15% on delivery time.`,
      time: 'Just now',
      status: 'pending',
      priority: 'medium',
      shipmentId: deliveryData.id,
      route: `${formData.pickupAddress.substring(0, 15)}... → ${formData.deliveryAddress.substring(0, 15)}...`,
      read: false,
    });
    
    // Reset form and go back to dashboard
    setCurrentStep(1);
    setFormData({
      pickupAddress: '',
      deliveryAddress: '',
      packageType: '',
      packageName: '',
      weight: '',
      dimensions: { length: '', width: '', height: '' },
      deliveryDate: '',
      deliveryTime: '',
      specialInstructions: '',
      customerName: '',
      customerPhone: '',
    });
    setShowPackageName(false);
    setShowAISuggestions(false);
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Pickup & Delivery Locations
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter pickup address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter delivery address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Phone *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Package Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Type *
              </label>
              <select
                name="packageType"
                value={formData.packageType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select package type</option>
                {packageTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {showPackageName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Name *
                </label>
                <input
                  type="text"
                  name="packageName"
                  value={formData.packageName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter package name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg) *
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter weight in kg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions (cm)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="number"
                  name="dimensions.length"
                  value={formData.dimensions.length}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Length"
                />
                <input
                  type="number"
                  name="dimensions.width"
                  value={formData.dimensions.width}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Width"
                />
                <input
                  type="number"
                  name="dimensions.height"
                  value={formData.dimensions.height}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Height"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Any special handling instructions..."
              />
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Schedule Delivery
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select time slot</option>
                    <option value="9-12">9:00 AM - 12:00 PM</option>
                    <option value="12-15">12:00 PM - 3:00 PM</option>
                    <option value="15-18">3:00 PM - 6:00 PM</option>
                    <option value="18-21">6:00 PM - 9:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Route Suggestion Preview */}
            {(formData.deliveryDate && formData.deliveryTime) && (
              <div className="space-y-6">
                {/* AI Route Suggestion */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Navigation className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      AI Route Suggestion
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Estimated Distance:</span>
                      <span className="font-semibold text-gray-800">24.5 km</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Estimated Time:</span>
                      <span className="font-semibold text-gray-800">45 minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Estimated Cost:</span>
                      <span className="font-semibold text-green-600">₹350</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Shared Truck Available:</span>
                      <span className="font-semibold text-blue-600">Yes (30% savings)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Optimal Route:</span>
                      <span className="font-semibold text-blue-600">Via Ring Road</span>
                    </div>
                  </div>
                </div>

                {/* AI Weather Suggestion */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Cloud className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      AI Weather Suggestion
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Weather Condition:</span>
                      <span className="font-semibold text-gray-800">Partly Cloudy</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Temperature:</span>
                      <span className="font-semibold text-gray-800">28°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Humidity:</span>
                      <span className="font-semibold text-gray-800">65%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Wind Speed:</span>
                      <span className="font-semibold text-gray-800">12 km/h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Delivery Risk:</span>
                      <span className="font-semibold text-green-600">Low</span>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 mt-3">
                      <div className="flex items-start space-x-2">
                        <Thermometer className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <strong>AI Recommendation:</strong> Weather conditions are favorable for delivery. 
                          Consider using climate-controlled packaging for sensitive items.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800">
              Delivery Scheduled Successfully!
            </h2>
            
            <p className="text-gray-600 text-lg">
              Your delivery has been scheduled and we're finding the best route and shared truck options.
            </p>

            <div className="bg-gray-50 rounded-xl p-6 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-gray-800 mb-4">Delivery Details:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery ID:</span>
                  <span className="font-medium">#DEL{Math.floor(Math.random() * 1000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">From:</span>
                  <span className="font-medium">{formData.pickupAddress.substring(0, 20)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium">{formData.deliveryAddress.substring(0, 20)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formData.deliveryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Cost:</span>
                  <span className="font-medium text-green-600">₹350</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-blue-600">Scheduled</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleBackToDashboard}
                className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-500 transition-all duration-200"
              >
                Back to Dashboard
              </button>
              
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setFormData({
                    pickupAddress: '',
                    deliveryAddress: '',
                    packageType: '',
                    packageName: '',
                    weight: '',
                    dimensions: { length: '', width: '', height: '' },
                    deliveryDate: '',
                    deliveryTime: '',
                    specialInstructions: '',
                    customerName: '',
                    customerPhone: '',
                  });
                  setShowPackageName(false);
                  setShowAISuggestions(false);
                }}
                className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
              >
                Schedule Another Delivery
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 font-poppins">
              Add New Delivery
            </h1>
            <p className="text-gray-600">
              Schedule a new shipment with AI-powered route optimization
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-3xl mx-auto px-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 ${
                      isActive 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : isCompleted 
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6" />
                      ) : (
                        <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                      )}
                    </div>
                    <div className="ml-2 sm:ml-3 hidden sm:block">
                      <div className={`text-xs sm:text-sm font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        Step {step.number}
                      </div>
                      <div className={`text-xs sm:text-sm ${
                        isActive ? 'text-gray-800' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 sm:w-16 h-px mx-2 sm:mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
              {renderStep()}

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className="flex flex-col sm:flex-row justify-between mt-8 pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      currentStep === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-500 transition-all duration-200"
                  >
                    {currentStep === 3 ? 'Schedule Delivery' : 'Next Step'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Glassmorphism Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 text-center"
          >
            <div className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-3 shadow-lg">
              <p className="text-gray-600 text-xs sm:text-sm font-medium">
                AI-Powered Route Optimization • Smart Delivery Scheduling • Real-time Tracking
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AddDelivery;