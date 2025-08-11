import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage if available
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (savedUser && token) {
        const userData = JSON.parse(savedUser);
        if (userData) {
          // Map CUSTOMER to buyer for frontend compatibility
          const roleMap = {
            'CUSTOMER': 'buyer',
            'BUYER': 'buyer',
            'SELLER': 'seller',
            'ADMIN': 'admin'
          };
          
          const role = userData.user_type 
            ? (roleMap[userData.user_type.toUpperCase()] || 'buyer')
            : 'buyer';
            
          const normalizedUser = {
            ...userData,
            role: role.toLowerCase()
          };
          
          setUser(normalizedUser);
          setRole(normalizedUser.role);
          // Update localStorage with normalized data
          localStorage.setItem('user', JSON.stringify(normalizedUser));
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      setUser(null);
      setRole(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    if (!userData) {
      throw new Error('No user data provided');
    }
    
    // Ensure user_type is set, default to 'CUSTOMER' if not
    if (!userData.user_type) {
      userData.user_type = 'CUSTOMER';
    }
    
    // Map CUSTOMER to buyer for frontend compatibility
    const roleMap = {
      'CUSTOMER': 'buyer',
      'BUYER': 'buyer',
      'SELLER': 'seller',
      'ADMIN': 'admin'
    };
    
    const role = roleMap[userData.user_type.toUpperCase()] || 'buyer';
    
    // Create normalized user with consistent role
    const normalizedUser = {
      ...userData,
      role: role.toLowerCase()
    };
    
    console.log('Setting user context:', normalizedUser);
    setUser(normalizedUser);
    setRole(normalizedUser.role);
    // Don't store the entire user object, just what we need
    localStorage.setItem('user', JSON.stringify({
      id: normalizedUser.id,
      username: normalizedUser.username,
      email: normalizedUser.email,
      user_type: normalizedUser.user_type,
      role: normalizedUser.role,
      first_name: normalizedUser.first_name,
      last_name: normalizedUser.last_name
    }));
    
    // The token is already stored in localStorage by the login component
    // before this function is called
  };

  const logout = async () => {
    try {
      // Call the logout API to invalidate the token
      const token = localStorage.getItem('token');
      if (token) {
        // Note: The API call might fail if the token is already invalid/expired
        // but we still want to proceed with local cleanup
        try {
          await authService.logout();
        } catch (error) {
          console.error('Error during logout API call:', error);
        }
      }
    } finally {
      // Always clear local state and storage
      setUser(null);
      setRole(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const value = {
    user,
    role,
    loading,
    isAuthenticated: !!user,
    login,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
