import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    propertyService.getAllProperties().then(res => {
      setProperties(res.data);
    });
  }, []);

  // For admin, show all properties. For seller, filter by sellerId. For buyer, show all properties.
  const visibleProperties =
    role === 'admin'
      ? properties
      : role === 'seller'
        ? user ? properties.filter(p => p.seller === user.id) : []
        : properties; // For buyers, show all properties

  const handleDelete = async (propertyId) => {
    const confirmed = window.confirm('Are you sure you want to delete this property?');
    if (confirmed) {
      await propertyService.deleteProperty(propertyId);
      setProperties(properties.filter(p => p.id !== propertyId));
      toast.success('Property deleted successfully!');
    }
  };

  return (
    <div className="properties-container-pro">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        {(role === 'admin' || role === 'seller') && (
          <button className="add-button-pro" onClick={() => {
            setEditingProperty(null);
            setShowForm(true);
          }}>
            Add New Property
          </button>
        )}
      </div>
      <div className="properties-grid-pro">
        {visibleProperties.map((property) => (
          <div key={property.id} className="property-card-pro">
            <div className="property-image-pro">
              <img src={property.image} alt={property.title} />
              <span className={`status-badge-pro ${property.is_available ? 'available' : 'unavailable'}`}>{property.is_available ? 'Available' : 'Unavailable'}</span>
            </div>
            <div className="property-content-pro">
              <h3>{property.title}</h3>
              <div className="property-details-pro">
                <span>{property.location}</span>
              </div>
              <div className="property-price-pro">${property.price}</div>
              <div className="property-actions-pro">
                <button onClick={() => { setSelectedProperty(property); setShowDetails(true); }}><FontAwesomeIcon icon={faEye} /></button>
                {(role === 'admin' || (role === 'seller' && property.seller === user.id)) && (
                  <>
                    <button onClick={() => { setEditingProperty(property); setShowForm(true); }}><FontAwesomeIcon icon={faEdit} /></button>
                    <button onClick={() => handleDelete(property.id)}><FontAwesomeIcon icon={faTrash} /></button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {showForm && <PropertyForm onClose={() => setShowForm(false)} property={editingProperty} />}
      {showDetails && <PropertyDetails property={selectedProperty} onClose={() => setShowDetails(false)} />}
    </div>
  );
};

export default Properties;
