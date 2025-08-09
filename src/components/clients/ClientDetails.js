import React from 'react';
import './Clients.css';

const ClientDetails = ({ client, onClose }) => {
  return (
    <div className="client-details-modal">
      <div className="client-details">
        <button
          className="close-btn"
          onClick={onClose}
        >
          <i className="fas fa-times"></i>
        </button>
        
        <div className="client-detail-header">
          <div className="client-avatar">
            <img src={client.avatar} alt={client.name} />
          </div>
          <div className="client-info-header">
            <h2>{client.name}</h2>
            <div className="client-type-badge">
              {client.type === 'individual' ? 'Individual' : 'Company'}
            </div>
            <div className="client-status">
              {client.status === 'active' ? (
                <span className="status-badge active">Active</span>
              ) : (
                <span className="status-badge inactive">Inactive</span>
              )}
            </div>
          </div>
        </div>

        <div className="client-detail-section">
          <h3>Contact Information</h3>
          <div className="detail-item">
            <i className="fas fa-envelope"></i>
            {client.email}
          </div>
          <div className="detail-item">
            <i className="fas fa-phone"></i>
            {client.phone}
          </div>
          <div className="detail-item">
            <i className="fas fa-map-marker-alt"></i>
            {client.address}
          </div>
          {client.company && (
            <div className="detail-item">
              <i className="fas fa-building"></i>
              {client.company}
            </div>
          )}
        </div>

        <div className="client-detail-section">
          <h3>Booking Statistics</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <div className="stat-value">{client.totalBookings}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">${client.totalSpent}</div>
              <div className="stat-label">Total Spent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
