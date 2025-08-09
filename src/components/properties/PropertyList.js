import React, { useState } from 'react';
import './PropertyList.css';

const PropertyList = () => {
  const [properties, setProperties] = useState([
    {
      id: 1,
      title: 'Luxury Villa',
      location: 'Downtown',
      type: 'villa',
      price: 889000,
      status: 'available',
      beds: 4,
      baths: 3,
      size: '4200 sqft',
      amenities: ['garden', 'wifi', 'pet-friendly', 'pool', 'gym', 'spa'],
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
      features: [
        'Modern Architecture',
        'Premium Location',
        '24/7 Security',
        'Smart Home System',
        'Attached Garage',
        'High Ceiling'
      ],
      description: 'Luxurious villa located in the heart of the city with stunning views and modern amenities. Perfect for families looking for comfort and luxury.',
      highlights: [
        'Panoramic City Views',
        'Premium Finishes',
        'Energy Efficient',
        'Natural Light',
        'Quiet Neighborhood'
      ]
    },
    {
      id: 2,
      title: 'Modern Apartment',
      location: 'Central',
      type: 'apartment',
      price: 450000,
      status: 'booked',
      beds: 2,
      baths: 2,
      size: '1500 sqft',
      amenities: ['gym', 'spa', 'wifi', 'security'],
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
      features: [
        'Modern Design',
        'Central Location',
        'High Speed Internet',
        '24/7 Concierge',
        'Swimming Pool',
        'Fitness Center'
      ],
      description: 'Sleek and modern apartment in the heart of the city with all modern amenities and excellent location.',
      highlights: [
        'City Center',
        'Modern Interiors',
        'Great Views',
        'Luxury Amenities',
        '24/7 Support'
      ]
    },
    {
      id: 3,
      title: 'Family House',
      location: 'Suburbs',
      type: 'house',
      price: 650000,
      status: 'available',
      beds: 5,
      baths: 4,
      size: '3500 sqft',
      amenities: ['garden', 'wifi', 'pet-friendly', 'pool', 'playground'],
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
      features: [
        'Family-Friendly',
        'Quiet Neighborhood',
        'Private Garden',
        'Home Office',
        'Playroom',
        'BBQ Area'
      ],
      description: 'Perfect family home with spacious living areas and private garden. Ideal for growing families.',
      highlights: [
        'Family-Friendly',
        'Private Garden',
        'Quiet Area',
        'Playground',
        'Safe Neighborhood'
      ]
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = property.price >= priceRange.min && property.price <= priceRange.max;
    const matchesType = !selectedType || property.type === selectedType;
    const matchesStatus = !selectedStatus || property.status === selectedStatus.toLowerCase();
    return matchesSearch && matchesPrice && matchesType && matchesStatus;
  });

  const handleAddProperty = () => {
    // Open modal or navigate to add property page
    console.log('Add new property clicked');
  };

  const handleDeleteProperty = (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      setProperties(properties.filter(property => property.id !== id));
    }
  };

  return (
    <div className="property-dashboard">
      <div className="dashboard-header">
        <h1>Properties</h1>
        <button className="add-property-btn" onClick={handleAddProperty}>
          <i className="fas fa-plus"></i>
          Add New Property
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Properties</h3>
          <span className="stat-number">{properties.length}</span>
        </div>
        <div className="stat-card">
          <h3>Available</h3>
          <span className="stat-number">{properties.filter(p => p.status === 'available').length}</span>
        </div>
        <div className="stat-card">
          <h3>Booked</h3>
          <span className="stat-number">{properties.filter(p => p.status === 'booked').length}</span>
        </div>
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <label>Status</label>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type</label>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="villa">Villa</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
          </select>
        </div>

        <div className="filter-group price-range">
          <label>Price Range</label>
          <div className="price-range-inputs">
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
              placeholder="$0"
              className="price-input"
            />
            <span className="price-separator">-</span>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
              placeholder="$1,000,000"
              className="price-input"
            />
          </div>
        </div>

        <div className="filter-group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="search-input"
          />
        </div>
      </div>

      <div className="property-grid">
        {filteredProperties.map((property) => (
          <div key={property.id} className="property-card">
            <div className="property-image">
              <img src={property.image} alt={property.title} />
              <div className="quick-view-btn">
                <i className="fas fa-eye"></i>
              </div>
            </div>
            <div className="property-info">
              <div className="property-header">
                <h3>{property.title}</h3>
                <div className="property-meta">
                  <span className="property-type">{property.type}</span>
                  <span className="property-status" style={{
                    backgroundColor: property.status === 'available' ? '#dcfce7' : '#fee2e2',
                    color: property.status === 'available' ? '#16a34a' : '#ef4444'
                  }}>{property.status.charAt(0).toUpperCase() + property.status.slice(1)}</span>
                </div>
              </div>
              <p className="property-location">{property.location}</p>
              <div className="property-specs">
                <div className="spec-item">
                  <i className="fas fa-bed"></i>
                  <span>{property.beds} Beds</span>
                </div>
                <div className="spec-item">
                  <i className="fas fa-bath"></i>
                  <span>{property.baths} Baths</span>
                </div>
                <div className="spec-item">
                  <i className="fas fa-ruler-combined"></i>
                  <span>{property.size}</span>
                </div>
              </div>
              <div className="property-features">
                <h4>Features</h4>
                <div className="features-grid">
                  {property.features.map((feature, index) => (
                    <span key={index} className="feature-item">
                      <i className="fas fa-check-circle"></i>
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div className="property-highlights">
                <h4>Highlights</h4>
                <div className="highlights-grid">
                  {property.highlights.map((highlight, index) => (
                    <span key={index} className="highlight-item">
                      <i className="fas fa-star"></i>
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
              <div className="property-amenities">
                <h4>Amenities</h4>
                <div className="amenities-grid">
                  {property.amenities.map((amenity, index) => (
                    <span key={index} className="amenity-tag">
                      <i className="fas fa-check"></i>
                      {amenity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
              <div className="property-price">
                <span className="price-label">Price:</span>
                <span className="price-value">${property.price.toLocaleString()}</span>
              </div>
              <div className="property-actions">
                <button className="action-btn view-btn">View Details</button>
                <button className="action-btn edit-btn">
                  <i className="fas fa-edit"></i>
                </button>
                <button className="action-btn delete-btn" onClick={() => handleDeleteProperty(property.id)}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyList;
