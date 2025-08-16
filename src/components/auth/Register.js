import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import './Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    role: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Form validation
    if (!formData.role || !formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Password strength validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare user data for registration
      const userData = {
        username: formData.email.split('@')[0], // Generate username from email
        email: formData.email,
        password: formData.password,
        first_name: formData.name.split(' ')[0],
        last_name: formData.name.split(' ').slice(1).join(' ') || formData.name.split(' ')[0],
        role: formData.role,
      };
      
      // Call the API to register the user
      await authService.register(userData);
      
      // If we get here, registration was successful
      setSuccess('Registration successful! Redirecting to login...');
      setFormData({ role: '', name: '', email: '', password: '', confirmPassword: '' });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            registrationSuccess: true,
            email: userData.email 
          } 
        });
      }, 1500);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error messages from the API
      if (error.response) {
        if (error.response.status === 400) {
          // Handle validation errors
          const errorData = error.response.data;
          const errorMessage = Object.values(errorData)[0]?.[0] || 'Invalid registration data';
          setError(errorMessage);
        } else if (error.response.status === 409) {
          setError('An account with this email already exists.');
        } else {
          setError('Registration failed. Please try again later.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-hero-bg">
      <div className="login-hero-overlay">
        <div className="login-card-pro">
          <div className="login-branding" style={{ marginBottom: '1.2rem' }}>
            <div className="login-logo-circle">
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="19" cy="19" r="19" fill="#3498db"/>
                <path d="M11 25V15.5L19 10L27 15.5V25C27 25.5523 26.5523 26 26 26H12C11.4477 26 11 25.5523 11 25Z" fill="white"/>
                <rect x="15" y="19" width="8" height="7" rx="1" fill="#2980b9"/>
              </svg>
            </div>
            <h2 className="login-title">Create your <span className="brand-accent">Digi Dalali <span className="brand-subtitle">(Udalali wa Kidijitali)</span></span> Account</h2>
            <p className="login-subtitle">Register as a Seller or Buyer to get started</p>
          </div>
          {error && <div className="login-error-pro" style={{ marginBottom: '0.7rem', padding: '0.6rem 0.7rem' }}>{error}</div>}
          {success && <div className="contact-success-pro" style={{ marginBottom: '0.7rem', padding: '0.6rem 0.7rem' }}>{success}</div>}
          <form className="login-form-pro register-form-grid" style={{ gap: '0.7rem' }} onSubmit={handleSubmit} autoComplete="off">
            <div className="register-row">
              <div className="form-group-pro" style={{ flex: 1, marginRight: '0.5rem' }}>
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className={error && !formData.name ? 'error-input-pro' : ''}
                  disabled={loading}
                />
              </div>
              <div className="form-group-pro" style={{ flex: 1, marginLeft: '0.5rem' }}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className={error && !formData.email ? 'error-input-pro' : ''}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="register-row">
              <div className="form-group-pro" style={{ flex: 1, marginRight: '0.5rem' }}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a password (min 8 characters)"
                  className={error && !formData.password ? 'error-input-pro' : ''}
                  disabled={loading}
                />
              </div>
              <div className="form-group-pro" style={{ flex: 1, marginLeft: '0.5rem' }}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                  className={error && !formData.confirmPassword ? 'error-input-pro' : ''}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group-pro">
              <label htmlFor="role">Register as</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className={`${error && !formData.role ? 'error-input-pro' : ''} ${loading ? 'disabled-select' : ''}`}
                disabled={loading}
              >
                <option value="">Select Role</option>
                <option value="seller">Seller</option>
                <option value="buyer">Buyer</option>
              </select>
            </div>
            <button type="submit" className="login-btn-pro" disabled={loading}>
              {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Registering...
              </>
            ) : 'Register'}
            </button>
          </form>
          <div className="login-links-pro" style={{ marginTop: '1.5rem' }}>
            <span>Already have an account?</span>
            <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 