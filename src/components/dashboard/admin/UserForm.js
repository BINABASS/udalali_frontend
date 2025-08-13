import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { userService } from '../../../services/api';
import { toast } from '../../ui/Toaster';
import './UserForm.css';

const UserForm = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    user_type: 'CUSTOMER',
    is_active: true,
    password: '',
    confirm_password: ''
  });

  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();
  const isEditMode = !!user?.id;

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        user_type: user.user_type || 'CUSTOMER',
        is_active: user.is_active !== undefined ? user.is_active : true,
        password: '',
        confirm_password: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!isEditMode || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createUser = useMutation(
    (userData) => userService.register(userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User created successfully');
        onClose();
      },
      onError: (error) => {
        const errorData = error.response?.data;
        if (errorData) {
          setErrors(prev => ({
            ...prev,
            ...errorData,
            non_field_errors: errorData.non_field_errors || []
          }));
        } else {
          toast.error('Failed to create user');
        }
      }
    }
  );

  const updateUser = useMutation(
    ({ id, ...userData }) => userService.updateUser(id, userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User updated successfully');
        onClose();
      },
      onError: (error) => {
        const errorData = error.response?.data;
        if (errorData) {
          setErrors(prev => ({
            ...prev,
            ...errorData,
            non_field_errors: errorData.non_field_errors || []
          }));
        } else {
          toast.error('Failed to update user');
        }
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const userData = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      user_type: formData.user_type,
      is_active: formData.is_active,
    };

    // Only include password if it's being set/updated
    if (formData.password) {
      userData.password = formData.password;
    }

    if (isEditMode) {
      updateUser.mutate({ id: user.id, ...userData });
    } else {
      createUser.mutate(userData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="user-form-modal">
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit User' : 'Add New User'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="user-form">
          {errors.non_field_errors?.map((error, index) => (
            <div key={index} className="alert alert-danger">{error}</div>
          ))}
          
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className={errors.first_name ? 'error' : ''}
            />
            {errors.first_name && <span className="error-message">{errors.first_name}</span>}
          </div>
          
          <div className="form-group">
            <label>Last Name *</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={errors.last_name ? 'error' : ''}
            />
            {errors.last_name && <span className="error-message">{errors.last_name}</span>}
          </div>
          
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              disabled={isEditMode}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label>User Type</label>
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="SELLER">Seller</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              Active
            </label>
          </div>
          
          <div className="form-group">
            <label>{isEditMode ? 'New Password' : 'Password *'}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder={isEditMode ? 'Leave blank to keep current password' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          {(formData.password || !isEditMode) && (
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className={errors.confirm_password ? 'error' : ''}
              />
              {errors.confirm_password && (
                <span className="error-message">{errors.confirm_password}</span>
              )}
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
              disabled={createUser.isLoading || updateUser.isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={createUser.isLoading || updateUser.isLoading}
            >
              {isEditMode ? 'Update User' : 'Create User'}
              {(createUser.isLoading || updateUser.isLoading) && '...'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
