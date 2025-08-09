import React from 'react';
import './SellerDetails.css';

const SellerDetails = ({ seller }) => {
  return (
    <div className="seller-details">
      <div className="seller-header">
        <h2>Seller Profile</h2>
        <div className="seller-actions">
          <button className="edit-btn">
            <i className="fas fa-edit"></i>
            Edit Profile
          </button>
          <button className="status-btn">
            <i className="fas fa-check-circle"></i>
            Active
          </button>
        </div>
      </div>
      
      <div className="seller-info">
        <div className="info-section">
          <h3>Personal Information</h3>
          <div className="info-item">
            <span className="label">Full Name:</span>
            <span className="value">{seller.fullName}</span>
          </div>
          <div className="info-item">
            <span className="label">Email:</span>
            <span className="value">{seller.email}</span>
          </div>
          <div className="info-item">
            <span className="label">Phone:</span>
            <span className="value">{seller.phoneNumber}</span>
          </div>
        </div>

        <div className="info-section">
          <h3>Company Information</h3>
          <div className="info-item">
            <span className="label">Company:</span>
            <span className="value">{seller.company}</span>
          </div>
          <div className="info-item">
            <span className="label">Address:</span>
            <span className="value">{seller.address}</span>
          </div>
        </div>

        <div className="info-section">
          <h3>Description</h3>
          <p className="description">{seller.description}</p>
        </div>
      </div>

      <div className="seller-stats">
        <div className="stat-card">
          <h3>Properties Listed</h3>
          <p className="stat-number">{seller.properties || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Views</h3>
          <p className="stat-number">{seller.views || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Inquiries</h3>
          <p className="stat-number">{seller.inquiries || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default SellerDetails;
