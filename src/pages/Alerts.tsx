import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Truck, 
  Package,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Archive,
  Trash2,
  ExternalLink,
  X
} from 'lucide-react';
import { AlertContext } from '../App';

const Alerts = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);
  const [showAlertDetail, setShowAlertDetail] = useState<number | null>(null);
  
  const { alerts, markAsRead, archiveAlert, deleteAlert } = useContext(AlertContext);

  // Persist alerts locally so they survive refresh
  useEffect(() => {
    try {
      localStorage.setItem('alerts', JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  const filters = [
    { id: 'all', label: 'All Alerts', count: alerts.length },
    { id: 'unread', label: 'Unread', count: alerts.filter(a => !a.read).length },
    { id: 'high', label: 'High Priority', count: alerts.filter(a => a.priority === 'high').length },
    { id: 'active', label: 'Active', count: alerts.filter(a => a.status === 'active').length },
    { id: 'completed', label: 'Completed', count: alerts.filter(a => a.status === 'completed').length },
  ];

  const filteredAlerts = alerts.filter(alert => {
    let matchesFilter = true;
    
    if (selectedFilter === 'unread') matchesFilter = !alert.read;
    else if (selectedFilter === 'high') matchesFilter = alert.priority === 'high';
    else if (selectedFilter === 'active') matchesFilter = alert.status === 'active';
    else if (selectedFilter === 'completed') matchesFilter = alert.status === 'completed';

    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (alert.shipmentId || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleAlertClick = (alertId: number) => {
    // Mark as read when clicked
    if (!alerts.find(a => a.id === alertId)?.read) {
      markAsRead(alertId);
    }
    
    // Ensure only one open at a time
    setShowAlertDetail(prev => (prev === alertId ? null : alertId));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'delay':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertBgColor = (type: string, read: boolean) => {
    const opacity = read ? '50' : '100';
    switch (type) {
      case 'delay':
        return `bg-red-${opacity}`;
      case 'success':
        return `bg-green-${opacity}`;
      case 'warning':
        return `bg-yellow-${opacity}`;
      case 'info':
        return `bg-blue-${opacity}`;
      default:
        return `bg-gray-${opacity}`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              Alerts & Notifications
            </h1>
            <p className="text-gray-600">
              Stay updated on your deliveries, route optimizations, and system notifications
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
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

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 cursor-pointer ${
                  !alert.read ? 'border-l-4 border-blue-500' : ''
                } ${showAlertDetail === alert.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleAlertClick(alert.id)}
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  {/* Alert Icon */}
                  <div className={`p-2 rounded-full flex-shrink-0 ${getAlertBgColor(alert.type, alert.read)}`}>
                    {getAlertIcon(alert.type)}
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <h3 className={`text-base sm:text-lg font-semibold truncate ${
                          alert.read ? 'text-gray-600' : 'text-gray-800'
                        }`}>
                          {alert.title}
                        </h3>
                        {!alert.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                          {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                          {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                        </span>
                        <div className="relative">
                          <button 
                            className="p-1 hover:bg-gray-100 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAlert(selectedAlert === alert.id ? null : alert.id);
                            }}
                          >
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {selectedAlert === alert.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAlertClick(alert.id);
                                  setSelectedAlert(null);
                                }}
                                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200 w-full text-left text-sm"
                              >
                                <Eye className="h-4 w-4" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  archiveAlert(alert.id);
                                  setSelectedAlert(null);
                                }}
                                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200 w-full text-left text-sm"
                              >
                                <Archive className="h-4 w-4" />
                                <span>Archive</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteAlert(alert.id);
                                  setSelectedAlert(null);
                                }}
                                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left text-sm"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className={`mb-3 text-sm sm:text-base ${
                      alert.read ? 'text-gray-500' : 'text-gray-700'
                    }`}>
                      {alert.message}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                        {!!alert.shipmentId && (
                          <div className="flex items-center space-x-1">
                            <Package className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{alert.shipmentId}</span>
                          </div>
                        )}
                        {!!alert.route && (
                          <div className="flex items-center space-x-1">
                            <Truck className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{alert.route}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span>{alert.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Alert Details */}
                    {showAlertDetail === alert.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">Alert Details</h4>
                              <div className="space-y-1 text-gray-600">
                                <div><strong>Type:</strong> {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</div>
                                <div><strong>Priority:</strong> {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}</div>
                                <div><strong>Status:</strong> {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}</div>
                                <div><strong>Time:</strong> {alert.time}</div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">Delivery Info</h4>
                              <div className="space-y-1 text-gray-600">
                                {!!alert.shipmentId && (<div><strong>Shipment ID:</strong> {alert.shipmentId}</div>)}
                                {!!alert.route && (<div><strong>Route:</strong> {alert.route}</div>)}
                                <div><strong>Read Status:</strong> {alert.read ? 'Read' : 'Unread'}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                archiveAlert(alert.id);
                                setShowAlertDetail(null);
                              }}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                            >
                              Archive
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAlert(alert.id);
                                setShowAlertDetail(null);
                              }}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAlerts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No alerts found
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

          {/* Alert Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl p-6 sm:p-8 text-white"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">
              Alert Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-2">
                  {alerts.filter(a => a.status === 'active').length}
                </div>
                <div className="text-blue-100 text-xs sm:text-sm">Active Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-2">
                  {alerts.filter(a => !a.read).length}
                </div>
                <div className="text-blue-100 text-xs sm:text-sm">Unread</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-2">
                  {alerts.filter(a => a.priority === 'high').length}
                </div>
                <div className="text-blue-100 text-xs sm:text-sm">High Priority</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-2">
                  {alerts.filter(a => a.status === 'completed').length}
                </div>
                <div className="text-blue-100 text-xs sm:text-sm">Resolved</div>
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
                Real-time Alerts • Smart Notifications • Delivery Updates • Performance Insights • Auto-Read Messages
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Alerts;