import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  Users, 
  MapPin, 
  Clock,
  ArrowRight,
  DollarSign,
  Loader2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  IndianRupee
} from 'lucide-react';
import { apiService } from '../services/api';
import { AlertContext } from '../App';

interface DashboardProps {
  user: { name: string; email: string } | null;
}

interface Delivery {
  _id: string;
  deliveryId: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  pickup: {
    address: string;
  };
  delivery: {
    address: string;
  };
  status: {
    current: string;
  };
  pricing: {
    totalCost: number;
    currency: string;
  };
  createdAt: string;
  schedule: {
    deliveryDate: string;
    preferredTimeSlot?: string;
  };
  package: {
    type: string;
    weight: number;
  };
}

interface DashboardStats {
  totalDeliveries: number;
  activeDeliveries: number;
  completedDeliveries: number;
  totalRevenue: number;
  averageDeliveryTime: number;
  carbonFootprint: number;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>([]);
  const [showAllDeliveries, setShowAllDeliveries] = useState(false);
  const [currentShipment, setCurrentShipment] = useState<Delivery | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalDeliveries: 0,
    activeDeliveries: 0,
    completedDeliveries: 0,
    totalRevenue: 0,
    averageDeliveryTime: 0,
    carbonFootprint: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { addAlert } = useContext(AlertContext);
  const [showShipmentSearch, setShowShipmentSearch] = useState(false);
  const [shipmentIdInput, setShipmentIdInput] = useState('');
  const [shipmentResult, setShipmentResult] = useState<any | null>(null);
  const [isSearchingShipment, setIsSearchingShipment] = useState(false);
  const [shipmentError, setShipmentError] = useState<string | null>(null);
  const [isRefreshingDeliveries, setIsRefreshingDeliveries] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shipmentResultTimer, setShipmentResultTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  // Function to calculate delivery status based on time progression
  const calculateDeliveryStatus = (delivery: Delivery): string => {
    const now = new Date();
    const deliveryDate = new Date(delivery.schedule.deliveryDate);
    
    // If delivery is already completed or cancelled, return current status
    if (['Delivered', 'Failed', 'Cancelled'].includes(delivery.status.current)) {
      return delivery.status.current;
    }

    // Get delivery time slot (e.g., "15-18" means 3-6 PM)
    const timeSlot = delivery.schedule.preferredTimeSlot || '15-18';
    const [startHour, endHour] = timeSlot.split('-').map(Number);

    // Build start/end times using the scheduled delivery date + preferred time slot
    const startTime = new Date(
      deliveryDate.getFullYear(),
      deliveryDate.getMonth(),
      deliveryDate.getDate(),
      startHour,
      0,
      0
    );
    const endTime = new Date(
      deliveryDate.getFullYear(),
      deliveryDate.getMonth(),
      deliveryDate.getDate(),
      endHour,
      0,
      0
    );

    if (now < startTime) {
      return 'Scheduled';
    }
    if (now <= endTime) {
      return 'In Transit';
    }
    return 'Delivered';
  };

  // Function to update delivery statuses based on time
  const updateDeliveryStatuses = (deliveries: Delivery[]): Delivery[] => {
    return deliveries.map(delivery => {
      const newStatus = calculateDeliveryStatus(delivery);
      if (newStatus !== delivery.status.current) {
        return {
          ...delivery,
          status: {
            ...delivery.status,
            current: newStatus
          }
        };
      }
      return delivery;
    });
  };

  // Function to calculate real-time dashboard stats
  const calculateDashboardStats = (deliveries: Delivery[]): DashboardStats => {
    const totalDeliveries = deliveries.length;
    const completedDeliveries = deliveries.filter(d => getSimpleStatus(d) === 'Delivered').length;
    const activeDeliveries = deliveries.filter(d => 
      ['Scheduled', 'Picked Up', 'In Transit', 'Out for Delivery'].includes(getSimpleStatus(d))
    ).length;
    
    // Calculate total revenue from completed deliveries
    const totalRevenue = deliveries
      .filter(d => getSimpleStatus(d) === 'Delivered')
      .reduce((sum, delivery) => sum + delivery.pricing.totalCost, 0);

    return {
      totalDeliveries,
      activeDeliveries,
      completedDeliveries,
      totalRevenue,
      averageDeliveryTime: 0, // Will be calculated if needed
      carbonFootprint: 0 // Will be calculated if needed
    };
  };

  // Load user-specific data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Load user's deliveries
        const deliveries = await apiService.getDeliveries();
        const updatedDeliveries = updateDeliveryStatuses(deliveries);
        setAllDeliveries(updatedDeliveries);
        setRecentDeliveries(updatedDeliveries.slice(0, 4)); // Get latest 4
        
        // Set current shipment (most recent active delivery)
        const activeDelivery = updatedDeliveries.find(d => 
          ['Scheduled', 'Picked Up', 'In Transit', 'Out for Delivery'].includes(d.status.current)
        );
        setCurrentShipment(activeDelivery || null);
        
        // Calculate real-time dashboard statistics
        const stats = calculateDashboardStats(updatedDeliveries);
        setDashboardStats(stats);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Update current time every second
  useEffect(() => {
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timeTimer);
  }, []);

  // Update delivery statuses every minute
  useEffect(() => {
    const statusTimer = setInterval(() => {
      // Update delivery statuses based on current time
      setAllDeliveries(prevDeliveries => {
        const updatedDeliveries = updateDeliveryStatuses(prevDeliveries);
        setRecentDeliveries(updatedDeliveries.slice(0, 4));
        
        // Update current shipment
        const activeDelivery = updatedDeliveries.find(d => 
          ['Scheduled', 'Picked Up', 'In Transit', 'Out for Delivery'].includes(d.status.current)
        );
        setCurrentShipment(activeDelivery || null);
        
        // Update dashboard stats
        const stats = calculateDashboardStats(updatedDeliveries);
        setDashboardStats(stats);
        
        return updatedDeliveries;
      });

      // Update shipment result status if exists
      if (shipmentResult) {
        const realTimeStatus = calculateDeliveryStatus(shipmentResult);
        if (realTimeStatus !== shipmentResult.status.current) {
          setShipmentResult((prev: any) => prev ? {
            ...prev,
            status: {
              ...prev.status,
              current: realTimeStatus
            }
          } : null);
        }
      }
    }, 60000); // Update every minute

    return () => clearInterval(statusTimer);
  }, [shipmentResult]);

  const refreshDeliveries = async () => {
    try {
      setIsRefreshingDeliveries(true);
      const deliveries = await apiService.getDeliveries();
      const updatedDeliveries = updateDeliveryStatuses(deliveries);
      setAllDeliveries(updatedDeliveries);
      setRecentDeliveries(updatedDeliveries.slice(0, 4));
      
      // Set current shipment (most recent active delivery)
      const activeDelivery = updatedDeliveries.find(d => 
        ['Scheduled', 'Picked Up', 'In Transit', 'Out for Delivery'].includes(d.status.current)
      );
      setCurrentShipment(activeDelivery || null);
    } catch (error) {
      console.error('Error refreshing deliveries:', error);
    } finally {
      setIsRefreshingDeliveries(false);
    }
  };

  // Compute total payments from all created deliveries
  const totalPayments = allDeliveries.reduce((sum, d) => sum + (d?.pricing?.totalCost || 0), 0);

  const stats = [
    {
      icon: Package,
      title: 'Total Deliveries',
      value: dashboardStats.totalDeliveries.toString(),
      change: '',
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-blue-50',
      borderColor: 'border-indigo-100',
    },
    {
      icon: Clock,
      title: 'Active Delivery',
      value: dashboardStats.activeDeliveries.toString(),
      change: '',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
      borderColor: 'border-amber-100',
    },
    {
      icon: CheckCircle,
      title: 'Completed',
      value: dashboardStats.completedDeliveries.toString(),
      change: '',
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50',
      borderColor: 'border-emerald-100',
    },
    {
      icon: IndianRupee,
      title: 'Total Payments',
      value: `₹${totalPayments.toLocaleString()}`,
      change: '',
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-violet-50 to-purple-50',
      borderColor: 'border-violet-100',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Scheduled':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Picked Up':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Out for Delivery':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'Failed':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 20;
      case 'Picked Up':
        return 40;
      case 'In Transit':
        return 60;
      case 'Out for Delivery':
        return 80;
      case 'Delivered':
        return 100;
      default:
        return 0;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="h-3 w-3" />;
      case 'In Transit':
        return <Truck className="h-3 w-3" />;
      case 'Scheduled':
        return <Clock className="h-3 w-3" />;
      case 'Picked Up':
        return <Package className="h-3 w-3" />;
      case 'Out for Delivery':
        return <MapPin className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const formatDeliveryTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const formatCreatedTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getDeliveryTimeInfo = (delivery: Delivery) => {
    const now = new Date();
    const deliveryDate = new Date(delivery.schedule.deliveryDate);
    
    if (delivery.status.current === 'Scheduled') {
      const timeUntilDelivery = deliveryDate.getTime() - now.getTime();
      if (timeUntilDelivery > 0) {
        const hours = Math.floor(timeUntilDelivery / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntilDelivery % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) {
          return `${hours}h ${minutes}m until delivery`;
        } else {
          return `${minutes}m until delivery`;
        }
      }
    } else if (delivery.status.current === 'Out for Delivery') {
      const timeSinceDelivery = now.getTime() - deliveryDate.getTime();
      const minutes = Math.floor(timeSinceDelivery / (1000 * 60));
      return `Out for delivery ${minutes}m ago`;
    } else if (delivery.status.current === 'Delivered') {
      const timeSinceDelivery = now.getTime() - deliveryDate.getTime();
      const hours = Math.floor(timeSinceDelivery / (1000 * 60 * 60));
      const minutes = Math.floor((timeSinceDelivery % (1000 * 60 * 60)) / (1000 * 60));
      if (hours > 0) {
        return `Delivered ${hours}h ${minutes}m ago`;
      } else {
        return `Delivered ${minutes}m ago`;
      }
    }
    
    return formatDeliveryTime(delivery.createdAt);
  };

  // Use the existing calculateDeliveryStatus function instead of duplicating logic
  const getSimpleStatus = (delivery: Delivery) => {
    return calculateDeliveryStatus(delivery);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Welcome Section with Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 lg:mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="text-center lg:text-left mb-4 lg:mb-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 font-poppins">
                  Welcome back, {user?.name || 'User'}! 👋
                </h1>
                <p className="text-gray-600">
                  Here's what's happening with your logistics today.
                </p>
              </div>
              
              {/* Time and Date Display */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-4 lg:p-6 text-center lg:text-right border border-gray-100"
              >
                <div className="flex flex-col space-y-1">
                  <div className="text-2xl lg:text-3xl font-bold text-gray-800 font-mono">
                    {currentTime.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}
                  </div>
                  <div className="text-sm lg:text-base text-gray-600">
                    {currentTime.toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentTime.toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
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
                  className={`${stat.bgColor} ${stat.borderColor} border rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm`}
                >
                                      <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl shadow-lg`}>
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
                  {stat.title === 'Total Payments' && (
                    <div className="mt-3">
                      <button
                        onClick={async () => {
                          try {
                            setIsPaying(true);
                            // Simulate payment processing delay
                            await new Promise(res => setTimeout(res, 1500));
                            addAlert({
                              type: 'success',
                              title: 'Payment Successful',
                              message: `Processed payments for ${allDeliveries.length} deliveries.`,
                              time: new Date().toISOString(),
                              status: 'completed',
                              priority: 'low',
                              shipmentId: '-',
                              route: '-',
                              read: false,
                            });
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setIsPaying(false);
                          }
                        }}
                        disabled={isPaying || allDeliveries.length === 0}
                        className="w-full mt-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold text-xs lg:text-sm py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPaying ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <IndianRupee className="h-4 w-4" />
                            <span>Pay Now</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
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
              className="lg:col-span-2 bg-gradient-to-br from-white to-blue-50 rounded-xl lg:rounded-2xl shadow-xl p-4 lg:p-6 border border-blue-100"
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
              <div className="h-48 lg:h-64 bg-gradient-to-br from-blue-100 via-indigo-50 to-green-100 rounded-xl flex items-center justify-center relative overflow-hidden border border-blue-200">
                <div className="text-center z-10">
                  <MapPin className="h-8 w-8 lg:h-12 lg:w-12 text-blue-500 mx-auto mb-2 lg:mb-4" />
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-2">
                    Live Tracking Map
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                    {currentShipment ? 'Real-time tracking will be available here' : 'No active shipments to track'}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 lg:mt-4 flex items-center justify-between text-xs lg:text-sm">
                <div className="text-gray-600">
                  Current Shipment: <span className="font-medium">{currentShipment?.deliveryId || 'None'}</span>
                </div>
                <div className="text-gray-600">
                  ETA: <span className="font-medium text-green-600">{currentShipment ? 'Calculating...' : 'N/A'}</span>
                </div>
              </div>
              
              {currentShipment && (
                <div className="mt-3 lg:mt-4 space-y-2 text-xs lg:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route:</span>
                    <span className="font-medium">{currentShipment.pickup.address} → {currentShipment.delivery.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      currentShipment.status.current === 'Scheduled' ? 'text-blue-600' :
                      currentShipment.status.current === 'In Transit' ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {currentShipment.status.current}
                    </span>
                  </div>
                  {currentShipment.package.type && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Package:</span>
                      <span className="font-medium">{currentShipment.package.type}</span>
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
                      className="w-full bg-gradient-to-br from-white to-gray-50 rounded-lg lg:rounded-xl p-3 lg:p-4 shadow-lg hover:shadow-xl transition-all duration-300 text-left group cursor-pointer border border-gray-100"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`bg-gradient-to-r ${action.color} p-3 rounded-xl shadow-lg`}>
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

              {/* Track by Shipment ID */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-br from-white to-gray-50 rounded-lg lg:rounded-xl p-3 lg:p-4 shadow-lg transition-all duration-300 text-left border border-gray-100"
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-2 sm:p-3 rounded-xl shadow-lg flex-shrink-0">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800">
                      Track by Shipment ID
                    </h3>
                    <p className="text-gray-600 text-xs">Enter your shipment ID to track delivery details</p>
                  </div>
                  <button
                    onClick={() => setShowShipmentSearch(!showShipmentSearch)}
                    className="text-blue-600 text-xs sm:text-sm font-medium flex-shrink-0"
                  >
                    {showShipmentSearch ? 'Hide' : 'Open'}
                  </button>
                </div>

                {showShipmentSearch && (
                  <div className="mt-3 space-y-3">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <input
                        value={shipmentIdInput}
                        onChange={(e) => {
                          setShipmentIdInput(e.target.value);
                          setShipmentError(null);
                          setShipmentResult(null);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const button = e.currentTarget.nextElementSibling as HTMLButtonElement;
                            if (button) button.click();
                          }
                        }}
                        placeholder="#DEL123456"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={async () => {
                            if (!shipmentIdInput.trim()) {
                              setShipmentError('Please enter a shipment ID');
                              return;
                            }
                            
                            setIsSearchingShipment(true);
                            setShipmentError(null);
                            setShipmentResult(null);
                            
                            try {
                              const res = await apiService.getDeliveryByDeliveryId(shipmentIdInput.trim());
                              if (res && res.deliveryId) {
                                // Calculate real-time status for the found shipment
                                const realTimeStatus = calculateDeliveryStatus(res);
                                const updatedResult = {
                                  ...res,
                                  status: {
                                    ...res.status,
                                    current: realTimeStatus
                                  }
                                };
                                setShipmentResult(updatedResult);
                                setShipmentError(null);
                              } else {
                                setShipmentError('Shipment not found');
                                setShipmentResult(null);
                              }
                            } catch (e: any) {
                              console.error('Shipment search error:', e);
                              setShipmentError(e.message || 'Shipment not found');
                              setShipmentResult(null);
                            } finally {
                              setIsSearchingShipment(false);
                            }
                          }}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isSearchingShipment}
                        >
                          {isSearchingShipment ? (
                            <>
                              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin inline mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Searching...</span>
                              <span className="sm:hidden">Search</span>
                            </>
                          ) : (
                            'Search'
                          )}
                        </button>
                        {(shipmentResult || shipmentError) && (
                          <button
                            onClick={() => {
                              setShipmentIdInput('');
                              setShipmentResult(null);
                              setShipmentError(null);
                            }}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-300 transition-colors flex-shrink-0"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {!shipmentResult && !shipmentError && (
                      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                        💡 <strong>Tip:</strong> Enter your shipment ID to track delivery status
                      </div>
                    )}

                    {shipmentResult && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 text-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2" />
                            <h4 className="font-semibold text-green-800 text-sm sm:text-base">Shipment Found!</h4>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Live Status</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                          <div>
                            <span className="font-medium text-gray-800 text-xs sm:text-sm">Shipment ID:</span>
                            <div className="text-xs sm:text-sm break-all">{shipmentResult.deliveryId}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-800 text-xs sm:text-sm">Status:</span>
                            <div className="text-xs sm:text-sm">
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(getSimpleStatus(shipmentResult))}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getSimpleStatus(shipmentResult))}`}>
                                  {getSimpleStatus(shipmentResult)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="font-medium text-gray-800 text-xs sm:text-sm">Route:</span>
                            <div className="text-xs sm:text-sm">
                              <div className="flex items-start space-x-2">
                                <MapPin className="h-3 w-3 text-blue-500 flex-shrink-0 mt-0.5" />
                                <span className="break-words">{shipmentResult.pickup?.address}</span>
                              </div>
                              <div className="flex items-center justify-center my-1">
                                <ArrowRight className="h-3 w-3 text-gray-400" />
                              </div>
                              <div className="flex items-start space-x-2">
                                <MapPin className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="break-words">{shipmentResult.delivery?.address}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-800 text-xs sm:text-sm">Package:</span>
                            <div className="text-xs sm:text-sm">{shipmentResult.package?.type} ({shipmentResult.package?.weight}kg)</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-800 text-xs sm:text-sm">Cost:</span>
                            <div className="text-xs sm:text-sm">₹{shipmentResult.pricing?.totalCost?.toLocaleString()}</div>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="font-medium text-gray-800 text-xs sm:text-sm">Schedule:</span>
                            <div className="text-xs sm:text-sm space-y-1">
                              <div>
                                <span className="text-gray-600">Pickup:</span> {new Date(shipmentResult.schedule?.pickupDate).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })} at {shipmentResult.schedule?.preferredTimeSlot}
                              </div>
                              <div>
                                <span className="text-gray-600">Delivery:</span> {new Date(shipmentResult.schedule?.deliveryDate).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })} at {shipmentResult.schedule?.preferredTimeSlot}
                              </div>
                            </div>
                          </div>
                          {shipmentResult.customer && (
                            <div className="sm:col-span-2">
                              <span className="font-medium text-gray-800 text-xs sm:text-sm">Customer:</span>
                              <div className="text-xs sm:text-sm">{shipmentResult.customer.name}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {shipmentError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2" />
                          <span className="text-red-800 font-medium text-xs sm:text-sm">{shipmentError}</span>
                        </div>
                        <p className="text-red-600 text-xs mt-2">
                          Please check the shipment ID and try again.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Recent Deliveries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl lg:rounded-2xl shadow-xl p-4 lg:p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">
                Recent Deliveries
              </h2>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={refreshDeliveries}
                  disabled={isRefreshingDeliveries}
                  className="text-blue-600 hover:text-blue-700 font-medium text-xs lg:text-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRefreshingDeliveries ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3" />
                      <span>Refresh</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setShowAllDeliveries(!showAllDeliveries)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-xs lg:text-sm flex items-center space-x-1"
                >
                  <span>{showAllDeliveries ? 'Show Less' : 'View All'}</span>
                  <ArrowRight className={`h-3 w-3 transition-transform ${showAllDeliveries ? 'rotate-90' : ''}`} />
                </button>
              </div>
            </div>

            {/* Mobile View - Card Layout */}
            <div className="block sm:hidden space-y-4">
              {recentDeliveries.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No deliveries yet. Start by adding your first delivery!
                </div>
              ) : (
                (showAllDeliveries ? allDeliveries : recentDeliveries).map((delivery, index) => (
                  <motion.div
                    key={delivery._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className="bg-blue-100 p-1.5 rounded flex-shrink-0">
                            <Package className="h-4 w-4 text-blue-600" />
                          </div>
                                                      <button
                              onClick={() => {
                                navigator.clipboard.writeText(delivery.deliveryId);
                              }}
                              className="font-mono font-semibold text-blue-600 text-sm truncate hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                              title="Click to copy shipment ID"
                            >
                            {delivery.deliveryId}
                          </button>
                        </div>
                      <div className="flex flex-col items-end space-y-1 ml-2 flex-shrink-0">
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(getSimpleStatus(delivery))}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(getSimpleStatus(delivery))}`}>
                            {getSimpleStatus(delivery)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {formatCreatedTime(delivery.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 text-sm font-medium">Route</span>
                      </div>
                      <div className="text-gray-700 text-sm">
                        <div className="flex items-start space-x-1 mb-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>
                          <span className="break-words leading-relaxed">{delivery.pickup.address}</span>
                        </div>
                        <div className="flex items-center justify-center my-1">
                          <div className="w-px h-4 bg-gray-300"></div>
                        </div>
                        <div className="flex items-start space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5"></div>
                          <span className="break-words leading-relaxed">{delivery.delivery.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Package */}
                    <div className="flex items-center space-x-2 mb-3">
                      <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">
                        {delivery.package.type} ({delivery.package.weight}kg)
                      </span>
                    </div>

                    {/* Cost removed as requested */}
                  </motion.div>
                ))
              )}
            </div>

            {/* Desktop View - Table Layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 lg:py-3 text-gray-600 font-medium text-xs lg:text-sm">Shipment ID</th>
                    <th className="text-left py-2 lg:py-3 text-gray-600 font-medium text-xs lg:text-sm">Route</th>
                    <th className="text-left py-2 lg:py-3 text-gray-600 font-medium text-xs lg:text-sm">Package</th>
                    <th className="text-left py-2 lg:py-3 text-gray-600 font-medium text-xs lg:text-sm">Status</th>
                    <th className="text-left py-2 lg:py-3 text-gray-600 font-medium text-xs lg:text-sm">Created Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeliveries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No deliveries yet. Start by adding your first delivery!
                      </td>
                    </tr>
                  ) : (
                    (showAllDeliveries ? allDeliveries : recentDeliveries).map((delivery, index) => (
                      <motion.tr
                        key={delivery._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 lg:py-4">
                          <div className="flex items-center space-x-2">
                            <div className="bg-blue-100 p-1 rounded">
                              <Package className="h-3 w-3 text-blue-600" />
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(delivery.deliveryId);
                              }}
                              className="font-mono font-semibold text-blue-600 text-xs lg:text-sm hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                              title="Click to copy shipment ID"
                            >
                              {delivery.deliveryId}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 lg:py-4 text-gray-600 text-xs">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                              {delivery.pickup.address.substring(0, 20)}... → {delivery.delivery.address.substring(0, 20)}...
                            </span>
                          </div>
                        </td>
                        <td className="py-3 lg:py-4 text-gray-600 text-xs">
                          <div className="flex items-center space-x-1">
                            <Package className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span>{delivery.package.type} ({delivery.package.weight}kg)</span>
                          </div>
                        </td>
                        <td className="py-3 lg:py-4">
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(getSimpleStatus(delivery))}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getSimpleStatus(delivery))}`}>
                              {getSimpleStatus(delivery)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 lg:py-4 text-gray-600 text-xs lg:text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span>{formatCreatedTime(delivery.createdAt)}</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
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
                Powered by AI • Built for Delhi's MSMEs • Smart Logistics Solutions
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;