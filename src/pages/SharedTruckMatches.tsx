import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Star,
  Filter,
  Search,
  TrendingDown,
  CheckCircle
} from 'lucide-react';

const SharedTruckMatches = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const truckMatches = [
    {
      id: 1,
      company: 'Delhi Electronics Co.',
      route: 'Karol Bagh → Gurgaon',
      departure: '2 hours',
      capacity: '75% filled',
      savings: '35%',
      cost: '₹285',
      originalCost: '₹450',
      rating: 4.8,
      deliveries: 127,
      truckType: 'Medium',
      estimatedTime: '45 mins',
      compatible: true,
    },
    {
      id: 2,
      company: 'Fashion Hub Delhi',
      route: 'Lajpat Nagar → Noida',
      departure: '4 hours',
      capacity: '60% filled',
      savings: '28%',
      cost: '₹320',
      originalCost: '₹445',
      rating: 4.6,
      deliveries: 89,
      truckType: 'Large',
      estimatedTime: '55 mins',
      compatible: true,
    },
    {
      id: 3,
      company: 'Quick Logistics',
      route: 'Chandni Chowk → Faridabad',
      departure: '6 hours',
      capacity: '45% filled',
      savings: '22%',
      cost: '₹245',
      originalCost: '₹315',
      rating: 4.9,
      deliveries: 203,
      truckType: 'Small',
      estimatedTime: '35 mins',
      compatible: false,
    },
    {
      id: 4,
      company: 'Metro Goods Transport',
      route: 'Connaught Place → Ghaziabad',
      departure: '8 hours',
      capacity: '80% filled',
      savings: '42%',
      cost: '₹195',
      originalCost: '₹335',
      rating: 4.7,
      deliveries: 156,
      truckType: 'Medium',
      estimatedTime: '50 mins',
      compatible: true,
    },
  ];

  const filters = [
    { id: 'all', label: 'All Matches', count: truckMatches.length },
    { id: 'compatible', label: 'Compatible', count: truckMatches.filter(t => t.compatible).length },
    { id: 'high-savings', label: 'High Savings', count: truckMatches.filter(t => parseInt(t.savings) > 30).length },
    { id: 'departing-soon', label: 'Departing Soon', count: truckMatches.filter(t => parseInt(t.departure) <= 4).length },
  ];

  const filteredMatches = truckMatches.filter(match => {
    if (selectedFilter === 'compatible') return match.compatible;
    if (selectedFilter === 'high-savings') return parseInt(match.savings) > 30;
    if (selectedFilter === 'departing-soon') return parseInt(match.departure) <= 4;
    return true;
  }).filter(match => 
    match.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              Shared Truck Matches
            </h1>
            <p className="text-gray-600">
              Find compatible businesses to share transportation costs and reduce environmental impact
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by company or route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedFilter === filter.id
                      ? 'bg-gradient-to-r from-blue-500 to-green-400 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>

          {/* Matches Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ${
                  match.compatible ? 'border-l-4 border-green-500' : 'border-l-4 border-gray-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-green-400 p-3 rounded-lg">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {match.company}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{match.rating}</span>
                        <span>•</span>
                        <span>{match.deliveries} deliveries</span>
                      </div>
                    </div>
                  </div>
                  {match.compatible && (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Compatible
                    </div>
                  )}
                </div>

                {/* Route Info */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{match.route}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Departs in {match.departure}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{match.capacity}</span>
                    </div>
                  </div>
                </div>

                {/* Cost Savings */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Your cost:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 line-through text-sm">
                        {match.originalCost}
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        {match.cost}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">You save:</span>
                    </div>
                    <span className="font-bold text-green-600">
                      {match.savings}%
                    </span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">Truck Type:</span>
                    <span className="ml-2">{match.truckType}</span>
                  </div>
                  <div>
                    <span className="font-medium">ETA:</span>
                    <span className="ml-2">{match.estimatedTime}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button className="flex-1 bg-gradient-to-r from-blue-500 to-green-400 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-500 transition-all duration-200">
                    Book Slot
                  </button>
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200">
                    Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredMatches.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No matches found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={() => {
                  setSelectedFilter('all');
                  setSearchTerm('');
                }}
                className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-500 transition-all duration-200"
              >
                Reset Filters
              </button>
            </motion.div>
          )}

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl p-8 text-white"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              Benefits of Shared Logistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">Cost Savings</h3>
                <p className="text-blue-100 text-sm">
                  Save up to 40% on transportation costs by sharing truck space
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">Network Building</h3>
                <p className="text-blue-100 text-sm">
                  Connect with other businesses and build lasting partnerships
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">Eco-Friendly</h3>
                <p className="text-blue-100 text-sm">
                  Reduce carbon footprint by optimizing truck utilization
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
                Shared Logistics • Cost Savings up to 40% • Eco-Friendly Transportation
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SharedTruckMatches;