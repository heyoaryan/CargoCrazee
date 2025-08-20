import React, { useState, useContext, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertContext } from '../App';
import { apiService } from '../services/api';
import { 
  MapPin, 
  Package, 
  Calendar, 
  Clock, 
  Truck,
  CheckCircle,
  Cloud,
  Navigation,
  Loader2,
  Users
} from 'lucide-react';

const AddDelivery = () => {
  const navigate = useNavigate();
  const { addAlert } = useContext(AlertContext);
  const [isSmartTruckPooling, setIsSmartTruckPooling] = useState(() => {
    const savedMode = localStorage.getItem('deliveryMode');
    return savedMode === 'smartTruckPooling';
  });
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem('addDeliveryCurrentStep');
    return savedStep ? parseInt(savedStep) : 1;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem('addDeliveryFormData');
    return savedFormData ? JSON.parse(savedFormData) : {
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
      // Smart Truck Pooling specific fields
      poolingPreferences: {
        maxWaitTime: '24', // hours
        flexiblePickup: true,
        flexibleDelivery: true,
        costSavingsTarget: '30', // percentage
        preferredTruckTypes: ['Mini Truck', 'Tata 407'],
        specialRequirements: []
      }
    };
  });

  const [showPackageName, setShowPackageName] = useState(() => {
    const savedShowPackageName = localStorage.getItem('addDeliveryShowPackageName');
    return savedShowPackageName ? JSON.parse(savedShowPackageName) : false;
  });
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSharedTruckBooking, setIsSharedTruckBooking] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [truckPoolingData, setTruckPoolingData] = useState<any>(null);
  const [showTruckPoolingModal, setShowTruckPoolingModal] = useState(false);
  const [truckPoolingChoice, setTruckPoolingChoice] = useState<'yes' | 'no' | null>(null);
  const [addTruckToPool, setAddTruckToPool] = useState(false);
  const [truckPoolingStatus, setTruckPoolingStatus] = useState<string>('');

  // Compute derived route and cost metrics without mock values
  const computedMetrics = useMemo(() => {
    const distanceKm = Number(aiData?.optimization?.optimized_route?.distance_km) || 0;
    const estimatedTimeMinutes = Number(aiData?.optimization?.optimized_route?.estimated_time_minutes) || 0;
    const weightKg = parseFloat(formData.weight || '0') || 0;

    // Pricing model (deterministic, no mock randoms)
    const baseCost = 150; // flat base
    const ratePerKm = 12; // INR per km
    const weightThresholdKg = 5;
    const surchargePerKg = 5; // INR per kg beyond threshold

    const distanceCost = Math.max(0, distanceKm) * ratePerKm;
    const weightSurcharge = Math.max(0, weightKg - weightThresholdKg) * surchargePerKg;
    const totalRegular = Math.round(baseCost + distanceCost + weightSurcharge);
    const poolingDiscountPercent = isSmartTruckPooling ? 30 : 0;
    const pooledCost = Math.round(totalRegular * (1 - poolingDiscountPercent / 100));
    const savingsAmount = Math.max(0, totalRegular - pooledCost);

    return {
      distanceKm,
      estimatedTimeMinutes,
      weightKg,
      baseCost,
      ratePerKm,
      weightThresholdKg,
      surchargePerKg,
      distanceCost: Math.round(distanceCost),
      weightSurcharge: Math.round(weightSurcharge),
      totalRegular,
      poolingDiscountPercent,
      pooledCost,
      savingsAmount,
    };
  }, [aiData, formData.weight, isSmartTruckPooling]);
  
  // Save form data and current step to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('addDeliveryCurrentStep', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem('addDeliveryFormData', JSON.stringify(formData));
  }, [formData]);

  // Invalidate AI data when addresses change so distance recalculates instead of staying stale
  useEffect(() => {
    if (aiData) {
      setAiData(null);
      setShowAISuggestions(false);
    }
  }, [formData.pickupAddress, formData.deliveryAddress]);

  useEffect(() => {
    localStorage.setItem('addDeliveryShowPackageName', JSON.stringify(showPackageName));
  }, [showPackageName]);

  // AI Integration with Real APIs for Delhi Industrial Hubs
  const fetchAISuggestions = async () => {
    if (!formData.pickupAddress || !formData.deliveryAddress) return;
    
    try {
      setIsLoadingAI(true);
      
      const hubsResp = await apiService.getIndustrialHubs().catch(() => null);
      const hubEntries: Array<{ name: string; coordinates: { lat: number; lon: number } }> = hubsResp?.hubs
        ? Object.values(hubsResp.hubs)
        : [];

      const findCoordsForAddress = (address: string | undefined | null) => {
        if (!address) return null;
        const lower = address.toLowerCase();
        for (const hub of hubEntries as any[]) {
          if (lower.includes((hub.name || '').toLowerCase())) {
            return hub.coordinates;
          }
        }
        return null;
      };

      // Determine coordinates:
      // 1) Prefer known industrial hub coordinates if the address contains a hub name
      // 2) Otherwise geocode the free-form address via OSM Nominatim
      // 3) Finally, fall back to Delhi center and Gurgaon only if geocoding fails
      let originCoords = findCoordsForAddress(formData.pickupAddress);
      if (!originCoords && formData.pickupAddress) {
        const geo = await apiService.geocodeAddress(formData.pickupAddress);
        if (geo) originCoords = geo as any;
      }

      let destinationCoords = findCoordsForAddress(formData.deliveryAddress);
      if (!destinationCoords && formData.deliveryAddress) {
        const geo = await apiService.geocodeAddress(formData.deliveryAddress);
        if (geo) destinationCoords = geo as any;
      }

      // If we still don't have valid coordinates, do not use defaults; notify and abort
      if (!originCoords || !destinationCoords) {
        addAlert({
          type: 'warning',
          title: 'Location Not Found',
          message: 'Could not resolve pickup/delivery location. Please enter more specific addresses.',
          time: 'Just now',
          status: 'active',
          priority: 'high',
          shipmentId: '',
          route: '',
          read: false,
        });
        return;
      }

      // Get real AI analysis from Python service
      const routeData = await apiService.optimizeRoute({
        origin: originCoords,
        destination: destinationCoords,
        departure_time: formData.deliveryDate ? new Date(formData.deliveryDate).toISOString() : undefined
      });
      
      setAiData(routeData);
      
      // Check for truck pooling availability (local route-based)
      const truckPoolingResponse = await checkTruckPoolingAvailability();
      setTruckPoolingData(truckPoolingResponse);
      
      setShowAISuggestions(true);
    } catch (error) {
      console.error('AI service error:', error);
      // Do not use defaults or mock AI data; just notify and proceed without it
      setAiData(null);
      addAlert({
        type: 'warning',
        title: 'AI Analysis Unavailable',
        message: 'Could not fetch AI route/weather data right now. You can still proceed with delivery.',
        time: 'Just now',
        status: 'active',
        priority: 'low',
        shipmentId: '',
        route: '',
        read: false,
      });
      // Still compute local pooling availability
      const truckPoolingResponse = await checkTruckPoolingAvailability();
      setTruckPoolingData(truckPoolingResponse);
      
      setShowAISuggestions(true);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Handle truck pooling choice
  const handleTruckPoolingChoice = (choice: 'yes' | 'no') => {
    setTruckPoolingChoice(choice);
    if (choice === 'yes') {
      setTruckPoolingStatus('Your delivery will be pooled with the available truck. You will get 30% discount!');
      setIsSharedTruckBooking(true);
    } else {
      setTruckPoolingStatus('You chose regular delivery. No pooling applied.');
      setIsSharedTruckBooking(false);
    }
  };

  // Handle add truck to pool choice
  const handleAddTruckToPool = (choice: boolean) => {
    setAddTruckToPool(choice);
    if (choice) {
      setTruckPoolingStatus('Your truck has been added to the pool. You will be notified when matches are available!');
    } else {
      setTruckPoolingStatus('You chose to continue with regular delivery.');
    }
  };

  // Check truck pooling availability using local Shared Truck Matches/Pool
  const checkTruckPoolingAvailability = async () => {
    const localMatches = JSON.parse(localStorage.getItem('sharedTruckMatches') || '[]');
    const localPool = JSON.parse(localStorage.getItem('truckPool') || '[]');
    const all = [...localMatches, ...localPool];

    const pickup = (formData.pickupAddress || '').toLowerCase().trim();
    const delivery = (formData.deliveryAddress || '').toLowerCase().trim();

    const matched = all.find((item: any) => {
      const p = (item.pickupLocation || item.pickupAddress || '').toLowerCase();
      const d = (item.deliveryLocation || item.deliveryAddress || '').toLowerCase();
      const pickupMatch = p && pickup && (p.includes(pickup) || pickup.includes(p));
      const deliveryMatch = d && delivery && (d.includes(delivery) || delivery.includes(d));
      return pickupMatch && deliveryMatch;
    });

    if (matched) {
      return {
        hasTruckAvailable: true,
        truckDetails: {
          truckId: matched.truckId || 'TRK' + Math.floor(Math.random() * 10000),
          departureTime: matched.departureTime || '12:00 PM',
          route: `${(matched.pickupLocation || matched.pickupAddress || formData.pickupAddress || '').substring(0, 20)}... → ${(matched.deliveryLocation || matched.deliveryAddress || formData.deliveryAddress || '').substring(0, 20)}...`,
          costSavings: 30
        },
        message: 'Truck Pooling Available for your route! Save ~30% on cost.'
      };
    }

    return {
      hasTruckAvailable: false,
      truckDetails: null,
      message: 'No shared truck match found for this route right now.'
    };
  };

  const specialInstructionKeywords = [
    'Handle with care',
    'Fragile',
    'Keep upright',
    'Do not stack',
    'Keep dry',
    'Temperature sensitive',
    'This side up',
    'No magnets'
  ];

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const computeTimeSlotFromHour = (hour: number) => {
    if (hour >= 9 && hour < 12) return '9-12';
    if (hour >= 12 && hour < 15) return '12-15';
    if (hour >= 15 && hour < 18) return '15-18';
    if (hour >= 18 && hour < 21) return '18-21';
    // Fallback to closest slot
    if (hour < 9) return '9-12';
    return '18-21';
  };

  // Prefill from SharedTruck booking
  useEffect(() => {
    try {
      const prefillRaw = localStorage.getItem('prefillDelivery');
      if (prefillRaw) {
        const prefill = JSON.parse(prefillRaw);
        // Derive time slot from departure if provided
        let derivedTime = prefill.deliveryTime;
        if (!derivedTime && prefill.departureTime) {
          const slot = String(prefill.departureTime);
          // If departureTime is a slot like '9-12', use directly; otherwise parse date
          if (/^(9-12|12-15|15-18|18-21)$/.test(slot)) {
            derivedTime = slot;
          } else {
            const depDate = new Date(slot);
            if (!isNaN(depDate.getTime())) {
              derivedTime = computeTimeSlotFromHour(depDate.getHours());
            }
          }
        }
        setFormData(prev => ({
          ...prev,
          pickupAddress: prefill.pickupAddress || prev.pickupAddress,
          deliveryAddress: prefill.deliveryAddress || prev.deliveryAddress,
          // Keep previous date if not provided; do not try to parse slot strings as date
          deliveryDate: prefill.deliveryDate || prev.deliveryDate,
          deliveryTime: derivedTime || prev.deliveryTime,
          weight: prefill.weight || prev.weight,
        }));
        setIsSharedTruckBooking(!!prefill.isSharedTruckBooking);
        setIsSmartTruckPooling(!!prefill.isSharedTruckBooking);
        if (prefill.isSharedTruckBooking) {
          localStorage.setItem('deliveryMode', 'smartTruckPooling');
        }
        // Clear after applying
        localStorage.removeItem('prefillDelivery');
      }
    } catch (e) {
      console.warn('Failed to apply prefillDelivery:', e);
    }
  }, []);

  // Auto-fetch AI suggestions when reaching step 4
  useEffect(() => {
    if (currentStep === 4 && !aiData && !isLoadingAI) {
      fetchAISuggestions();
    }
  }, [currentStep]);

  // Update the getValidTimeSlots function
  const getValidTimeSlots = () => {
    const now = new Date();
    const selectedDate = formData.deliveryDate ? new Date(formData.deliveryDate) : null;
    const isToday = selectedDate?.toDateString() === now.toDateString();
    const currentHour = now.getHours();
    
    const allSlots = [
      { value: '9-12', label: '9:00 AM - 12:00 PM', start: 9 },
      { value: '12-15', label: '12:00 PM - 3:00 PM', start: 12 },
      { value: '15-18', label: '3:00 PM - 6:00 PM', start: 15 },
      { value: '18-21', label: '6:00 PM - 9:00 PM', start: 18 }
    ];

    if (!selectedDate) return [];
    if (!isToday) return allSlots;
    
    return allSlots.filter(slot => slot.start > currentHour);
  };

  // Update the useEffect for time slots
  useEffect(() => {
    const slots = getValidTimeSlots();
    setTimeSlots(slots);
    
    // Clear selected time if it's no longer valid
    if (formData.deliveryTime) {
      const isValidTime = slots.some(slot => slot.value === formData.deliveryTime);
      if (!isValidTime) {
        setFormData(prev => ({ ...prev, deliveryTime: '' }));
      }
    }
  }, [formData.deliveryDate]);

  const steps = isSmartTruckPooling ? [
    { number: 1, title: 'Pickup & Delivery', icon: MapPin },
    { number: 2, title: 'Package Details', icon: Package },
    { number: 3, title: 'Pooling Preferences', icon: Truck },
    { number: 4, title: 'Smart Matching & Review', icon: CheckCircle },
  ] : [
    { number: 1, title: 'Pickup & Delivery', icon: MapPin },
    { number: 2, title: 'Package Details', icon: Package },
    { number: 3, title: 'Schedule', icon: Calendar },
    { number: 4, title: 'AI Analysis & Review', icon: CheckCircle },
  ];

  const packageTypes = [
            'Furniture',
        'Electronics',
        'Clothing',
        'Food Items',
        'Fragile Items',
        'Other',
  ];

  const sanitizeIndianPhoneInput = (raw: string) => {
    let digits = raw.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('91')) {
      digits = digits.slice(2);
    }
    return digits.slice(0, 10);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    const value = name === 'customerPhone'
      ? sanitizeIndianPhoneInput((e.target as HTMLInputElement).value)
      : (e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
    
    // Handle package type change
    if (name === 'packageType') {
      setShowPackageName(value === 'Other');
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, packageName: '' }));
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

    // Inline validations
    if (name === 'pickupAddress') {
      setErrors(prev => ({
        ...prev,
        pickupAddress: (value.trim().length < 10) ? 'Must be at least 10 characters' : ''
      }));
    }
    if (name === 'deliveryAddress') {
      setErrors(prev => ({
        ...prev,
        deliveryAddress: (value.trim().length < 10) ? 'Must be at least 10 characters' : ''
      }));
    }
    if (name === 'customerName') {
      setErrors(prev => ({
        ...prev,
        customerName: (value.trim().length < 2) ? 'Name too short' : ''
      }));
    }
    if (name === 'customerPhone') {
      setErrors(prev => ({
        ...prev,
        customerPhone: (/^\d{10}$/.test(value) ? '' : 'Enter 10-digit mobile number')
      }));
    }
  };

  // Add validation functions
  const isStep1Valid = () => {
    return (
      formData.pickupAddress?.trim().length >= 10 &&
      formData.deliveryAddress?.trim().length >= 10 &&
      formData.customerName?.trim().length >= 2 &&
      /^\d{10}$/.test(formData.customerPhone)
    );
  };

  const isStep2Valid = () => {
    return (
      formData.packageType &&
      formData.weight &&
      (!showPackageName || (showPackageName && formData.packageName))
    );
  };

  // Update nextStep function
  const nextStep = () => {
    if (currentStep === 1 && !isStep1Valid()) {
      return;
    }

    if (currentStep === 2 && !isStep2Valid()) {
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  // Update button styles based on validation
  const getButtonStyle = (step: number) => {
    let isValid = false;
    
    switch(step) {
      case 1:
        isValid = isStep1Valid();
        break;
      case 2:
        isValid = isStep2Valid();
        break;
      case 3:
        if (isSmartTruckPooling) {
          isValid = formData.deliveryDate && formData.deliveryTime;
        } else {
          isValid = formData.deliveryDate && formData.deliveryTime;
        }
        break;
      default:
        isValid = true;
    }

    return isValid
      ? 'bg-gradient-to-r from-blue-500 to-green-400 text-white hover:from-blue-600 hover:to-green-500'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed';
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleCreateDelivery = async () => {
    try {
      setIsSubmitting(true);
      // Minimal client-side validation
      const requiredMissing = [
        { key: 'pickupAddress', label: 'Pickup Address' },
        { key: 'deliveryAddress', label: 'Delivery Address' },
        { key: 'customerName', label: 'Customer Name' },
        { key: 'customerPhone', label: 'Customer Phone' },
        { key: 'deliveryDate', label: 'Delivery Date' },
        { key: 'deliveryTime', label: 'Preferred Time' },
      ].filter(f => !(formData as any)[f.key]);

      if (requiredMissing.length > 0) {
        setIsSubmitting(false);
        return;
      }
      
      // Validate Indian phone number (10 digits)
      if (!/^\d{10}$/.test(formData.customerPhone)) {
        setIsSubmitting(false);
        return;
      }

      // Prepare delivery data for backend
      const selectedPackageType = formData.packageType || 'Documents';
      if (selectedPackageType === 'Other' && !formData.packageName) {
        setIsSubmitting(false);
        return;
      }

      // Additional basic validations aligned with backend
      if ((formData.pickupAddress || '').trim().length < 10 || (formData.deliveryAddress || '').trim().length < 10) {
        setIsSubmitting(false);
        return;
      }

      const parsedWeight = parseFloat(formData.weight || '0');
      if (isNaN(parsedWeight) || parsedWeight < 0.1) {
        setIsSubmitting(false);
        return;
      }

      const finalCost = (isSmartTruckPooling || truckPoolingChoice === 'yes')
        ? computedMetrics.pooledCost
        : computedMetrics.totalRegular;

      const deliveryData = {
        customer: {
          name: formData.customerName,
          phone: `+91${formData.customerPhone}`,
          email: ''
        },
        pickup: {
          address: formData.pickupAddress,
          contactPerson: formData.customerName,
          contactPhone: `+91${formData.customerPhone}`,
          instructions: formData.specialInstructions
        },
        delivery: {
          address: formData.deliveryAddress,
          contactPerson: formData.customerName,
          contactPhone: `+91${formData.customerPhone}`,
          instructions: formData.specialInstructions
        },
        package: {
          type: selectedPackageType, // must match backend enum
          name: formData.packageName || (selectedPackageType !== 'Other' ? selectedPackageType : ''),
          weight: parsedWeight || 1,
          dimensions: {
            length: parseFloat(formData.dimensions.length) || 0,
            width: parseFloat(formData.dimensions.width) || 0,
            height: parseFloat(formData.dimensions.height) || 0
          },
          specialInstructions: formData.specialInstructions
        },
        schedule: {
          pickupDate: new Date(formData.deliveryDate),
          deliveryDate: new Date(formData.deliveryDate),
          preferredTimeSlot: formData.deliveryTime || '9-12'
        },
        pricing: {
          baseCost: computedMetrics.baseCost,
          distanceCost: computedMetrics.distanceCost,
          weightCost: computedMetrics.weightSurcharge,
          specialHandlingCost: 0,
          totalCost: finalCost,
          currency: 'INR'
        },
        route: {
          distance: computedMetrics.distanceKm || 0,
          estimatedTime: computedMetrics.estimatedTimeMinutes || 0
        }
      };

      // Create delivery in backend
      const createdDelivery = await apiService.createDelivery(deliveryData);
      
      // Handle Smart Truck Pooling - Only add to truck pool (avoid duplicate cards)
      if (isSmartTruckPooling) {
        const truckPoolData = {
          deliveryId: createdDelivery.deliveryId,
          pickupAddress: formData.pickupAddress,
          deliveryAddress: formData.deliveryAddress,
          deliveryDate: formData.deliveryDate,
          deliveryTime: formData.deliveryTime,
          packageType: formData.packageType,
          weight: formData.weight,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          poolingPreferences: formData.poolingPreferences,
          status: 'available_for_pooling',
          addedAt: new Date().toISOString(),
          isSmartTruckPooling: true
        };
        
        // Save to localStorage for truck pool
        const existingPool = JSON.parse(localStorage.getItem('truckPool') || '[]');
        existingPool.push(truckPoolData);
        localStorage.setItem('truckPool', JSON.stringify(existingPool));
      }
      
      // Handle truck pooling if user chose to pool with existing truck
      if (truckPoolingChoice === 'yes') {
        // Add truck to shared truck matches
        const sharedTruckData = {
          deliveryId: createdDelivery.deliveryId,
          truckId: truckPoolingData.truckDetails.truckId,
          pickupAddress: formData.pickupAddress,
          deliveryAddress: formData.deliveryAddress,
          departureTime: truckPoolingData.truckDetails.departureTime,
          costSavings: truckPoolingData.truckDetails.costSavings,
          status: 'pending'
        };
        
        // Save to localStorage for shared truck matches
        const existingMatches = JSON.parse(localStorage.getItem('sharedTruckMatches') || '[]');
        existingMatches.push(sharedTruckData);
        localStorage.setItem('sharedTruckMatches', JSON.stringify(existingMatches));
      }
      
      // Handle adding truck to pool if user chose to add their truck
      if (addTruckToPool) {
        const truckPoolData = {
          deliveryId: createdDelivery.deliveryId,
          pickupAddress: formData.pickupAddress,
          deliveryAddress: formData.deliveryAddress,
          departureTime: formData.deliveryTime,
          status: 'available_for_pooling',
          addedAt: new Date().toISOString()
        };
        
        // Save to localStorage for truck pool
        const existingPool = JSON.parse(localStorage.getItem('truckPool') || '[]');
        existingPool.push(truckPoolData);
        localStorage.setItem('truckPool', JSON.stringify(existingPool));
      }
      
      // Add success alert only
      addAlert({
        type: 'success',
        title: 'Delivery Scheduled Successfully! 🎉',
        message: `New delivery ${createdDelivery.deliveryId} has been scheduled from ${formData.pickupAddress.substring(0, 30)}... to ${formData.deliveryAddress.substring(0, 30)}...${isSmartTruckPooling ? ' (Added to Shared Truck Pool for 30-50% savings!)' : truckPoolingChoice === 'yes' ? ' (Truck Pooled - 30% OFF!)' : ''}`,
        time: 'Just now',
        status: 'active',
        priority: 'medium',
        shipmentId: createdDelivery.deliveryId,
        route: `${formData.pickupAddress.substring(0, 15)}... → ${formData.deliveryAddress.substring(0, 15)}...`,
        read: false,
      });
      
      // Reset form and clear localStorage
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
      
      // Clear localStorage
      localStorage.removeItem('addDeliveryCurrentStep');
      localStorage.removeItem('addDeliveryFormData');
      localStorage.removeItem('addDeliveryShowPackageName');
      localStorage.removeItem('deliveryMode');
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error creating delivery:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const industrialHubs = [
    'Narela Industrial Area, New Delhi, Delhi 110040',
    'Okhla Industrial Area, New Delhi, Delhi 110020',
    'Bawana Industrial Area, New Delhi, Delhi 110039',
    'Mayapuri Industrial Area, New Delhi, Delhi 110064',
    'Patparganj Industrial Area, Delhi 110092',
    'Kirti Nagar Industrial Area, New Delhi, Delhi 110015'
  ];

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
                  list="industrialAreas"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.pickupAddress ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="Enter pickup address or select industrial area"
                />
                <datalist id="industrialAreas">
                  {industrialHubs.map((hub, index) => (
                    <option key={index} value={hub} />
                  ))}
                </datalist>
              </div>
              {errors.pickupAddress && (
                <div className="text-xs text-red-600 mt-1">{errors.pickupAddress}</div>
              )}
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
                  list="industrialAreas"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.deliveryAddress ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="Enter delivery address or select industrial area"
                />
              </div>
              {errors.deliveryAddress && (
                <div className="text-xs text-red-600 mt-1">{errors.deliveryAddress}</div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.customerName ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="Customer name"
                />
                {errors.customerName && (
                  <div className="text-xs text-red-600 mt-1">{errors.customerName}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Phone *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 select-none">+91</span>
                  <input
                    type="tel"
                    name="customerPhone"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className={`w-full pl-14 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.customerPhone ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="10-digit mobile number"
                  />
                  {errors.customerPhone && (
                    <div className="text-xs text-red-600 mt-1">{errors.customerPhone}</div>
                  )}
                </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
              <div className="flex flex-wrap gap-2 mb-2">
                {specialInstructionKeywords.map((kw) => (
                  <button
                    type="button"
                    key={kw}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        specialInstructions: prev.specialInstructions
                          ? `${prev.specialInstructions}${prev.specialInstructions.trim().endsWith('.') ? '' : '.'} ${kw}`
                          : kw
                      }));
                    }}
                    className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                  >
                    + {kw}
                  </button>
                ))}
              </div>
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
        return isSmartTruckPooling ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Smart Truck Pooling Preferences & Schedule
            </h2>

            {/* Schedule Section - NEW */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-800">Delivery Schedule</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                      min={new Date().toISOString().split('T')[0]}
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
                      disabled={!formData.deliveryDate}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !formData.deliveryDate ? 'bg-gray-100 text-gray-500 border-gray-200' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select time slot</option>
                      {getValidTimeSlots().map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {!formData.deliveryDate && (
                    <div className="text-sm text-blue-600 mt-1">
                      Please select a delivery date first
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Removed benefits info for a cleaner, focused form */}

            {/* Pooling preferences removed to keep Step 3 minimal */}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Schedule Delivery
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                    min={new Date().toISOString().split('T')[0]}
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
                    disabled={isSharedTruckBooking || !formData.deliveryDate}
                    title={!formData.deliveryDate ? 'Please select a date first' : isSharedTruckBooking ? 'Time locked to truck departure time' : ''}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !formData.deliveryDate || isSharedTruckBooking ? 'bg-gray-100 text-gray-500 border-gray-200' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select time slot</option>
                    {getValidTimeSlots().map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
                {!formData.deliveryDate && (
                  <div className="text-sm text-blue-600 mt-1">
                    Please select a delivery date first
                  </div>
                )}
                {formData.deliveryDate && getValidTimeSlots().length === 0 && (
                  <div className="text-sm text-yellow-600 mt-1">
                    No time slots available for selected date. Please select a different date.
                  </div>
                )}
              </div>
            </div>
            {isSharedTruckBooking && (
              <div className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-3">
                Time slot is auto-selected from the shared truck's departure and cannot be changed here.
              </div>
            )}
          </motion.div>
        );

      case 4:
        return isSmartTruckPooling ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Analysis & Smart Matching</h2>

            {/* 1. AI Route Optimization */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 border border-blue-200">
              <div className="flex items-center space-x-2 mb-4">
                <Navigation className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-gray-800 text-base sm:text-lg">AI Route Optimization</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{computedMetrics.distanceKm || '-'}</div>
                    <div className="text-[11px] sm:text-sm text-gray-600">km</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{computedMetrics.estimatedTimeMinutes || '-'}</div>
                    <div className="text-[11px] sm:text-sm text-gray-600">min</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{computedMetrics.weightKg}</div>
                    <div className="text-[11px] sm:text-sm text-gray-600">kg (package)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{computedMetrics.ratePerKm}</div>
                    <div className="text-[11px] sm:text-sm text-gray-600">₹/km</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Weather Analysis */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 border border-purple-200">
              <div className="flex items-center space-x-2 mb-4">
                <Cloud className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold text-gray-800 text-base sm:text-lg">Weather Analysis</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Pickup Location</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-600 text-xs">Temperature:</span>
                        <span className="font-bold text-purple-600 text-xs sm:text-sm">{aiData?.weather_context?.pickup_location?.weather?.temperature ?? '-' }°C</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-600 text-xs">Condition:</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-[10px] sm:text-xs font-medium">
                          {aiData?.weather_context?.pickup_location?.weather?.condition ?? '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-600 text-xs">Humidity:</span>
                        <span className="font-bold text-purple-600 text-xs sm:text-sm">{aiData?.weather_context?.pickup_location?.weather?.humidity ?? '-'}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Location</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-600 text-xs">Wind Speed:</span>
                        <span className="font-bold text-purple-600 text-xs sm:text-sm">{aiData?.weather_context?.delivery_location?.weather?.wind_speed ?? '-'} km/h</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-600 text-xs">Visibility:</span>
                        <span className="font-bold text-purple-600 text-xs sm:text-sm">{aiData?.weather_context?.delivery_location?.weather?.visibility ?? '-'} km</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-600 text-xs">Rain Chance:</span>
                        <span className="font-bold text-purple-600 text-xs sm:text-sm">{aiData?.weather_context?.forecast?.precipitation_chance ?? '-'}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                {aiData?.optimization?.optimized_route?.weather_impact && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>Weather Impact:</strong> {aiData.optimization.optimized_route.weather_impact.severity}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Cost Analysis */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 sm:p-6 border border-orange-200">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-orange-600 font-bold text-xl">₹</span>
                <h3 className="font-semibold text-gray-800 text-base sm:text-lg">Cost Analysis</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Cost Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-600 text-xs">Base Cost:</span>
                        <span className="font-medium text-sm sm:text-base">₹{computedMetrics.baseCost}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-600 text-xs">Distance Cost:</span>
                        <span className="font-medium text-sm sm:text-base">₹{computedMetrics.distanceCost} <span className="hidden sm:inline">({computedMetrics.distanceKm} km × ₹{computedMetrics.ratePerKm})</span></span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-600 text-xs">Weight Surcharge:</span>
                        <span className="font-medium text-sm sm:text-base">₹{computedMetrics.weightSurcharge} <span className="hidden sm:inline">({Math.max(0, computedMetrics.weightKg - computedMetrics.weightThresholdKg)} kg × ₹{computedMetrics.surchargePerKg})</span></span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Pooling Savings</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-600 text-xs">Regular Cost:</span>
                        <span className="font-medium text-sm sm:text-base">₹{computedMetrics.totalRegular}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-600 text-xs">Pooled Cost:</span>
                        <span className="font-bold text-green-600 text-sm sm:text-base">₹{computedMetrics.pooledCost}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-gray-600 text-xs">Total Savings:</span>
                        <span className="font-bold text-green-600 text-sm sm:text-base">₹{computedMetrics.savingsAmount} ({computedMetrics.poolingDiscountPercent}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-orange-200 pt-3">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-800 font-semibold">Final Pooled Cost:</span>
                    <span className="font-bold text-orange-600 text-base sm:text-lg">₹{computedMetrics.pooledCost}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Removed Smart Pooling Analysis mock section */}

            {/* Removed Available Matches mock section */}

            {/* Your Pooling Preference */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-lg">Your Pooling Preference</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Date:</span>
                    <span className="font-medium">{formData.deliveryDate ? new Date(formData.deliveryDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preferred Time:</span>
                    <span className="font-medium">{formData.deliveryTime || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Wait Time:</span>
                    <span className="font-medium">{formData.poolingPreferences?.maxWaitTime || '24'} hours</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Pooling Mode:</span>
                    <span className="font-medium">{isSmartTruckPooling ? 'Shared Truck Pooling' : 'Regular'}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Estimated Pooled Cost:</span>
                    <span className="font-medium">₹{computedMetrics.pooledCost}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Estimated Savings:</span>
                    <span className="font-medium">₹{computedMetrics.savingsAmount} ({computedMetrics.poolingDiscountPercent}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Analysis & Review</h2>

            <div className="space-y-6">
              {/* 1. AI Route Optimization */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Navigation className="h-6 w-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-800 text-lg">AI Route Optimization</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Optimized Distance:</span>
                    <span className="font-bold text-blue-600">{computedMetrics.distanceKm || '-'} km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estimated Time:</span>
                    <span className="font-bold text-blue-600">{computedMetrics.estimatedTimeMinutes || '-'} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Risk Score:</span>
                    <span className="font-bold text-blue-600">{aiData?.optimization?.risk_score ?? '-'} / 100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Weather Severity:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      aiData?.optimization?.optimized_route?.weather_impact?.severity === 'high' ? 'bg-red-100 text-red-800' :
                      aiData?.optimization?.optimized_route?.weather_impact?.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {aiData?.optimization?.optimized_route?.weather_impact?.severity
                        ? aiData.optimization.optimized_route.weather_impact.severity.charAt(0).toUpperCase() + aiData.optimization.optimized_route.weather_impact.severity.slice(1)
                        : 'Low'}
                    </span>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>AI Suggestion:</strong> {aiData?.optimization?.ai_suggestions?.[0] ?? '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Weather Analysis */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Cloud className="h-6 w-6 text-purple-600" />
                  <h3 className="font-semibold text-gray-800 text-lg">Weather Analysis</h3>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Pickup Location</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Temperature:</span>
                          <span className="font-bold text-purple-600 text-sm">{aiData?.weather_context?.pickup_location?.weather?.temperature ?? '-'}°C</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Condition:</span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            {aiData?.weather_context?.pickup_location?.weather?.condition ?? '-'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Humidity:</span>
                          <span className="font-bold text-purple-600 text-sm">{aiData?.weather_context?.pickup_location?.weather?.humidity ?? '-'}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Location</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Wind Speed:</span>
                          <span className="font-bold text-purple-600 text-sm">{aiData?.weather_context?.delivery_location?.weather?.wind_speed ?? '-'} km/h</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Visibility:</span>
                          <span className="font-bold text-purple-600 text-sm">{aiData?.weather_context?.delivery_location?.weather?.visibility ?? '-'} km</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Rain Chance:</span>
                          <span className="font-bold text-purple-600 text-sm">{aiData?.weather_context?.forecast?.precipitation_chance ?? '-'}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>Weather Impact:</strong> {aiData?.optimization?.optimized_route?.weather_impact?.severity ? (
                        aiData.optimization.optimized_route.weather_impact.severity === 'high' ? 'Severe weather may impact delivery' :
                        aiData.optimization.optimized_route.weather_impact.severity === 'medium' ? 'Moderate weather impact expected' : 'Favorable conditions for delivery'
                      ) : '-'}
                    </p>
                    {aiData?.industrial_hubs?.origin_hub && (
                      <div className="mt-2 text-xs text-purple-700">
                        <strong>Nearest Hub:</strong> {aiData.industrial_hubs.origin_hub.name} ({aiData.industrial_hubs.origin_hub.type})
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Truck Pooling */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 sm:p-6 border border-green-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Truck className="h-6 w-6 text-green-600" />
                  <h3 className="font-semibold text-gray-800 text-base sm:text-lg">Truck Pooling</h3>
                </div>
                {truckPoolingData ? (
                  <div className="space-y-3">
                    {truckPoolingData.hasTruckAvailable ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-xs sm:text-sm text-green-800 font-medium">
                            🚛 <strong>Truck Available!</strong> {truckPoolingData.message}
                          </p>
                        </div>
                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Truck ID:</span>
                            <span className="font-mono font-medium">{truckPoolingData.truckDetails.truckId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Departure:</span>
                            <span className="font-medium">{truckPoolingData.truckDetails.departureTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Route:</span>
                            <span className="font-medium">{truckPoolingData.truckDetails.route}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cost Savings:</span>
                            <span className="font-bold text-green-600">{truckPoolingData.truckDetails.costSavings}% OFF</span>
                          </div>
                        </div>
                        <div className="flex space-x-3 mt-4">
                          <button
                            onClick={() => {
                              localStorage.setItem('deliveryMode', 'smartTruckPooling');
                              setIsSmartTruckPooling(true);
                              setCurrentStep(3);
                            }}
                            className="flex-1 bg-green-600 text-white py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-green-700 transition-colors"
                          >
                            Use Shared Truck Pooling Form
                          </button>
                          <button
                            onClick={() => handleAddTruckToPool(false)}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-300 transition-colors"
                          >
                            Continue Regular Delivery
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-xs sm:text-sm text-yellow-800 font-medium">
                            📦 <strong>No Truck Available</strong> for pooling on this route
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs sm:text-sm text-blue-800">
                            💡 <strong>No current matches.</strong> You can still save by using Shared Truck Pooling.
                          </p>
                        </div>
                        <div className="flex space-x-3 mt-4">
                          <button
                            onClick={() => {
                              localStorage.setItem('deliveryMode', 'smartTruckPooling');
                              setIsSmartTruckPooling(true);
                              setCurrentStep(3);
                            }}
                            className="flex-1 bg-green-600 text-white py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-green-700 transition-colors"
                          >
                            Use Shared Truck Pooling Form
                          </button>
                          <button
                            onClick={() => handleAddTruckToPool(false)}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-300 transition-colors"
                          >
                            Continue Regular Delivery
                          </button>
                        </div>
                        {truckPoolingStatus && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs sm:text-sm text-blue-800 font-medium">
                              {truckPoolingStatus}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Click "Get AI Analysis" in step 3 to check truck pooling availability</p>
                  </div>
                )}
              </div>

              {/* 4. Cost Analysis */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-orange-600 font-bold text-xl">₹</span>
                  <h3 className="font-semibold text-gray-800 text-lg">Cost Analysis</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Base Cost:</span>
                    <span className="font-medium">₹{computedMetrics.baseCost}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Distance Cost:</span>
                    <span className="font-medium">₹{computedMetrics.distanceCost} ({computedMetrics.distanceKm} km × ₹{computedMetrics.ratePerKm})</span>
                  </div>
                  {computedMetrics.weightSurcharge > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Weight Surcharge:</span>
                      <span className="font-medium">₹{computedMetrics.weightSurcharge} ({Math.max(0, computedMetrics.weightKg - computedMetrics.weightThresholdKg)} kg × ₹{computedMetrics.surchargePerKg})</span>
                    </div>
                  )}
                  <div className="border-t border-orange-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-semibold">Total Cost:</span>
                      <span className="font-bold text-orange-600 text-lg">₹{computedMetrics.totalRegular}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Removed Delivery Recommendations mock/info section */}
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
        <div className="p-3 sm:p-4 lg:p-6 max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 font-poppins">
                  {isSmartTruckPooling ? 'Smart Truck Pooling Delivery' : 'Add New Delivery'}
                </h1>
                <p className="text-gray-600">
                  {isSmartTruckPooling 
                    ? 'Create delivery with smart truck pooling for maximum cost savings'
                    : 'Schedule a new shipment with AI-powered route optimization'
                  }
                </p>
              </div>
            </div>
            
            {/* Mode Toggle - Only show if user came from SharedTruckMatches */}
            {isSmartTruckPooling && (
              <div className="mt-4 mb-6">
                <button
                  onClick={() => {
                    setIsSmartTruckPooling(false);
                    localStorage.setItem('deliveryMode', 'regular');
                  }}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span>🔄</span>
                  <span>Switch to Regular Delivery</span>
                </button>
              </div>
            )}
          </motion.div>

          {/* Progress Steps */}
          <div className="mb-4 sm:mb-6">
            <div className="relative flex items-center justify-between max-w-3xl mx-auto px-1 sm:px-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <div key={step.number} className="flex flex-col items-center relative z-10 flex-1">
                    <div className="relative">
                      {/* Step Circle */}
                      <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full border-2 shadow-md transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 text-white shadow-blue-200' 
                          : isCompleted 
                          ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white shadow-green-200'
                          : 'bg-white border-gray-200 text-gray-400 shadow-gray-100 hover:border-gray-300'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                        ) : (
                          <Icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                        )}
                      </div>
                      
                      {/* Active step indicator */}
                      {isActive && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-blue-500 rounded-full border border-white shadow-sm animate-pulse"></div>
                      )}
                    </div>
                    
                    {/* Step Text */}
                    <div className="mt-1 sm:mt-2 text-center px-0.5 sm:px-1">
                      <div className={`text-xs font-semibold ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        Step {step.number}
                      </div>
                      <div className={`text-xs font-medium mt-0.5 leading-tight ${
                        isActive ? 'text-gray-800' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 xl:p-8">
              {renderStep()}

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
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
                  {currentStep !== 3 && (
                    <button
                      onClick={nextStep}
                      disabled={currentStep === 1 ? !isStep1Valid() : currentStep === 2 ? !isStep2Valid() : false}
                      className={`px-6 sm:px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${getButtonStyle(currentStep)}`}
                    >
                      Next Step
                    </button>
                  )}

                </div>
              )}

              {/* Step 3: AI Route & Weather Button */}
              {currentStep === 3 && !isSmartTruckPooling && (
                <div className="mt-6 text-center">
                  <button
                    onClick={async () => {
                      if (!formData.deliveryDate || !formData.deliveryTime) {
                        addAlert({
                          type: 'warning',
                          title: 'Missing Information',
                          message: `Please select ${!formData.deliveryDate ? 'delivery date' : 'preferred time slot'} before proceeding`,
                          time: 'Just now',
                          status: 'active',
                          priority: 'high',
                          shipmentId: '',
                          route: '',
                          read: false,
                        });
                        return;
                      }
                      setIsTransitioning(true);
                      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
                      await fetchAISuggestions();
                      setIsTransitioning(false);
                      setCurrentStep(4);
                    }}
                    disabled={isLoadingAI || !formData.pickupAddress || !formData.deliveryAddress || !formData.deliveryDate || !formData.deliveryTime}
                    className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center mx-auto space-x-2 ${
                      isLoadingAI || !formData.pickupAddress || !formData.deliveryAddress || !formData.deliveryDate || !formData.deliveryTime
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isLoadingAI ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading AI Analysis...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="h-5 w-5" />
                        <span>Get AI Route & Weather Analysis</span>
                      </>
                    )}
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Get intelligent route optimization and weather insights for your delivery
                  </p>
                </div>
              )}

              {/* Step 3: Smart Matching Button for Smart Truck Pooling */}
              {currentStep === 3 && isSmartTruckPooling && (
                <div className="mt-6 text-center">
                  <button
                    onClick={async () => {
                      if (!formData.deliveryDate || !formData.deliveryTime) {
                        addAlert({
                          type: 'warning',
                          title: 'Missing Information',
                          message: `Please select ${!formData.deliveryDate ? 'delivery date' : 'preferred time slot'} before proceeding`,
                          time: 'Just now',
                          status: 'active',
                          priority: 'high',
                          shipmentId: '',
                          route: '',
                          read: false,
                        });
                        return;
                      }
                      setIsTransitioning(true);
                      await new Promise(resolve => setTimeout(resolve, 3000));
                      await fetchAISuggestions();
                      setIsTransitioning(false);
                      setCurrentStep(4);
                    }}
                    disabled={
                      isLoadingAI ||
                      !formData.pickupAddress ||
                      !formData.deliveryAddress ||
                      !formData.deliveryDate ||
                      !formData.deliveryTime
                    }
                    className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center mx-auto space-x-2 ${
                      isLoadingAI ||
                      !formData.pickupAddress ||
                      !formData.deliveryAddress ||
                      !formData.deliveryDate ||
                      !formData.deliveryTime
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isLoadingAI ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Finding Smart Matches...</span>
                      </>
                    ) : (
                      <>
                        <Truck className="h-5 w-5" />
                        <span>Get AI Route & Weather Analysis</span>
                      </>
                    )}
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Get intelligent route optimization, weather insights, and smart truck matching for your delivery
                  </p>
                </div>
              )}




              {/* Transition Loading Screen */}
              {isTransitioning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                    <div className="flex flex-col items-center space-y-6">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                        <Navigation className="h-8 w-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div className="text-center space-y-3">
                        <h3 className="text-xl font-bold text-gray-800">AI Analysis in Progress</h3>
                        <div className="space-y-2">
                          <p className="text-blue-600 animate-pulse flex items-center justify-center">
                            <Cloud className="h-5 w-5 mr-2" />
                            Analyzing Weather Conditions...
                          </p>
                          <p className="text-green-600 animate-pulse flex items-center justify-center">
                            <Navigation className="h-5 w-5 mr-2" />
                            Optimizing Route...
                          </p>
                          <p className="text-purple-600 animate-pulse flex items-center justify-center">
                            <Truck className="h-5 w-5 mr-2" />
                            Checking Traffic Patterns...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Final Actions */}
              {currentStep === 4 && (
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-100 text-gray-800 px-6 sm:px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
                  >
                    Back to Dashboard
                  </button>
                  <div className="flex flex-col sm:flex-row gap-3">
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
                        setIsSharedTruckBooking(false);
                      }}
                      className="bg-gray-200 text-gray-700 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                    >
                      Schedule New Delivery
                    </button>
                    <button
                      onClick={handleCreateDelivery}
                      disabled={isSubmitting}
                      className={`px-6 sm:px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                        isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-green-400 text-white hover:from-blue-600 hover:to-green-500'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Create Delivery...</span>
                        </>
                      ) : (
                        <span>Create Delivery</span>
                      )}
                    </button>
                  </div>
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