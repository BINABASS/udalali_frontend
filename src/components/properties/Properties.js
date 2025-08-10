import React, { useState, useEffect, useMemo } from 'react';
import PropertyForm from './PropertyForm';
import PropertyDetails from './PropertyDetails';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { propertyService } from '../../services/api';
import './Properties.css';
import { toast } from '../ui/Toaster';
import { useUser } from '../../context/UserContext';

const Properties = () => {
  const { user, role } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await propertyService.getAllProperties();
        setProperties(res.data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Failed to load properties');
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  const visibleProperties = useMemo(() => {
    if (!Array.isArray(properties)) return [];
    
    if (role === 'admin') {
      return properties;
    } else if (role === 'seller') {
      return user ? properties.filter(p => p.seller === user.id) : [];
    } else {
      return properties; // For buyers, show all properties
    }
  }, [properties, role, user]);

  const handleDelete = async (propertyId) => {
    const confirmed = window.confirm('Are you sure you want to delete this property?');
    if (confirmed) {
      try {
        await propertyService.deleteProperty(propertyId);
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        toast.success('Property deleted successfully!');
      } catch (error) {
        console.error('Error deleting property:', error);
        toast.error('Failed to delete property');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading properties...</p>
      </div>
    );
  }

  if (!Array.isArray(visibleProperties)) {
    return (
      <div className="error-container">
        <p>Error loading properties. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="properties-container-pro">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        {(role === 'admin' || role === 'seller') && (
          <button 
            className="add-button-pro" 
            onClick={() => {
              setEditingProperty(null);
              setShowForm(true);
            }}
          >
            Add New Property
          </button>
        )}
      </div>
      
      <div className="properties-grid-pro">
        {visibleProperties.length === 0 ? (
          <div className="no-properties">
            {role === 'seller' ? 
              'You have no properties listed yet. Click "Add New Property" to get started.' : 
              'No properties found.'}
          </div>
        ) : (
          visibleProperties.map((property) => (
            <div key={property.id} className="property-card-pro">
              <div className="property-image-pro">
                <img 
                  src={property.image || '/default-property.jpg'} 
                  alt={property.title} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-property.jpg';
                  }}
                />
                <span className={`status-badge-pro ${property.is_available ? 'available' : 'unavailable'}`}>
                  {property.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="property-content-pro">
                <h3>{property.title}</h3>
                <div className="property-details-pro">
                  <span>{property.location}</span>
                </div>
                <div className="property-price-pro">${property.price?.toLocaleString()}</div>
                <div className="property-actions-pro">
                  <button 
                    onClick={() => { 
                      setSelectedProperty(property); 
                      setShowDetails(true); 
                    }}
                    title="View Details"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  {(role === 'admin' || (role === 'seller' && property.seller === user?.id)) && (
                    <>
                      <button 
                        onClick={() => { 
                          setEditingProperty(property); 
                          setShowForm(true); 
                        }}
                        title="Edit Property"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        onClick={() => handleDelete(property.id)}
                        title="Delete Property"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <PropertyForm 
          onClose={() => setShowForm(false)} 
          property={editingProperty} 
          onSave={(savedProperty) => {
            if (editingProperty) {
              setProperties(prev => 
                prev.map(p => p.id === savedProperty.id ? savedProperty : p)
              );
            } else {
              setProperties(prev => [savedProperty, ...prev]);
            }
            setShowForm(false);
          }} 
        />
      )}

      {showDetails && selectedProperty && (
        <PropertyDetails 
          property={selectedProperty} 
          onClose={() => setShowDetails(false)} 
        />
      )}
    </div>
  );
};

export default Properties;