// Debug environment variables
console.log('Environment Variables Debug:');
console.log('VITE_API_BASE_URL:', (import.meta as any)?.env?.VITE_API_BASE_URL);
console.log('VITE_AI_SERVICE_URL:', (import.meta as any)?.env?.VITE_AI_SERVICE_URL);

// Try multiple ways to access environment variables
const API_BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || 
                     process.env.VITE_API_BASE_URL || 
                     'https://cargocrazee-backend.onrender.com/api';
const AI_SERVICE_URL = (import.meta as any)?.env?.VITE_AI_SERVICE_URL || 
                       process.env.VITE_AI_SERVICE_URL || 
                       'https://cargocrazee-ai-service.onrender.com';

console.log('Final URLs:');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('AI_SERVICE_URL:', AI_SERVICE_URL);

// Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  businessType: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  profileImage?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface ApiError {
  message: string;
  errors?: any;
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  try {
    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error Response:', data);
      // Prefer specific field error over generic message
      const firstFieldError = Array.isArray(data?.errors) && data.errors.length > 0 ? data.errors[0].msg : undefined;
      const backendMessage = firstFieldError || data?.error || data?.message;
      throw new Error(backendMessage || `HTTP ${response.status}: Something went wrong`);
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse server response');
  }
};

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to set auth token
const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

// Helper function to remove auth token
const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// API service class
class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Generic request method
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('Making request to:', url);
      const response = await fetch(url, config);
      console.log('Response status:', response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error('API request failed:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Network error - Unable to connect to server');
    }
  }

  // Authentication methods
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    company: string;
    phone: string;
    businessType: string;
  }): Promise<AuthResponse> {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  }

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Even if logout fails, clear local token
      console.warn('Logout request failed, clearing local token');
    } finally {
      removeAuthToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    return await this.request('/auth/me');
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.request('/auth/refresh-token', {
      method: 'POST',
    });

    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  }

  // User profile methods
  async updateProfile(userData: Partial<User>): Promise<User> {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async uploadProfileImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('profileImage', file);

    const token = getAuthToken();
    const response = await fetch(`${this.baseURL}/users/upload-profile-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return await handleResponse(response);
  }

  // Delivery methods
  async createDelivery(deliveryData: any): Promise<any> {
    const response = await this.request('/deliveries', {
      method: 'POST',
      body: JSON.stringify(deliveryData),
    });
    return response?.data?.delivery ?? response;
  }

  async getDeliveries(): Promise<any[]> {
    const response = await this.request('/deliveries');
    return response?.data?.deliveries ?? [];
  }

  async getDelivery(id: string): Promise<any> {
    return await this.request(`/deliveries/${id}`);
  }

  async updateDelivery(id: string, deliveryData: any): Promise<any> {
    return await this.request(`/deliveries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deliveryData),
    });
  }

  async deleteDelivery(id: string): Promise<void> {
    return await this.request(`/deliveries/${id}`, {
      method: 'DELETE',
    });
  }

  async updateDeliveryStatus(id: string, status: string): Promise<any> {
    return await this.request(`/deliveries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getDeliveryByDeliveryId(deliveryId: string): Promise<any> {
    const response = await this.request(`/deliveries/by-delivery-id/${encodeURIComponent(deliveryId)}`);
    return response?.data?.delivery ?? response;
  }

  // Alert methods
  async getAlerts(): Promise<any[]> {
    return await this.request('/alerts');
  }

  async getUnreadAlerts(): Promise<any[]> {
    return await this.request('/alerts/unread');
  }

  async markAlertAsRead(id: string): Promise<void> {
    return await this.request(`/alerts/${id}/read`, {
      method: 'PUT',
    });
  }

  async archiveAlert(id: string): Promise<void> {
    return await this.request(`/alerts/${id}/archive`, {
      method: 'PUT',
    });
  }

  async deleteAlert(id: string): Promise<void> {
    return await this.request(`/alerts/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard methods
  async getDashboardOverview(): Promise<any> {
    const response = await this.request('/dashboard/overview');
    const overview = response?.data?.overview ?? {};
    return {
      totalDeliveries: overview?.deliveries?.total ?? 0,
      activeDeliveries: overview?.deliveries
        ? (overview.deliveries.total ?? 0) - (overview.deliveries.completed ?? 0)
        : 0,
      completedDeliveries: overview?.deliveries?.completed ?? 0,
      totalRevenue: overview?.deliveries?.revenue ?? 0,
      averageDeliveryTime: overview?.deliveries?.averageTime ?? 0,
      carbonFootprint: overview?.savings?.co2 ?? 0,
    };
  }

  async getDashboardAnalytics(): Promise<any> {
    return await this.request('/dashboard/analytics');
  }

  async getDashboardNotifications(): Promise<any[]> {
    return await this.request('/dashboard/notifications');
  }

  async getDashboardQuickStats(): Promise<any> {
    return await this.request('/dashboard/quick-stats');
  }

  // Shared trucks methods
  async getSharedTrucks(): Promise<any[]> {
    return await this.request('/shared-trucks');
  }

  async searchSharedTrucks(searchData: any): Promise<any[]> {
    return await this.request('/shared-trucks/search', {
      method: 'POST',
      body: JSON.stringify(searchData),
    });
  }

  async requestSharedTruck(requestData: any): Promise<any> {
    return await this.request('/shared-trucks/request', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // Micro warehouse methods
  async getMicroWarehouses(): Promise<any[]> {
    return await this.request('/micro-warehouses');
  }

  async getMicroWarehouse(id: string): Promise<any> {
    return await this.request(`/micro-warehouses/${id}`);
  }

  async bookMicroWarehouse(bookingData: any): Promise<any> {
    return await this.request('/micro-warehouses/book', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getMicroWarehouseBookings(): Promise<any[]> {
    return await this.request('/micro-warehouses/bookings');
  }

  // AI Weather and Route Optimization (Direct to Python AI Service)
  async getDelhiWeather(): Promise<any> {
    const response = await fetch(`${AI_SERVICE_URL}/weather/delhi`);
    return await response.json();
  }

  async optimizeRoute(params: {
    origin: { lat: number; lon: number };
    destination: { lat: number; lon: number };
    departure_time?: string;
  }): Promise<any> {
    const response = await fetch(`${AI_SERVICE_URL}/route/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return await response.json();
  }

  async getIndustrialHubs(): Promise<any> {
    const response = await fetch(`${AI_SERVICE_URL}/industrial-hubs`);
    return await response.json();
  }



  // Health check
  async healthCheck(): Promise<any> {
    return await this.request('/health');
  }
}

// Create and export the API service instance
export const apiService = new ApiService(API_BASE_URL);

// Export utility functions
export { getAuthToken, setAuthToken, removeAuthToken };
