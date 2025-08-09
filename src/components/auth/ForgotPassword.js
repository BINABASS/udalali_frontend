import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // For now, we'll just show a success message
    // In production, this would send a reset email
    setMessage('Password reset instructions have been sent to your email.');
    setEmail('');
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <div className="forgot-password-header">
          <h1>Forgot Password</h1>
          <p>Enter your email to reset your password</p>
        </div>

        {message && (
          <div className="message">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <button type="submit" className="submit-button">
            Send Reset Instructions
          </button>
        </form>

        <div className="back-link">
          <button onClick={() => navigate('/login')} className="back-button">
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
