import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Warehouse, 
  MapPin, 
  DollarSign, 
  Package, 
  Clock, 
  Star,
  Filter,
  Grid3X3,
  List,
  Calendar,
  Thermometer,
  Shield,
  Truck,
  CheckCircle,
  X,
  Plus,
  BookOpen
} from 'lucide-react';
import { apiService } from '../services/api';

const MicroWarehouse = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState({
    spaceRequired: '',
    duration: '',
    startDate: '',
    packageType: '',
    specialRequirements: []
  });

  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load warehouses data
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        // const data = await apiService.getMicroWarehouses();
        // setWarehouses(data);
        setWarehouses([]);
      } catch (error) {
        console.error('Error loading warehouses:', error);
        setWarehouses([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWarehouses();
  }, []);

  const categories = [
    { id: 'all', label: 'All Warehouses', count: 0 },
    { id: 'premium', label: 'Premium', count: 0 },
    { id: 'standard', label: 'Standard', count: 0 },
    { id: 'economy', label: 'Economy', count: 0 },
    { id: 'available', label: 'Available Now', count: 0 },
  ];

  const filteredWarehouses = warehouses.filter(warehouse => {
    if (selectedCategory === 'premium') return warehouse.type === 'Premium';
    if (selectedCategory === 'standard') return warehouse.type === 'Standard';
    if (selectedCategory === 'economy') return warehouse.type === 'Economy';
    if (selectedCategory === 'available') return warehouse.availability === 'Available';
    return true;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Premium': return 'bg-purple-100 text-purple-800';
      case 'Standard': return 'bg-blue-100 text-blue-800';
      case 'Economy': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Limited': return 'bg-yellow-100 text-yellow-800';
      case 'Full': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBookingFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to book the warehouse
    console.log('Booking warehouse:', selectedWarehouse?.name, 'with details:', bookingForm);
    setShowBookingForm(false);
    setSelectedWarehouse(null);
    setBookingForm({
      spaceRequired: '',
      duration: '',
      startDate: '',
      packageType: '',
      specialRequirements: []
    });
  };

  const openBookingForm = (warehouse: any) => {
    setSelectedWarehouse(warehouse);
    setShowBookingForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 font-poppins">
              Micro-Warehouse Network
            </h1>
            <p className="text-gray-600">
              Strategic storage locations across Delhi for faster last-mile delivery and inventory management
            </p>
          </motion.div>

          {/* Controls */}
          <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-500 to-green-400 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Warehouses Grid/List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading warehouses...</p>
              </div>
            </div>
          ) : filteredWarehouses.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Warehouse className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Warehouses Available</h3>
                <p className="text-gray-600">Check back later for available micro-warehouses.</p>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' 
              : 'space-y-4'
            }>
              {filteredWarehouses.map((warehouse, index) => (
              <motion.div
                key={warehouse.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  viewMode === 'list' ? 'p-6' : 'overflow-hidden'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Image Placeholder */}
                    <div className="h-32 sm:h-48 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                      <Warehouse className="h-8 w-8 sm:h-16 sm:w-16 text-blue-500" />
                    </div>

                    <div className="p-4 sm:p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 truncate">
                            {warehouse.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{warehouse.location}</span>
                            <span>•</span>
                            <span>{warehouse.distance}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(warehouse.type)}`}>
                            {warehouse.type}
                          </span>
                        </div>
                      </div>

                      {/* Rating and Reviews */}
                      <div className="flex items-center space-x-2 mb-4 flex-wrap">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                          <span className="font-medium text-gray-800 text-sm">{warehouse.rating}</span>
                        </div>
                        <span className="text-gray-500 text-xs sm:text-sm">({warehouse.reviews} reviews)</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(warehouse.availability)}`}>
                          {warehouse.availability}
                        </span>
                      </div>

                      {/* Space Availability */}
                      <div className="mb-4">
                        <div className="text-xs sm:text-sm text-gray-600 mb-2">
                          <Package className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                          {warehouse.capacity} • Last-mile: {warehouse.lastMile}
                        </div>
                        <div className="bg-gray-100 rounded-full h-2 mb-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(warehouse.availableSpace / warehouse.totalSpace) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-600">
                          Available: {warehouse.availableSpace} sq ft of {warehouse.totalSpace} sq ft
                        </div>
                      </div>

                      {/* Features */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {warehouse.features.slice(0, 2).map((feature, i) => (
                            <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                              {feature}
                            </span>
                          ))}
                          {warehouse.features.length > 2 && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                              +{warehouse.features.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="border-t border-gray-200 pt-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs sm:text-sm text-gray-600">Starting from</div>
                            <div className="text-base sm:text-lg font-bold text-gray-800">
                              ₹{warehouse.pricePerDay}/day
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs sm:text-sm text-gray-600">Monthly</div>
                            <div className="text-base sm:text-lg font-bold text-green-600">
                              ₹{warehouse.pricePerMonth}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button 
                          onClick={() => openBookingForm(warehouse)}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-green-400 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-green-500 transition-all duration-200 text-sm flex items-center justify-center space-x-1"
                        >
                          <BookOpen className="h-4 w-4" />
                          <span>Book Now</span>
                        </button>
                        <button className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm">
                          Details
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* List View */
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 sm:p-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Warehouse className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 space-y-2 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{warehouse.name}</h3>
                          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 mt-1">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{warehouse.location} • {warehouse.distance}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(warehouse.type)}`}>
                            {warehouse.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(warehouse.availability)}`}>
                            {warehouse.availability}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                            <span>{warehouse.rating} ({warehouse.reviews})</span>
                          </div>
                          <span>{warehouse.capacity}</span>
                          <span>Last-mile: {warehouse.lastMile}</span>
                          <span>Available: {warehouse.availableSpace} sq ft</span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                          <div className="text-right">
                            <div className="text-base sm:text-lg font-bold text-gray-800">₹{warehouse.pricePerDay}/day</div>
                            <div className="text-xs sm:text-sm text-green-600">₹{warehouse.pricePerMonth}/month</div>
                          </div>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <button 
                              onClick={() => openBookingForm(warehouse)}
                              className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-green-500 transition-all duration-200 text-sm flex items-center justify-center space-x-1"
                            >
                              <BookOpen className="h-4 w-4" />
                              <span>Book Now</span>
                            </button>
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm">
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            </div>
          )}

          {/* Booking Modal */}
          {showBookingForm && selectedWarehouse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Book Warehouse Space</h2>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">{selectedWarehouse.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Location:</strong> {selectedWarehouse.location}</div>
                    <div><strong>Available Space:</strong> {selectedWarehouse.availableSpace} sq ft</div>
                    <div><strong>Price:</strong> ₹{selectedWarehouse.pricePerDay}/day</div>
                  </div>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Space Required (sq ft)
                    </label>
                    <input
                      type="number"
                      name="spaceRequired"
                      value={bookingForm.spaceRequired}
                      onChange={handleBookingFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter space required"
                      min="1"
                      max={selectedWarehouse.availableSpace}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={bookingForm.duration}
                      onChange={handleBookingFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter duration"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={bookingForm.startDate}
                      onChange={handleBookingFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package Type
                    </label>
                    <select
                      name="packageType"
                      value={bookingForm.packageType}
                      onChange={handleBookingFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select package type</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Food Items">Food Items</option>
                      <option value="Documents">Documents</option>
                      <option value="Fragile Items">Fragile Items</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-green-400 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-green-500 transition-all duration-200"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl p-6 sm:p-8 text-white"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">
              Why Choose Our Micro-Warehouse Network?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Same-Day Delivery</h3>
                <p className="text-blue-100 text-xs sm:text-sm">
                  Strategic locations enable faster last-mile delivery
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Secure Storage</h3>
                <p className="text-blue-100 text-xs sm:text-sm">
                  24/7 security, CCTV monitoring, and insurance coverage
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Thermometer className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Climate Control</h3>
                <p className="text-blue-100 text-xs sm:text-sm">
                  Temperature and humidity controlled environments
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Cost Effective</h3>
                <p className="text-blue-100 text-xs sm:text-sm">
                  Pay only for the space and time you need
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Glassmorphism Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 text-center"
          >
            <div className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-3 shadow-lg">
              <p className="text-gray-600 text-xs sm:text-sm font-medium">
                Strategic Storage • Same-Day Delivery • Climate Controlled • 24/7 Security • Easy Booking
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default MicroWarehouse;