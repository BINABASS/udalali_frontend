import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.role || !formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      // Save new user to localStorage with a unique id
      const newUser = {
        id: Date.now(), // Unique user ID
        email: formData.email,
        password: formData.password,
        role: formData.role,
        name: formData.name
      };
      let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
      // Prevent duplicate email registration
      if (registeredUsers.some(u => u.email === newUser.email)) {
        setLoading(false);
        setError('An account with this email already exists.');
        return;
      }
      registeredUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      setLoading(false);
      setSuccess('Registration successful! You can now log in.');
      setFormData({ role: '', name: '', email: '', password: '', confirmPassword: '' });
      setTimeout(() => navigate('/login'), 2000);
    }, 1200);
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
                  placeholder="Create a password"
                  className={error && !formData.password ? 'error-input-pro' : ''}
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
                className={error && !formData.role ? 'error-input-pro' : ''}
              >
                <option value="">Select Role</option>
                <option value="seller">Seller</option>
                <option value="buyer">Buyer</option>
              </select>
            </div>
            <button type="submit" className="login-btn-pro" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
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