import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  Truck, 
  Users, 
  TrendingUp, 
  Leaf, 
  MapPin, 
  Clock,
  ArrowRight,
  DollarSign
} from 'lucide-react';

interface DashboardProps {
  user: { name: string; email: string } | null;
}

interface Delivery {
  id: string;
  from: string;
  to: string;
  status: string;
  time: string;
  cost: string;
  date?: string;
  packageType?: string;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([
    {
      id: '#DEL001',
      from: 'Karol Bagh',
      to: 'Gurgaon',
      status: 'Delivered',
      time: '2 hours ago',
      cost: '₹450',
    },
    {
      id: '#DEL002',
      from: 'Lajpat Nagar',
      to: 'Noida',
      status: 'In Transit',
      time: '4 hours ago',
      cost: '₹320',
    },
    {
      id: '#DEL003',
      from: 'Chandni Chowk',
      to: 'Faridabad',
      status: 'Picked Up',
      time: '1 day ago',
      cost: '₹280',
    },
  ]);

  const [currentShipment, setCurrentShipment] = useState<Delivery | null>({
    id: '#DEL002',
    from: 'Lajpat Nagar',
    to: 'Noida',
    status: 'In Transit',
    time: '4 hours ago',
    cost: '₹320',
  });

  // Check for new delivery from localStorage
  useEffect(() => {
    const newDelivery = localStorage.getItem('newDelivery');
    if (newDelivery) {
      const delivery = JSON.parse(newDelivery);
      
      // Add to recent deliveries
      setRecentDeliveries(prev => [delivery, ...prev.slice(0, 2)]);
      
      // Set as current shipment if it's the most recent
      setCurrentShipment(delivery);
      
      // Clear from localStorage
      localStorage.removeItem('newDelivery');
    }
  }, []);

  const stats = [
    {
      icon: Package,
      title: 'Deliveries Made',
      value: '247',
      change: '+12%',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Leaf,
      title: 'CO₂ Saved',
      value: '1.2 tons',
      change: '+18%',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: DollarSign,
      title: 'Costs Reduced',
      value: '₹45,000',
      change: '+25%',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Clock,
      title: 'Time Saved',
      value: '156 hrs',
      change: '+15%',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const quickActions = [
    {
      icon: Package,
      title: 'Add New Delivery',
      description: 'Schedule a new shipment',
      color: 'from-blue-500 to-blue-600',
      path: '/add-delivery',
    },
    {
      icon: Truck,
      title: 'Find Shared Trucks',
      description: 'Connect with other businesses',
      color: 'from-green-500 to-green-600',
      path: '/shared-trucks',
    },
    {
      icon: Users,
      title: 'Micro-Warehouse',
      description: 'Book storage space',
      color: 'from-purple-500 to-purple-600',
      path: '/micro-warehouse',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 lg:mb-8 text-center"
          >
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 font-poppins">
              Welcome back, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your logistics today.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`${stat.bgColor} rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:shadow-lg transition-shadow duration-300`}
                >
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-lg`}>
                      <Icon className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                    </div>
                    <span className="text-green-600 text-xs lg:text-sm font-medium">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-800 mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600 text-xs lg:text-sm">
                    {stat.title}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Live Map */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2 bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6"
            >
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">
                  Live Shipment Tracking
                </h2>
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  <span className="text-xs lg:text-sm font-medium">Live</span>
                </div>
              </div>
              
              {/* Map Placeholder */}
              <div className="h-48 lg:h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="text-center z-10">
                  <MapPin className="h-8 w-8 lg:h-12 lg:w-12 text-blue-500 mx-auto mb-2 lg:mb-4" />
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-2">
                    Interactive Map
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                    Real-time tracking would be integrated here
                  </p>
                </div>
                
                {/* Animated Truck */}
                <motion.div
                  className="absolute top-1/4 left-1/4"
                  animate={{ 
                    x: [0, 100, 200],
                    y: [0, -20, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                  <div className="bg-blue-500 p-2 rounded-full">
                    <Truck className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                  </div>
                </motion.div>
              </div>
              
              <div className="mt-3 lg:mt-4 flex items-center justify-between text-xs lg:text-sm">
                <div className="text-gray-600">
                  Current Shipment: <span className="font-medium">{currentShipment?.id}</span>
                </div>
                <div className="text-gray-600">
                  ETA: <span className="font-medium text-green-600">25 mins</span>
                </div>
              </div>
              
              {currentShipment && (
                <div className="mt-3 lg:mt-4 space-y-2 text-xs lg:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route:</span>
                    <span className="font-medium">{currentShipment.from} → {currentShipment.to}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      currentShipment.status === 'Scheduled' ? 'text-blue-600' :
                      currentShipment.status === 'In Transit' ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {currentShipment.status}
                    </span>
                  </div>
                  {currentShipment.packageType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Package:</span>
                      <span className="font-medium">{currentShipment.packageType}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-4"
            >
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-4">
                Quick Actions
              </h2>
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    to={action.path}
                    key={index}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-white rounded-lg lg:rounded-xl p-3 lg:p-4 shadow-lg hover:shadow-xl transition-all duration-300 text-left group cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`bg-gradient-to-r ${action.color} p-3 rounded-lg`}>
                          <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-gray-600 text-xs">
                            {action.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </motion.div>
          </div>

          {/* Recent Deliveries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6"
          >
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">
                Recent Deliveries
              </h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-xs lg:text-sm">
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 lg:py-3 text-gray-600 font-medium text-xs lg:text-sm">ID</th>
                    <th className="text-left py-2 lg:py-3 text-gray-600 font-medium text-xs lg:text-sm">Route</th>
                    <th className="text-left py-2 lg:py-3 text-gray-600 font-medium text-xs lg:text-sm">Package</th>
                    <th className="text-left py-2 lg:py-3 text-gray-600 font-medium text-xs lg:text-sm">Status</th>
                    <th className="text-left py-2 lg:py-3 text-gray-600 font-medium text-xs lg:text-sm">Time</th>
                    <th className="text-left py-2 lg:py-3 text-gray-600 font-medium text-xs lg:text-sm">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeliveries.map((delivery, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 lg:py-4 font-medium text-gray-800 text-xs lg:text-sm">
                        {delivery.id}
                      </td>
                      <td className="py-3 lg:py-4 text-gray-600 text-xs">
                        {delivery.from} → {delivery.to}
                      </td>
                      <td className="py-3 lg:py-4 text-gray-600 text-xs">
                        {delivery.packageType || 'N/A'}
                      </td>
                      <td className="py-3 lg:py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          delivery.status === 'Delivered' 
                            ? 'bg-green-100 text-green-800' 
                            : delivery.status === 'In Transit'
                            ? 'bg-blue-100 text-blue-800'
                            : delivery.status === 'Scheduled'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {delivery.status}
                        </span>
                      </td>
                      <td className="py-3 lg:py-4 text-gray-600 text-xs lg:text-sm">
                        {delivery.time}
                      </td>
                      <td className="py-3 lg:py-4 font-medium text-gray-800 text-xs lg:text-sm">
                        {delivery.cost}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
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
                Powered by AI • Built for Delhi's MSMEs • Trusted by 500+ Businesses
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;