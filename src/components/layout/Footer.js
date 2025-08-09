import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Digi Dalali <span className="brand-subtitle">(Udalali wa Kidijitali)</span></h3>
          <p>Your trusted real estate partner</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/properties">Properties</a></li>
            <li><a href="/bookings">Bookings</a></li>
            <li><a href="/messaging">Messaging</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: info@digitalbrokerage.com</p>
          <p>Phone: (555) 123-4567</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Digi Dalali <span className="brand-subtitle">(Udalali wa Kidijitali)</span>. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
