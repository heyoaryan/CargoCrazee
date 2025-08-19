import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  Navigation,
  Plus,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const SharedTruckMatches = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [showAddTruckForm, setShowAddTruckForm] = useState(false);
  const [searchForm, setSearchForm] = useState({
    pickupLocation: '',
    deliveryLocation: '',
    preferredDate: '',
    packageWeight: '',
    packageVolume: ''
  });
  const [addTruckForm, setAddTruckForm] = useState({
    companyName: '',
    truckType: '',
    capacity: '',
    pickupLocation: '',
    deliveryLocation: '',
    departureDate: '',
    departureTime: '',
    costPerKm: '',
    contactPerson: '',
    contactPhone: '',
    additionalNotes: ''
  });
  const navigate = useNavigate();

  const [truckMatches, setTruckMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate filter counts based on actual data
  const getFilterCounts = () => {
    const total = truckMatches.length;
    const compatible = truckMatches.filter((match: any) => match.compatible).length;
    const highSavings = truckMatches.filter((match: any) => parseInt(match.savings) > 30).length;
    const departingSoon = truckMatches.filter((match: any) => parseInt(match.departure) <= 4).length;
    
    return [
      { id: 'all', label: 'All Matches', count: total },
      { id: 'compatible', label: 'Compatible', count: compatible },
      { id: 'high-savings', label: 'High Savings', count: highSavings },
      { id: 'departing-soon', label: 'Departing Soon', count: departingSoon },
    ];
  };

  const filters = getFilterCounts();

  // Helpers to compute expiry and time left
  const slotStartHour = (slot: string): number => {
    switch (slot) {
      case '9-12': return 9;
      case '12-15': return 12;
      case '15-18': return 15;
      case '18-21': return 18;
      default: return 9;
    }
  };
  const slotEndHour = (slot: string): number => {
    switch (slot) {
      case '9-12': return 12;
      case '12-15': return 15;
      case '15-18': return 18;
      case '18-21': return 21;
      default: return 23; // if unknown, end of day
    }
  };

  const computeWindow = (item: any): { start: Date | null; end: Date | null } => {
    const dateStr = item.deliveryDate || item.departureDate;
    const timeSlot = item.deliveryTime || item.departureTime;
    if (dateStr && timeSlot) {
      const d = new Date(dateStr);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), slotStartHour(timeSlot), 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), slotEndHour(timeSlot), 0, 0);
      return { start, end };
    }
    return { start: null, end: null };
  };

  const computeExpiry = (item: any): Date => {
    // Prefer deliveryDate + deliveryTime (from AddDelivery) or departureDate + departureTime (from Add Truck)
    const dateStr = item.deliveryDate || item.departureDate;
    const timeSlot = item.deliveryTime || item.departureTime;
    if (dateStr && timeSlot) {
      const endHour = slotEndHour(timeSlot);
      const d = new Date(dateStr);
      const expiry = new Date(d.getFullYear(), d.getMonth(), d.getDate(), endHour, 0, 0);
      return expiry;
    }
    // Fallback TTL 24h from addedAt
    const addedAt = item.addedAt ? new Date(item.addedAt) : new Date();
    return new Date(addedAt.getTime() + 24 * 60 * 60 * 1000);
  };

  const humanizeTimeLeft = (expiry: Date): string => {
    const ms = expiry.getTime() - Date.now();
    if (ms <= 0) return '0h';
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours <= 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const buildActiveMatches = (): any[] => {
    const localMatches = JSON.parse(localStorage.getItem('sharedTruckMatches') || '[]');
    const localPool = JSON.parse(localStorage.getItem('truckPool') || '[]');

    // Filter out expired and persist cleaned lists
    const now = new Date();
    const notExpired = (x: any) => computeExpiry(x) > now;
    const cleanedMatches = localMatches.filter(notExpired);
    const cleanedPool = localPool.filter(notExpired);
    if (cleanedMatches.length !== localMatches.length) {
      localStorage.setItem('sharedTruckMatches', JSON.stringify(cleanedMatches));
    }
    if (cleanedPool.length !== localPool.length) {
      localStorage.setItem('truckPool', JSON.stringify(cleanedPool));
    }

    // Deduplicate by deliveryId (or by route+date+slot if no id)
    const uniqueByKey: Record<string, any> = {};
    const sourceAll = [...cleanedMatches, ...cleanedPool];
    for (const obj of sourceAll) {
      const key = obj.deliveryId || `${obj.pickupAddress || obj.pickupLocation}|${obj.deliveryAddress || obj.deliveryLocation}|${obj.deliveryDate || obj.departureDate}|${obj.deliveryTime || obj.departureTime}`;
      if (!uniqueByKey[key]) uniqueByKey[key] = obj;
    }

    // Map to UI objects with time-left
    const mapToCard = (obj: any, fallbackIdPrefix: string) => {
      const { start, end } = computeWindow(obj);
      const now = new Date();
      let statusText = 'Transit in';
      let timeTarget: Date = end || computeExpiry(obj);
      if (start && now < start) {
        statusText = 'Transit in';
        timeTarget = start;
      } else if (start && end && now >= start && now < end) {
        statusText = 'Transit ends in';
        timeTarget = end;
      }
      const expiry = end || computeExpiry(obj);
      return {
        id: obj.deliveryId || `${fallbackIdPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        company: obj.customerName || obj.companyName || 'Local User',
        rating: '4.7',
        deliveries: '1',
        route: `${(obj.pickupAddress || obj.pickupLocation || '').substring(0, 20)}... → ${(obj.deliveryAddress || obj.deliveryLocation || '').substring(0, 20)}...`,
        departure: humanizeTimeLeft(timeTarget),
        statusText,
        capacity: `${obj.weight || obj.capacity || '1'} ${obj.capacity ? 'tons' : 'kg'}`,
        pickupLocation: obj.pickupAddress || obj.pickupLocation,
        deliveryLocation: obj.deliveryAddress || obj.deliveryLocation,
        availableSpace: 0.7,
        currentWeight: parseFloat(obj.weight || '1'),
        maxWeight: 5,
        originalCost: '₹450',
        cost: '₹315',
        savings: '30%',
        compatible: true,
        departureTime: obj.deliveryTime || obj.departureTime || '9-12',
        specialRequirements: obj.poolingPreferences?.specialRequirements || [],
      };
    };

    return Object.values(uniqueByKey).map((o: any) => mapToCard(o, 'pool'));
  };

  const refreshMatches = async () => {
    try {
      setIsRefreshing(true);
      // Small delay for UX feel
      await new Promise(r => setTimeout(r, 600));
      const all = buildActiveMatches();
      setTruckMatches(all);
    } catch (e) {
      console.error('Error refreshing truck matches:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const all = buildActiveMatches();
        setTruckMatches(all);
      } catch (e) {
        console.error('Error loading truck matches:', e);
        setTruckMatches([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSearchFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to search for trucks
    console.log('Searching for trucks with:', searchForm);
    setShowSearchForm(false);
  };

  const handleAddTruckFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddTruckForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTruckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to add truck to pool
    console.log('Adding truck to pool:', addTruckForm);
    setShowAddTruckForm(false);
    // Reset form
    setAddTruckForm({
      companyName: '',
      truckType: '',
      capacity: '',
      pickupLocation: '',
      deliveryLocation: '',
      departureDate: '',
      departureTime: '',
      costPerKm: '',
      contactPerson: '',
      contactPhone: '',
      additionalNotes: ''
    });
  };

  const filteredMatches = truckMatches.filter(match => {
    if (selectedFilter === 'compatible') return match.compatible;
    if (selectedFilter === 'high-savings') return parseInt(match.savings) > 30;
    if (selectedFilter === 'departing-soon') return parseInt(match.departure) <= 4;
    return true;
  }).filter(match => 
    match.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.deliveryLocation.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 font-poppins">
                  Shared Truck Matches
                </h1>
                <p className="text-gray-600">
                  Find compatible businesses to share transportation costs and reduce environmental impact
                </p>
              </div>
            </div>
            
            {/* Info Message - removed per request */}
          </motion.div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by company, route, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Refresh and Filter Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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

              {/* Refresh Button */}
              <button
                onClick={refreshMatches}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70"
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v2m0 12v2m8-8h-2M6 12H4m12.364-5.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636" />
                    </svg>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh Pool</span>
                  </>
                )}
              </button>
            </div>

            {/* Create Delivery For Shared Truck Pooling Card */}
            <div className="relative overflow-hidden max-w-3xl mx-auto">
              {/* Background with animated gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-blue-500 to-cyan-600 opacity-10 rounded-xl"></div>
              
              {/* Main Card Container */}
              <div className="relative bg-white/95 backdrop-blur-sm border border-emerald-200/50 rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.005]">
                
                {/* Header Section - Compact */}
                <div className="text-center mb-3 sm:mb-4">
                  {/* Icon Container */}
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 via-blue-500 to-cyan-600 rounded-lg shadow-sm mb-2 group-hover:shadow-md transition-all duration-300">
                    <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-1 font-poppins">
                    Smart Truck Pooling
                  </h2>
                  <p className="text-gray-600 text-xs sm:text-sm max-w-lg mx-auto px-2">
                    Create deliveries and automatically find compatible partners to share transportation costs
                  </p>
                </div>

                {/* Main Action Button - Compact */}
                <div className="text-center mb-3 sm:mb-4">
                  <button
                    onClick={() => {
                      localStorage.setItem('deliveryMode', 'smartTruckPooling');
                      navigate('/add-delivery');
                    }}
                    className="group relative inline-flex items-center justify-center w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-blue-500 to-cyan-600 hover:from-emerald-600 hover:via-blue-600 hover:to-cyan-700 text-white font-bold py-2.5 sm:py-3 px-5 sm:px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 border-0 overflow-hidden"
                  >
                    {/* Button Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Button Content */}
                    <div className="relative flex items-center justify-center space-x-2 sm:space-x-3">
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm whitespace-nowrap">
                        Create Delivery For Shared Truck Pooling
                      </span>
                      <Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                    
                    {/* Shine Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </button>
                </div>

                {/* Benefits Grid - Compact Layout for Desktop */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5 sm:gap-3 max-w-2xl mx-auto">
                  {/* Smart Cost Savings Card */}
                  <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 rounded-lg p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-102">
                    <div className="flex items-start space-x-2 sm:space-x-2.5">
                      <div className="flex-shrink-0 bg-gradient-to-r from-emerald-500 to-emerald-600 p-1 sm:p-1.5 rounded-md shadow-sm">
                        <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-xs sm:text-sm mb-1">Smart Cost Savings</h3>
                        <p className="text-gray-700 text-xs leading-relaxed">
                          Match with other deliveries going to the same location and save 
                          <span className="text-emerald-600 font-bold text-xs sm:text-sm"> 30% to 50% </span> 
                          on transportation costs through intelligent truck pooling.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Guaranteed Benefits Card */}
                  <div className="group bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-lg p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-102">
                    <div className="flex items-start space-x-2 sm:space-x-2.5">
                      <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 p-1 sm:p-1.5 rounded-md shadow-sm">
                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-xs sm:text-sm mb-1">Guaranteed Benefits</h3>
                        <p className="text-gray-700 text-xs leading-relaxed">
                          Even without matches, get your truck assigned with delivery requirements and enjoy a 
                          <span className="text-blue-600 font-bold text-xs sm:text-sm"> 10% discount </span> 
                          on total costs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements for Visual Appeal - Smaller */}
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-ping"></div>
                <div className="absolute top-1/2 right-3 w-0.5 h-0.5 bg-cyan-400 rounded-full opacity-50 animate-bounce"></div>
              </div>
            </div>
          </div>

          {/* Matches Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading truck matches...</p>
              </div>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Truck Matches Available</h3>
                <p className="text-gray-600">No compatible shared trucks found at the moment.</p>
              </div>
            </div>
          ) : (
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
                      <span>{match.statusText} {match.departure}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{match.capacity}</span>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>From:</strong> {match.pickupLocation}</div>
                    <div><strong>To:</strong> {match.deliveryLocation}</div>
                    <div><strong>Available Space:</strong> {(match.availableSpace * 100).toFixed(0)}%</div>
                    <div><strong>Weight Capacity:</strong> {match.currentWeight}/{match.maxWeight} kg</div>
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

                {/* Special Requirements */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Special Requirements:</strong>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {match.specialRequirements.map((req, i) => (
                      <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button className="flex-1 bg-gradient-to-r from-blue-500 to-green-400 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-500 transition-all duration-200"
                   onClick={() => {
                     // Prefill Add Delivery form via localStorage including departure and shared flag
                     localStorage.setItem('prefillDelivery', JSON.stringify({
                       pickupAddress: match.pickupLocation,
                       deliveryAddress: match.deliveryLocation,
                       departureTime: match.departureTime, // can be a slot like '9-12'
                       deliveryDate: new Date().toISOString().slice(0,10),
                       isSharedTruckBooking: true,
                     }));
                     navigate('/add-delivery');
                   }}
                  >
                    Book Slot
                  </button>
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200">
                    Details
                  </button>
                </div>
              </motion.div>
            ))}
            </div>
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
                Shared Logistics • Cost Savings up to 40% • Eco-Friendly Transportation • Location-Based Matching
              </p>
            </div>
          </motion.div>

          {/* Add Truck to Pool Modal */}
          {showAddTruckForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Add Your Truck to Pool</h2>
                  <button
                    onClick={() => setShowAddTruckForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleAddTruckSubmit} className="p-6 space-y-6">
                  {/* Company Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={addTruckForm.companyName}
                        onChange={handleAddTruckFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Truck Type *
                      </label>
                      <select
                        name="truckType"
                        value={addTruckForm.truckType}
                        onChange={handleAddTruckFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select truck type</option>
                        <option value="Mini Truck">Mini Truck (1-2 tons)</option>
                        <option value="Tata 407">Tata 407 (2-3 tons)</option>
                        <option value="Tata 709">Tata 709 (5-7 tons)</option>
                        <option value="Tata 1109">Tata 1109 (9-11 tons)</option>
                        <option value="Tata 1613">Tata 1613 (13-16 tons)</option>
                        <option value="Container">Container Truck</option>
                        <option value="Refrigerated">Refrigerated Truck</option>
                      </select>
                    </div>
                  </div>

                  {/* Capacity and Cost */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity (tons) *
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={addTruckForm.capacity}
                        onChange={handleAddTruckFormChange}
                        required
                        min="0.5"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 5.0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost per KM (₹) *
                      </label>
                      <input
                        type="number"
                        name="costPerKm"
                        value={addTruckForm.costPerKm}
                        onChange={handleAddTruckFormChange}
                        required
                        min="10"
                        step="5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 25"
                      />
                    </div>
                  </div>

                  {/* Route Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Location *
                      </label>
                      <input
                        type="text"
                        name="pickupLocation"
                        value={addTruckForm.pickupLocation}
                        onChange={handleAddTruckFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Pickup address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Location *
                      </label>
                      <input
                        type="text"
                        name="deliveryLocation"
                        value={addTruckForm.deliveryLocation}
                        onChange={handleAddTruckFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Delivery address"
                      />
                    </div>
                  </div>

                  {/* Departure Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departure Date *
                      </label>
                      <input
                        type="date"
                        name="departureDate"
                        value={addTruckForm.departureDate}
                        onChange={handleAddTruckFormChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departure Time *
                      </label>
                      <select
                        name="departureTime"
                        value={addTruckForm.departureTime}
                        onChange={handleAddTruckFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select time slot</option>
                        <option value="9-12">9:00 AM - 12:00 PM</option>
                        <option value="12-15">12:00 PM - 3:00 PM</option>
                        <option value="15-18">3:00 PM - 6:00 PM</option>
                        <option value="18-21">6:00 PM - 9:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={addTruckForm.contactPerson}
                        onChange={handleAddTruckFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contact person name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={addTruckForm.contactPhone}
                        onChange={handleAddTruckFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      name="additionalNotes"
                      value={addTruckForm.additionalNotes}
                      onChange={handleAddTruckFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any special requirements, restrictions, or additional information..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-green-400 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-500 transition-all duration-200"
                    >
                      Add Truck to Pool
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddTruckForm(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SharedTruckMatches;