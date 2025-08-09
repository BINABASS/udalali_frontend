import React, { useState } from 'react';
import { toast } from '../ui/Toaster';
import Skeleton from 'react-loading-skeleton';
import './PropertyDetails.css';
import '../ui/uiComponents.css';
import PropertyForm from './PropertyForm';

const PropertyDetails = ({ property, onClose }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  // Handle property deletion
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get updated properties from localStorage
      const properties = JSON.parse(localStorage.getItem('properties')) || [];
      // Filter out the property to be deleted
      const updatedProperties = properties.filter(p => p.id !== property.id);
      // Save updated properties
      localStorage.setItem('properties', JSON.stringify(updatedProperties));
      
      // Show success message
      toast.success('Property deleted successfully!');
      
      // Close details modal
      onClose();
    } catch (err) {
      setError('Failed to delete property');
      toast.error('Failed to delete property');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="property-details-modal">
      <div className="property-details-content">
        <div className="property-details-header">
          <h2 className="property-details-title" aria-label={`Property details for ${property.title}`}>
            {property.title}
          </h2>
          <button 
            className="close-btn" 
            onClick={handleClose}
            aria-label="Close property details"
          >
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div className="property-header">
          <div className="property-image">
            <img src={property.image} alt={property.title} />
            <div className="image-overlay">
              <h2 className="property-title-overlay">{property.title}</h2>
              <div className="property-price-overlay">
                ${property.price}
              </div>
            </div>
          </div>
          <div className="property-info-header">
            <div className="property-price-status">
              <div className="price-tag">
                ${property.price}
              </div>
              <div className={`status-badge ${property.is_available ? 'available' : 'unavailable'}`}>
                {property.is_available ? 'Available' : 'Unavailable'}
              </div>
            </div>
            <div className="property-location">
              <span>{property.location}</span>
            </div>
            <div className="property-type">
              <span>{property.property_type}</span>
            </div>
          </div>
        </div>
        <div className="property-description">
          <p>{property.description}</p>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
