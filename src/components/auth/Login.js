import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { authService } from '../../services/api';
import './Login.css';

const Login = () => {
  const { login } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // 1. Get JWT token
      const response = await authService.login(formData.username, formData.password);
      const { access: token, refresh } = response.data;
      
      // 2. Store the tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refresh);
      
      // 3. Get user data based on username (temporary solution)
      let userData;
      switch(formData.username) {
        case 'testadmin':
          userData = {
            id: 1,
            username: 'testadmin',
            email: 'admin@example.com',
            user_type: 'ADMIN',
            role: 'admin'
          };
          break;
        case 'testseller':
          userData = {
            id: 2,
            username: 'testseller',
            email: 'seller@example.com',
            user_type: 'SELLER',
            role: 'seller'
          };
          break;
        default:
          // Default to buyer
          userData = {
            id: 3,
            username: formData.username,
            email: `${formData.username}@example.com`,
            user_type: 'BUYER',
            role: 'buyer'
          };
      }
      
      // 4. Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // 5. Update user context
      login(userData);
      
      // 6. Redirect based on role
      const redirectPath = {
        'admin': '/dashboard',
        'seller': '/seller',
        'buyer': '/buyer'
      }[userData.role] || '/';
      
      navigate(redirectPath);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-hero-bg">
      <div className="login-hero-overlay">
        <div className="login-card-pro">
          <div className="login-branding">
            <div className="login-logo-circle">
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="19" cy="19" r="19" fill="#3498db"/>
                <path d="M11 25V15.5L19 10L27 15.5V25C27 25.5523 26.5523 26 26 26H12C11.4477 26 11 25.5523 11 25Z" fill="white"/>
                <rect x="15" y="19" width="8" height="7" rx="1" fill="#2980b9"/>
              </svg>
            </div>
            <h2 className="login-title">Sign in to <span className="brand-accent">Digi Dalali <span className="brand-subtitle">(Udalali wa Kidijitali)</span></span></h2>
            <p className="login-subtitle">Access your dashboard by logging in with your role</p>
          </div>
          {error && <div className="login-error-pro">{error}</div>}
          <form className="login-form-pro" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group-pro">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className={error ? 'error-input-pro' : ''}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>
            <div className="form-group-pro">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Enter your password"
                className={error ? 'error-input-pro' : ''}
              />
            </div>
            <button type="submit" className="login-btn-pro" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="login-links-pro">
            <Link to="/forgot-password">Forgot Password?</Link>
            <span> | </span>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
