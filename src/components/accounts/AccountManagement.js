import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import './AccountManagement.css';
import { useUser } from '../../context/UserContext';
import { toast } from '../ui/Toaster';

const AccountManagement = () => {
  const { user, login } = useUser();
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        user_type: user.user_type || '',
        is_verified: user.is_verified || false,
        password: '',
      });
    }
  }, [user]);

  if (!user) {
    return <div className="accounts-page"><p>Loading your account...</p></div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Save to localStorage and update context
    const updatedUser = {
      ...user,
      ...formData,
      password: undefined // Don't store password in plain text
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    login(updatedUser); // Update context
    setIsEditing(false);
    toast.success('Account details updated!');
  };

  return (
    <div className="accounts-page seller-settings-page">
      <div className="account-settings-card">
        <h2>My Account Details</h2>
        <form className="account-settings-form" onSubmit={handleSave}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData?.username || ''}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData?.email || ''}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData?.phone || ''}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>User Type</label>
            <input
              type="text"
              name="user_type"
              value={formData?.user_type || ''}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>
          <div className="form-group">
            <label>Verified</label>
            <input
              type="checkbox"
              name="is_verified"
              checked={formData?.is_verified || false}
              onChange={e => setFormData(prev => ({ ...prev, is_verified: e.target.checked }))}
              disabled
            />
          </div>
          {/* Optional: Password change */}
          {/* <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="password"
              value={formData?.password || ''}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div> */}
          <div className="form-actions">
            {isEditing ? (
              <button type="submit" className="save-btn">
                <FontAwesomeIcon icon={faSave} /> Save Changes
              </button>
            ) : (
              <button type="button" className="edit-btn" onClick={() => setIsEditing(true)}>
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountManagement;
