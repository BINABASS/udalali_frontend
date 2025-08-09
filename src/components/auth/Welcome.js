import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUsers, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import './Welcome.css';

const Welcome = () => {
  return (
    <div className="welcome-hero-bg">
      <div className="welcome-hero-overlay">
        <div className="welcome-hero-content">
          <h1 className="welcome-hero-title">Welcome to <span className="brand-accent">Digi Dalali <span className="brand-subtitle">(Udalali wa Kidijitali)</span></span></h1>
          <p className="welcome-hero-subtitle">Your trusted real estate management platform</p>
          <div className="welcome-features-grid">
            <div className="feature-card-pro">
              <div className="feature-icon-pro">
                <FontAwesomeIcon icon={faBuilding} />
              </div>
              <h3>Property Management</h3>
              <p>Effortlessly manage your property portfolio with advanced tools and analytics.</p>
            </div>
            <div className="feature-card-pro">
              <div className="feature-icon-pro">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3>Client Management</h3>
              <p>Track and manage client interactions for seamless communication and service.</p>
            </div>
            <div className="feature-card-pro">
              <div className="feature-icon-pro">
                <FontAwesomeIcon icon={faCalendarCheck} />
              </div>
              <h3>Booking System</h3>
              <p>Streamline your booking process with our intuitive and reliable system.</p>
            </div>
          </div>
          <div className="welcome-cta-buttons">
            <Link to="/login" className="cta-button-pro primary">Login with your role</Link>
            <Link to="/contact" className="cta-button-pro secondary">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
