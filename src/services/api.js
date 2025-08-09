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
      config.headers.Authorization = `Bearer ${token}`; // Changed to Bearer for JWT
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
  getCurrentUser: () => {
    // In a real app, you would decode the JWT token to get user info
    const user = localStorage.getItem('user');
    return Promise.resolve(user ? JSON.parse(user) : null);
  },
  register: (userData) => api.post('/users/register/', userData),
};

// Property service
export const propertyService = {
  getAllProperties: () => api.get('/properties/'),
  getProperty: (id) => api.get(`/properties/${id}/`),
  createProperty: (propertyData) => api.post('/properties/create/', propertyData),
  updateProperty: (id, propertyData) => api.put(`/properties/${id}/update/`, propertyData),
  deleteProperty: (id) => api.delete(`/properties/${id}/delete/`),
  // Property Images (using new /property-images/ endpoints)
  getPropertyImages: (propertyId) => api.get('/property-images/', { params: { property: propertyId } }),
  uploadPropertyImage: (propertyId, imageFile, caption = '') => {
    const formData = new FormData();
    formData.append('property', propertyId);
    formData.append('image', imageFile);
    if (caption) formData.append('caption', caption);
    return api.post('/property-images/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  setPrimaryImage: (imageId) => api.post(`/property-images/${imageId}/set_primary/`),
  deletePropertyImage: (imageId) => api.delete(`/property-images/${imageId}/`)
};

export const dashboardService = {
  getDashboardStats: () => api.get('/dashboard/stats'),
  getNotifications: () => api.get('/dashboard/notifications'),
  getRecentActivity: () => api.get('/dashboard/activity'),
  getPropertyDistribution: () => api.get('/dashboard/distribution')
};
