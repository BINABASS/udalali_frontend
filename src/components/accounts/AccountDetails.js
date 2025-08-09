import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEnvelope, faPhone, faMapMarkerAlt, faHome, faCalendar, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import './AccountManagement.css';

const AccountDetails = ({ account, onClose }) => {
  return (
    <div className="account-details-modal">
      <div className="account-details">
        <button
          className="close-btn"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <div className="account-detail-header">
          <div className="account-info-header">
            <h2>{account.fullName}</h2>
            <div className="account-type-badge">
              {account.type === 'client' ? 'Client' : 
               account.type === 'owner' ? 'Property Owner' : 'Seller'}
            </div>
            <div className="account-status">
              {account.status === 'active' ? (
                <span className="status-badge active">Active</span>
              ) : (
                <span className="status-badge inactive">Inactive</span>
              )}
            </div>
          </div>
        </div>

        <div className="account-detail-section">
          <h3>Contact Information</h3>
          <div className="detail-item">
            <FontAwesomeIcon icon={faEnvelope} />
            {account.email}
          </div>
          <div className="detail-item">
            <FontAwesomeIcon icon={faPhone} />
            {account.phone}
          </div>
          <div className="detail-item">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            {account.address}
          </div>
        </div>

        <div className="account-detail-section">
          <h3>Account Information</h3>
          <div className="detail-item">
            <FontAwesomeIcon icon={faCalendar} />
            Created: {new Date(account.createdAt).toLocaleDateString()}
          </div>
          <div className="detail-item">
            <FontAwesomeIcon icon={faSignInAlt} />
            Last Login: {new Date(account.lastLogin).toLocaleDateString()}
          </div>
        </div>

        <div className="account-detail-section">
          <h3>Properties</h3>
          {account.properties.length > 0 ? (
            <div className="properties-grid">
              {account.properties.map((property, index) => (
                <div key={index} className="property-item">
                  <FontAwesomeIcon icon={faHome} />
                  <span>{property}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No properties associated with this account</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
