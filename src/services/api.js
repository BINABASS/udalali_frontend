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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
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

// Booking service
export const bookingService = {
  // Create a new booking
  createBooking: (bookingData) => api.post('/bookings/', bookingData),
  
  // Get all bookings (for admin) or user's bookings
  getBookings: (params = {}) => api.get('/bookings/', { params }),
  
  // Get a specific booking by ID
  getBooking: (id) => api.get(`/bookings/${id}/`),
  
  // Update a booking
  updateBooking: (id, bookingData) => api.put(`/bookings/${id}/`, bookingData),
  
  // Cancel a booking
  cancelBooking: (id) => api.post(`/bookings/${id}/cancel/`),
  
  // Get bookings for a specific property (for property owners)
  getPropertyBookings: (propertyId) => api.get(`/properties/${propertyId}/bookings/`),
  
  // Get user's bookings
  getUserBookings: (userId) => api.get(`/users/${userId}/bookings/`),
};

export default api;