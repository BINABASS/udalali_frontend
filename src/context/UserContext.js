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
        if (userData && userData.role) {
          // Normalize role to lowercase for consistency
          const normalizedUser = {
            ...userData,
            role: userData.role.toLowerCase()
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

  const login = (userData, token) => {
    if (!userData || !userData.role) {
      throw new Error('User data must include a role');
    }
    // Normalize role to lowercase for consistency
    const normalizedUser = {
      ...userData,
      role: userData.role.toLowerCase()
    };
    setUser(normalizedUser);
    setRole(normalizedUser.role);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    if (token) {
      localStorage.setItem('token', token);
    }
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
