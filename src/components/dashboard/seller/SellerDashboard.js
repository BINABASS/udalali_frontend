import React, { useState } from 'react';
import './SellerDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faEye, faEnvelope, faClock, faDollarSign, faEdit, faInfoCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from '../../ui/Toaster';
import PropertyForm from '../../properties/PropertyForm';
import PropertyDetails from '../../properties/PropertyDetails';
import { useUser } from '../../../context/UserContext';

const SellerDashboard = () => {
  const { user } = useUser();
  // Load properties from localStorage, fallback to initialProperties
  const [properties, setProperties] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('properties')) || [];
    return saved.filter(p => p.sellerId === user?.id) || [];
  });
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Stats calculation
  const stats = {
    totalProperties: properties.length,
    totalViews: properties.reduce((sum, p) => sum + (p.views || 0), 0),
    totalInquiries: properties.reduce((sum, p) => sum + (p.inquiries || 0), 0),
    averagePrice: properties.length ? Math.round(properties.reduce((sum, p) => sum + (p.price || 0), 0) / properties.length) : 0
  };

  // Add or update property
  const handleSaveProperty = (property) => {
    if (editingProperty) {
      // Edit
      const updated = properties.map(p => p.id === editingProperty.id ? { ...property, id: editingProperty.id, sellerId: user.id } : p);
      setProperties(updated);
      // Update localStorage
      const allProps = JSON.parse(localStorage.getItem('properties')) || [];
      const merged = allProps.map(p => p.id === editingProperty.id ? { ...property, id: editingProperty.id, sellerId: user.id } : p);
      localStorage.setItem('properties', JSON.stringify(merged));
      toast.success('Property updated successfully!');
    } else {
      // Add
      const newProperty = { ...property, id: Date.now(), lastUpdated: new Date().toISOString(), sellerId: user.id };
      const updated = [newProperty, ...properties];
      setProperties(updated);
      // Update localStorage
      const allProps = JSON.parse(localStorage.getItem('properties')) || [];
      localStorage.setItem('properties', JSON.stringify([newProperty, ...allProps]));
      toast.success('Property added successfully!');
    }
    setShowForm(false);
    setEditingProperty(null);
  };

  // Delete property
  const handleDeleteProperty = (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      const updated = properties.filter(p => p.id !== id);
      setProperties(updated);
      // Update localStorage
      const allProps = JSON.parse(localStorage.getItem('properties')) || [];
      const merged = allProps.filter(p => p.id !== id);
      localStorage.setItem('properties', JSON.stringify(merged));
      toast.success('Property deleted successfully!');
    }
  };

  return (
    <div className="seller-dashboard-pro">
      <div className="dashboard-stats-pro">
        <div className="stat-card-pro glassy-pro gradient-pro">
          <div className="stat-icon-pro stat-bg1"><FontAwesomeIcon icon={faHome} /></div>
          <div>
            <h3>Total Properties</h3>
            <p className="stat-number-pro">{stats.totalProperties}</p>
            <div className="stat-details-pro">
              <span className="stat-label-pro">Active</span>
              <span className="stat-value-pro">{properties.filter(p => p.status === 'Available').length}</span>
            </div>
          </div>
        </div>
        <div className="stat-card-pro glassy-pro gradient-pro">
          <div className="stat-icon-pro stat-bg2"><FontAwesomeIcon icon={faEye} /></div>
          <div>
            <h3>Total Views</h3>
            <p className="stat-number-pro">{stats.totalViews}</p>
            <div className="stat-details-pro">
              <span className="stat-label-pro">This Month</span>
              <span className="stat-value-pro">+15%</span>
            </div>
          </div>
        </div>
        <div className="stat-card-pro glassy-pro gradient-pro">
          <div className="stat-icon-pro stat-bg3"><FontAwesomeIcon icon={faEnvelope} /></div>
          <div>
            <h3>Inquiries</h3>
            <p className="stat-number-pro">{stats.totalInquiries}</p>
            <div className="stat-details-pro">
              <span className="stat-label-pro">Pending</span>
              <span className="stat-value-pro">{properties.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.inquiries || 0), 0)}</span>
            </div>
          </div>
        </div>
        <div className="stat-card-pro glassy-pro gradient-pro">
          <div className="stat-icon-pro stat-bg4"><FontAwesomeIcon icon={faDollarSign} /></div>
          <div>
            <h3>Avg. Price</h3>
            <p className="stat-number-pro">${stats.averagePrice.toLocaleString()}</p>
            <div className="stat-details-pro">
              <span className="stat-label-pro">Market Avg</span>
              <span className="stat-value-pro">+5%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="properties-grid-pro">
        {properties.map((property) => (
          <div key={property.id} className="property-card-pro glassy-pro">
            <div className="property-avatar-pro">
              <img src={property.image} alt={property.title} />
            </div>
            <div className="property-header-pro">
              <h3>{property.title}</h3>
              <span className={`status-badge-pro ${property.status.toLowerCase()}-pro`}>
                {property.status}
              </span>
            </div>
            <div className="property-metrics-pro">
              <div className="metric-pro"><FontAwesomeIcon icon={faEye} /> <span>{property.views} Views</span></div>
              <div className="metric-pro"><FontAwesomeIcon icon={faEnvelope} /> <span>{property.inquiries} Inquiries</span></div>
              <div className="metric-pro"><FontAwesomeIcon icon={faClock} /> <span>Updated {new Date(property.lastUpdated).toLocaleDateString()}</span></div>
            </div>
            <div className="property-actions-pro">
              <button className="edit-btn-pro" onClick={() => { setEditingProperty(property); setShowForm(true); }}>
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
              <button className="view-btn-pro" onClick={() => { setSelectedProperty(property); setShowDetails(true); }}>
                <FontAwesomeIcon icon={faInfoCircle} /> View Details
              </button>
              <button className="delete-btn-pro" onClick={() => handleDeleteProperty(property.id)}>
                <FontAwesomeIcon icon={faTrash} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <PropertyForm
          onClose={() => { setShowForm(false); setEditingProperty(null); }}
          onSubmit={handleSaveProperty}
          property={editingProperty}
        />
      )}
      {showDetails && selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          onClose={() => { setShowDetails(false); setSelectedProperty(null); }}
        />
      )}
    </div>
  );
};

export default SellerDashboard;
