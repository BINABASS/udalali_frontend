import axios from 'axios';

// Create API instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to extract error messages from API responses
const extractErrorMessage = (error) => {
  if (!error.response) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  const { status, data } = error.response;
  
  // Handle common error statuses
  switch (status) {
    case 400:
      // Handle validation errors
      if (data && typeof data === 'object') {
        // Extract the first error message from the response
        const firstErrorKey = Object.keys(data)[0];
        const firstError = Array.isArray(data[firstErrorKey]) 
          ? data[firstErrorKey][0]
          : data[firstErrorKey];
        return firstError || 'Invalid data provided';
      }
      return data?.detail || 'Bad request. Please check your input and try again.';
      
    case 401:
      return 'Your session has expired. Please log in again.';
      
    case 403:
      return 'You do not have permission to perform this action.';
      
    case 404:
      return 'The requested resource was not found.';
      
    case 500:
      return 'An unexpected server error occurred. Please try again later.';
      
    default:
      return data?.detail || 'An error occurred. Please try again.';
  }
};

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = extractErrorMessage(error);
    
    // Handle unauthorized access
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('login')) {
        // Store the current path to redirect back after login
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/login';
      }
    }
    
    // Enhance the error with a user-friendly message
    const enhancedError = new Error(errorMessage);
    enhancedError.status = error.response?.status;
    enhancedError.details = error.response?.data;
    
    return Promise.reject(enhancedError);
  }
);

// Authentication service
export const authService = {
  login: (username, password) => api.post('/token/', { username, password }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me/');
      const userData = response.data;
      // Store the user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If there's an error, try to get from localStorage as fallback
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
  },
  register: (userData) => api.post('/users/register/', userData),
};

// Property service
export const propertyService = {
  // Basic CRUD operations
  getAllProperties: () => api.get('/properties/'),
  getProperty: (id) => api.get(`/properties/${id}/`),
  createProperty: (propertyData) => api.post('/properties/', propertyData),
  updateProperty: (id, propertyData) => api.put(`/properties/${id}/`, propertyData),
  deleteProperty: (id) => api.delete(`/properties/${id}/`),
  
  // Property Images (nested under properties)
  getPropertyImages: (propertyId) => api.get(`/properties/${propertyId}/images/`),
  uploadPropertyImage: (propertyId, imageFile, caption = '') => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (caption) formData.append('caption', caption);
    return api.post(`/properties/${propertyId}/images/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  setPrimaryImage: (propertyId, imageId) => 
    api.post(`/properties/${propertyId}/images/${imageId}/set_primary/`),
  deletePropertyImage: (propertyId, imageId) => 
    api.delete(`/properties/${propertyId}/images/${imageId}/`)
};

// Dashboard service
export const dashboardService = {
  getDashboardStats: () => api.get('/dashboard/stats/'),
  getNotifications: () => api.get('/dashboard/notifications/'),
  getRecentActivity: () => api.get('/dashboard/activity/'),
  getPropertyDistribution: () => api.get('/dashboard/property-distribution/'),
};

/**
 * Booking service with enhanced error handling and additional functionality
 */
export const bookingService = {
  /**
   * Create a new booking
   * @param {Object} bookingData - The booking data to create
   * @returns {Promise} A promise that resolves to the created booking
   * @throws {Error} If the booking cannot be created
   */
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings/', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error(error.message || 'Failed to create booking. Please try again.');
    }
  },
  
  /**
   * Get all bookings (for admin) or user's bookings
   * @param {Object} params - Query parameters for filtering/sorting
   * @returns {Promise} A promise that resolves to the list of bookings
   * @throws {Error} If the bookings cannot be retrieved
   */
  getBookings: async (params = {}) => {
    try {
      const response = await api.get('/bookings/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw new Error(error.message || 'Failed to load bookings. Please try again.');
    }
  },
  
  /**
   * Get a specific booking by ID
   * @param {string|number} id - The ID of the booking to retrieve
   * @returns {Promise} A promise that resolves to the booking details
   * @throws {Error} If the booking cannot be found or accessed
   */
  getBooking: async (id) => {
    try {
      const response = await api.get(`/bookings/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking ${id}:`, error);
      throw new Error(error.message || 'Failed to load booking details. Please try again.');
    }
  },
  
  /**
   * Update a booking
   * @param {string|number} id - The ID of the booking to update
   * @param {Object} bookingData - The updated booking data
   * @returns {Promise} A promise that resolves to the updated booking
   * @throws {Error} If the booking cannot be updated
   */
  updateBooking: async (id, bookingData) => {
    try {
      const response = await api.put(`/bookings/${id}/`, bookingData);
      return response.data;
    } catch (error) {
      console.error(`Error updating booking ${id}:`, error);
      throw new Error(error.message || 'Failed to update booking. Please try again.');
    }
  },
  
  /**
   * Cancel a booking
   * @param {string|number} id - The ID of the booking to cancel
   * @param {string} [reason] - Optional reason for cancellation
   * @returns {Promise} A promise that resolves when the booking is cancelled
   * @throws {Error} If the booking cannot be cancelled
   */
  cancelBooking: async (id, reason) => {
    try {
      const response = await api.post(`/bookings/${id}/cancel/`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Error cancelling booking ${id}:`, error);
      throw new Error(error.message || 'Failed to cancel booking. Please try again.');
    }
  },
  
  /**
   * Check property availability for given dates
   * @param {Object} params - Object containing property_id, start_date, and end_date
   * @returns {Promise<Object>} Object with availability status and message
   */
  checkAvailability: async (params) => {
    try {
      const { property_id, start_date, end_date } = params;
      const response = await api.get(`/properties/${property_id}/availability/`, {
        params: { start_date, end_date }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking availability:', error);
      return {
        available: false,
        message: error.response?.data?.message || 'Unable to check availability. Please try again.'
      };
    }
  },
  
  /**
   * Get bookings for a specific property (for property owners)
   * @param {string|number} propertyId - The ID of the property
   * @param {Object} [params] - Additional query parameters
   * @returns {Promise} A promise that resolves to the list of property bookings
   * @throws {Error} If the bookings cannot be retrieved
   */
  getPropertyBookings: async (propertyId, params = {}) => {
    try {
      const response = await api.get(`/properties/${propertyId}/bookings/`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching bookings for property ${propertyId}:`, error);
      throw new Error(error.message || 'Failed to load property bookings. Please try again.');
    }
  },
  
  /**
   * Get user's bookings
   * @param {string|number} userId - The ID of the user
   * @param {Object} [params] - Additional query parameters
   * @returns {Promise} A promise that resolves to the list of user's bookings
   * @throws {Error} If the bookings cannot be retrieved
   */
  getUserBookings: async (userId, params = {}) => {
    try {
      // Use the main bookings endpoint which returns the current user's bookings
      const response = await api.get('/bookings/', { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching bookings for user ${userId}:`, error);
      throw new Error(error.message || 'Failed to load your bookings. Please try again.');
    }
  },
  
  /**
   * Get the current user's bookings
   * @param {Object} [params] - Additional query parameters
   * @returns {Promise} A promise that resolves to the list of current user's bookings
   * @throws {Error} If the bookings cannot be retrieved
   */
  getMyBookings: async (params = {}) => {
    try {
      // Use the correct endpoint to fetch the current user's bookings
      const response = await api.get('/bookings/my_bookings/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching current user\'s bookings:', error);
      throw new Error(error.message || 'Failed to load your bookings. Please try again.');
    }
  },

  /**
   * Confirm a pending booking (seller only)
   * @param {string|number} bookingId - The ID of the booking to confirm
   * @returns {Promise} A promise that resolves when the booking is confirmed
   * @throws {Error} If the booking cannot be confirmed
   */
  confirmBooking: async (bookingId) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/confirm/`);
      return response.data;
    } catch (error) {
      console.error(`Error confirming booking ${bookingId}:`, error);
      throw new Error(error.response?.data?.error || 'Failed to confirm booking. Please try again.');
    }
  },

  /**
   * Reject a pending booking (seller only)
   * @param {string|number} bookingId - The ID of the booking to reject
   * @returns {Promise} A promise that resolves when the booking is rejected
   * @throws {Error} If the booking cannot be rejected
   */
  rejectBooking: async (bookingId) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/reject/`);
      return response.data;
    } catch (error) {
      console.error(`Error rejecting booking ${bookingId}:`, error);
      throw new Error(error.response?.data?.error || 'Failed to reject booking. Please try again.');
    }
  },

  /**
   * Get all bookings for properties owned by the current seller
   * @param {Object} [params] - Additional query parameters (status, property)
   * @returns {Promise} A promise that resolves to the list of seller's property bookings
   * @throws {Error} If the bookings cannot be retrieved
   */
  getSellerBookings: async (params = {}) => {
    try {
      const response = await api.get('/bookings/seller_bookings/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching seller bookings:', error);
      throw new Error(error.response?.data?.error || 'Failed to load property bookings. Please try again.');
    }
  },


  
  /**
   * Get booking statistics
   * @param {string} [period='month'] - The time period for statistics (day, week, month, year)
   * @returns {Promise} A promise that resolves to booking statistics
   */
  getBookingStats: async (period = 'month') => {
    try {
      const response = await api.get('/bookings/stats/', { params: { period } });
      return response.data;
    } catch (error) {
      console.error('Error fetching booking statistics:', error);
      return {
        total: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
        revenue: 0,
        period: period,
        data: []
      };
    }
  }
};

export default api;